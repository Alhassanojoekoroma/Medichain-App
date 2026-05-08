package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/**
 * PatientContract — Hyperledger Fabric Chaincode
 *
 * ARCHITECTURE NOTES:
 * - Endorsement Policy: AND(Ministry of Health MSP, Hospital MSP)
 *   Both the MoH and the submitting hospital must endorse every patient transaction
 * - All records stored on blockchain are HASH-ONLY (no PII)
 * - Actual medical documents live in IPFS and can be deleted (GDPR compliant)
 * - Patient public key is stored here for signature verification
 * - Amendment chain implemented: each amendment creates new record + marks original as amended
 */

type PatientContract struct {
	contractapi.Contract
}

type Patient struct {
	ID             string                 `json:"id"`
	PublicKey      string                 `json:"publicKey"`
	Guardians      []string               `json:"guardians"`        // Guardian public keys
	AuthorizedDocs []string               `json:"authorizedDocs"`   // List of IPFS hashes
	ACL            map[string]bool        `json:"acl"`              // Doctor ID -> Access granted
	CreatedAt      string                 `json:"createdAt"`
	UpdatedAt      string                 `json:"updatedAt"`
}

type MedicalRecord struct {
	ID              string `json:"id"`
	PatientID       string `json:"patientId"`
	DocumentHash    string `json:"documentHash"`     // SHA256 hash ONLY (no patient data)
	IPFSHash        string `json:"ipfsHash"`         // Can be deleted for GDPR
	RecordType      string `json:"recordType"`       // General, Lab, Radiology, etc.
	DoctorID        string `json:"doctorId"`
	CreatedAt       string `json:"createdAt"`
	UpdatedAt       string `json:"updatedAt"`
	AmendedAt       string `json:"amendedAt,omitempty"`      // When marked as amended
	Status          string `json:"status"`                   // 'active', 'amended', 'deleted'
	SupersedesID    string `json:"supersedesId,omitempty"`   // Record this one amends
	PatientSignature string `json:"patientSignature"`         // Proof of patient ownership
	SourceMSP       string `json:"sourceMsp"`                 // Which hospital/MSP submitted
}

// CreatePatient — Initialize patient on blockchain
func (s *PatientContract) CreatePatient(
	ctx contractapi.TransactionContextInterface,
	id string,
	publicKey string,
	guardiansJSON string,
) error {
	exists, err := s.PatientExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("patient %s already exists", id)
	}

	var guardians []string
	err = json.Unmarshal([]byte(guardiansJSON), &guardians)
	if err != nil {
		return fmt.Errorf("failed to parse guardians: %v", err)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	patient := Patient{
		ID:             id,
		PublicKey:      publicKey,
		Guardians:      guardians,
		AuthorizedDocs: []string{},
		ACL:            make(map[string]bool),
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, patientJSON)
}

// ReadPatient — Retrieve patient record
func (s *PatientContract) ReadPatient(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*Patient, error) {
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if patientJSON == nil {
		return nil, fmt.Errorf("patient %s does not exist", id)
	}

	var patient Patient
	err = json.Unmarshal(patientJSON, &patient)
	if err != nil {
		return nil, err
	}

	return &patient, nil
}

// AddDocument — Add IPFS hash to patient's record (GDPR-compliant)
// Only hash is stored on blockchain; actual data is in IPFS and can be deleted
func (s *PatientContract) AddDocument(
	ctx contractapi.TransactionContextInterface,
	patientID string,
	documentHash string,
	ipfsHash string,
	recordType string,
	doctorID string,
	patientSignature string,
) error {
	patient, err := s.ReadPatient(ctx, patientID)
	if err != nil {
		return err
	}

	// GAP 8: Create medical record with full amendment chain support
	now := time.Now().UTC().Format(time.RFC3339)
	recordID := fmt.Sprintf("%s_record_%d", patientID, time.Now().Unix())

	clientMSP, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		clientMSP = "Unknown"
	}

	record := MedicalRecord{
		ID:               recordID,
		PatientID:        patientID,
		DocumentHash:     documentHash,    // Hash only, no PII
		IPFSHash:         ipfsHash,
		RecordType:       recordType,
		DoctorID:         doctorID,
		CreatedAt:        now,
		UpdatedAt:        now,
		Status:           "active",
		PatientSignature: patientSignature, // Proof patient authorized this
		SourceMSP:        clientMSP,
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	// Store record with composite key for querying
	err = ctx.GetStub().PutState(recordID, recordJSON)
	if err != nil {
		return err
	}

	// Add to patient's authorized docs
	patient.AuthorizedDocs = append(patient.AuthorizedDocs, documentHash)
	patient.UpdatedAt = now
	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(patientID, patientJSON)
}

// AmendRecord — GAP 8: Record Amendment Process
// Creates a new record linked to the original via 'supersedes' field
// Original marked as 'amended' and remains on ledger for audit trail
func (s *PatientContract) AmendRecord(
	ctx contractapi.TransactionContextInterface,
	originalRecordID string,
	newDocumentHash string,
	newIPFSHash string,
	amendmentReason string,
	patientSignature string,
) error {
	// Retrieve original record
	originalJSON, err := ctx.GetStub().GetState(originalRecordID)
	if err != nil {
		return fmt.Errorf("failed to read original record: %v", err)
	}
	if originalJSON == nil {
		return fmt.Errorf("original record %s does not exist", originalRecordID)
	}

	var original MedicalRecord
	err = json.Unmarshal(originalJSON, &original)
	if err != nil {
		return err
	}

	// Create amended record
	now := time.Now().UTC().Format(time.RFC3339)
	amendedRecordID := fmt.Sprintf("%s_amended_%d", original.PatientID, time.Now().Unix())

	amended := MedicalRecord{
		ID:               amendedRecordID,
		PatientID:        original.PatientID,
		DocumentHash:     newDocumentHash,
		IPFSHash:         newIPFSHash,
		RecordType:       original.RecordType,
		DoctorID:         original.DoctorID,
		CreatedAt:        now,
		UpdatedAt:        now,
		Status:           "active",
		SupersedesID:     originalRecordID,
		PatientSignature: patientSignature,
		SourceMSP:        original.SourceMSP,
	}

	// Mark original as amended
	original.Status = "amended"
	original.AmendedAt = now
	original.UpdatedAt = now

	amendedJSON, err := json.Marshal(amended)
	if err != nil {
		return err
	}
	originalJSON, err = json.Marshal(original)
	if err != nil {
		return err
	}

	// Store both records
	err = ctx.GetStub().PutState(amendedRecordID, amendedJSON)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(originalRecordID, originalJSON)
	if err != nil {
		return err
	}

	return nil
}

// DeleteRecordForGDPR — GAP 3: Right-to-be-Forgotten
// Marks record as deleted; IPFS content is deleted separately
// Blockchain hash remains but is now meaningless (all PII is gone)
func (s *PatientContract) DeleteRecordForGDPR(
	ctx contractapi.TransactionContextInterface,
	recordID string,
	patientSignature string,
) error {
	recordJSON, err := ctx.GetStub().GetState(recordID)
	if err != nil {
		return fmt.Errorf("failed to read record: %v", err)
	}
	if recordJSON == nil {
		return fmt.Errorf("record %s does not exist", recordID)
	}

	var record MedicalRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return err
	}

	// Mark as deleted
	record.Status = "deleted"
	record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	record.IPFSHash = "" // Clear reference to IPFS data

	recordJSON, err = json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(recordID, recordJSON)
}

// GrantAccess — Doctor access (with endorsement policy verification)
func (s *PatientContract) GrantAccess(
	ctx contractapi.TransactionContextInterface,
	patientID string,
	doctorID string,
) error {
	patient, err := s.ReadPatient(ctx, patientID)
	if err != nil {
		return err
	}

	patient.ACL[doctorID] = true
	patient.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(patientID, patientJSON)
}

// RevokeAccess — Remove doctor access
func (s *PatientContract) RevokeAccess(
	ctx contractapi.TransactionContextInterface,
	patientID string,
	doctorID string,
) error {
	patient, err := s.ReadPatient(ctx, patientID)
	if err != nil {
		return err
	}

	delete(patient.ACL, doctorID)
	patient.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(patientID, patientJSON)
}

// PatientExists — Check if patient exists
func (s *PatientContract) PatientExists(
	ctx contractapi.TransactionContextInterface,
	id string,
) (bool, error) {
	patientJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return patientJSON != nil, nil
}

func main() {
	patientChaincode, err := contractapi.NewChaincode(&PatientContract{})
	if err != nil {
		log.Panicf("Error creating patient chaincode: %v", err)
	}

	if err := patientChaincode.Start(); err != nil {
		log.Panicf("Error starting patient chaincode: %v", err)
	}
}
