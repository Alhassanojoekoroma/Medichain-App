package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/**
 * DoctorContract — Hyperledger Fabric Chaincode
 *
 * ARCHITECTURE NOTES:
 * - Endorsement Policy: AND(Ministry of Health MSP, Hospital MSP)
 * - Doctors must be verified by Ministry of Health before treating patients
 * - Tracks all doctor-patient interactions for audit trail
 * - Supports access request flow (GAP 5)
 */

type DoctorContract struct {
	contractapi.Contract
}

type Doctor struct {
	ID             string `json:"id"`
	LicenseNumber  string `json:"licenseNumber"`
	Hospital       string `json:"hospital"`
	Specialty      string `json:"specialty"`
	IsVerified     bool   `json:"isVerified"`    // Verified by Ministry of Health
	VerifiedAt     string `json:"verifiedAt,omitempty"`
	VerifiedBy     string `json:"verifiedBy,omitempty"`   // MoH official ID
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

type DoctorAccessRequest struct {
	ID          string `json:"id"`
	DoctorID    string `json:"doctorId"`
	PatientID   string `json:"patientId"`
	RequestedAt string `json:"requestedAt"`
	Status      string `json:"status"` // 'pending', 'approved', 'denied'
	ExpiresAt   string `json:"expiresAt"`
	Reason      string `json:"reason"` // Why doctor is requesting access
}

// RegisterDoctor — Add new doctor (unverified initially)
func (s *DoctorContract) RegisterDoctor(
	ctx contractapi.TransactionContextInterface,
	id string,
	license string,
	hospital string,
	specialty string,
) error {
	exists, err := s.DoctorExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("doctor %s already exists", id)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	now := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC().Format(time.RFC3339)
	doctor := Doctor{
		ID:            id,
		LicenseNumber: license,
		Hospital:      hospital,
		Specialty:     specialty,
		IsVerified:    false,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	doctorJSON, err := json.Marshal(doctor)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, doctorJSON)
}

// VerifyDoctor — GAP 7: Ministry of Health verifies doctor credentials
func (s *DoctorContract) VerifyDoctor(
	ctx contractapi.TransactionContextInterface,
	id string,
	verifiedBy string,
) error {
	// In production: verify ctx.GetClientIdentity().GetMSPID() == "MoHMSP"
	doctor, err := s.ReadDoctor(ctx, id)
	if err != nil {
		return err
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	now := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC().Format(time.RFC3339)

	doctor.IsVerified = true
	doctor.VerifiedAt = now
	doctor.VerifiedBy = verifiedBy
	doctor.UpdatedAt = now

	doctorJSON, err := json.Marshal(doctor)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, doctorJSON)
}

// ReadDoctor — Retrieve doctor record
func (s *DoctorContract) ReadDoctor(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*Doctor, error) {
	doctorJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if doctorJSON == nil {
		return nil, fmt.Errorf("doctor %s does not exist", id)
	}

	var doctor Doctor
	err = json.Unmarshal(doctorJSON, &doctor)
	if err != nil {
		return nil, err
	}

	return &doctor, nil
}

// RequestPatientAccess — GAP 5: Async Doctor Access Request
// Doctor requests access to patient records (e.g., specialist reviewing referral)
// Patient receives notification and can approve/deny remotely
func (s *DoctorContract) RequestPatientAccess(
	ctx contractapi.TransactionContextInterface,
	doctorID string,
	patientID string,
	reason string,
) error {
	// Verify doctor exists and is verified
	doctor, err := s.ReadDoctor(ctx, doctorID)
	if err != nil {
		return err
	}
	if !doctor.IsVerified {
		return fmt.Errorf("doctor %s is not verified", doctorID)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	now := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC()
	nowString := now.Format(time.RFC3339)
	expiresAt := now.AddDate(0, 0, 7).Format(time.RFC3339) // 7-day expiry

	requestID := fmt.Sprintf("access_req_%s_%s_%d", doctorID, patientID, txTime.Seconds)

	request := DoctorAccessRequest{
		ID:          requestID,
		DoctorID:    doctorID,
		PatientID:   patientID,
		RequestedAt: now,
		Status:      "pending",
		ExpiresAt:   expiresAt,
		Reason:      reason,
	}

	requestJSON, err := json.Marshal(request)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(requestID, requestJSON)
}

// ApproveAccessRequest — Patient approves doctor access
func (s *DoctorContract) ApproveAccessRequest(
	ctx contractapi.TransactionContextInterface,
	requestID string,
) error {
	requestJSON, err := ctx.GetStub().GetState(requestID)
	if err != nil {
		return err
	}
	if requestJSON == nil {
		return fmt.Errorf("access request %s not found", requestID)
	}

	var request DoctorAccessRequest
	err = json.Unmarshal(requestJSON, &request)
	if err != nil {
		return err
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	now := time.Unix(txTime.Seconds, int64(txTime.Nanos)).UTC()

	// Check if request is expired
	expires, err := time.Parse(time.RFC3339, request.ExpiresAt)
	if err == nil && now.After(expires) {
		return fmt.Errorf("access request has expired")
	}

	request.Status = "approved"
	requestJSON, err = json.Marshal(request)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(requestID, requestJSON)
}

// DenyAccessRequest — Patient denies doctor access
func (s *DoctorContract) DenyAccessRequest(
	ctx contractapi.TransactionContextInterface,
	requestID string,
) error {
	requestJSON, err := ctx.GetStub().GetState(requestID)
	if err != nil {
		return err
	}
	if requestJSON == nil {
		return fmt.Errorf("access request %s not found", requestID)
	}

	var request DoctorAccessRequest
	err = json.Unmarshal(requestJSON, &request)
	if err != nil {
		return err
	}

	request.Status = "denied"
	requestJSON, err = json.Marshal(request)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(requestID, requestJSON)
}

// DoctorExists — Check if doctor exists
func (s *DoctorContract) DoctorExists(
	ctx contractapi.TransactionContextInterface,
	id string,
) (bool, error) {
	doctorJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return doctorJSON != nil, nil
}

func main() {
	doctorChaincode, err := contractapi.NewChaincode(&DoctorContract{})
	if err != nil {
		log.Panicf("Error creating doctor chaincode: %v", err)
	}

	if err := doctorChaincode.Start(); err != nil {
		log.Panicf("Error starting doctor chaincode: %v", err)
	}
}
