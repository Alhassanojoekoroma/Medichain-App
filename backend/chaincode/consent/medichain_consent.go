package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/**
 * ConsentContract — Hyperledger Fabric Chaincode
 *
 * Implements the on-chain registry for patient data access consent and revocation.
 * While the primary logic is run in the backend API (for speed and offline sync),
 * the ultimate source of truth for audits is this chaincode.
 */

type ConsentContract struct {
	contractapi.Contract
}

type ConsentPolicy struct {
	ID             string   `json:"id"`
	PatientID      string   `json:"patientId"`
	GranteeType    string   `json:"granteeType"` // doctor, clinic, role
	GranteeID      string   `json:"granteeId"`
	AccessType     string   `json:"accessType"`  // read, write
	DataCategories []string `json:"dataCategories"`
	ExpiresAt      string   `json:"expiresAt"`   // ISO8601 or empty
	IsRevoked      bool     `json:"isRevoked"`
	RevokedAt      string   `json:"revokedAt"`
	CreatedAt      string   `json:"createdAt"`
}

// RegisterConsent — Add a new consent policy to the ledger
func (s *ConsentContract) RegisterConsent(
	ctx contractapi.TransactionContextInterface,
	id string,
	patientId string,
	granteeType string,
	granteeId string,
	accessType string,
	dataCategoriesJSON string,
	expiresAt string,
) error {
	exists, err := s.ConsentExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("consent %s already exists", id)
	}

	var dataCategories []string
	if err := json.Unmarshal([]byte(dataCategoriesJSON), &dataCategories); err != nil {
		return fmt.Errorf("failed to parse dataCategoriesJSON: %v", err)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	createdAt := time.Unix(txTime.Seconds, int64(txTime.Nanos)).Format(time.RFC3339)

	policy := ConsentPolicy{
		ID:             id,
		PatientID:      patientId,
		GranteeType:    granteeType,
		GranteeID:      granteeId,
		AccessType:     accessType,
		DataCategories: dataCategories,
		ExpiresAt:      expiresAt,
		IsRevoked:      false,
		CreatedAt:      createdAt,
	}

	policyJSON, err := json.Marshal(policy)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, policyJSON)
}

// RevokeConsent — Mark an existing consent policy as revoked
func (s *ConsentContract) RevokeConsent(
	ctx contractapi.TransactionContextInterface,
	id string,
	reason string,
) error {
	policyJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if policyJSON == nil {
		return fmt.Errorf("consent %s does not exist", id)
	}

	var policy ConsentPolicy
	err = json.Unmarshal(policyJSON, &policy)
	if err != nil {
		return err
	}

	if policy.IsRevoked {
		return fmt.Errorf("consent %s is already revoked", id)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}
	revokedAt := time.Unix(txTime.Seconds, int64(txTime.Nanos)).Format(time.RFC3339)

	policy.IsRevoked = true
	policy.RevokedAt = revokedAt

	updatedPolicyJSON, err := json.Marshal(policy)
	if err != nil {
		return err
	}

	// Emit an event for downstream listeners (e.g. invalidating tokens in real-time)
	err = ctx.GetStub().SetEvent("ConsentRevoked", []byte(fmt.Sprintf(`{"id":"%s","patientId":"%s","granteeId":"%s","reason":"%s"}`, policy.ID, policy.PatientID, policy.GranteeID, reason)))
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, updatedPolicyJSON)
}

// CheckConsent — Retrieve a consent policy to verify it locally
func (s *ConsentContract) CheckConsent(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*ConsentPolicy, error) {
	policyJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if policyJSON == nil {
		return nil, fmt.Errorf("consent %s does not exist", id)
	}

	var policy ConsentPolicy
	err = json.Unmarshal(policyJSON, &policy)
	if err != nil {
		return nil, err
	}

	return &policy, nil
}

// ConsentExists returns true when consent with given ID exists in world state
func (s *ConsentContract) ConsentExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	policyJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return policyJSON != nil, nil
}

func main() {
	consentChaincode, err := contractapi.NewChaincode(&ConsentContract{})
	if err != nil {
		log.Panicf("Error creating consent chaincode: %v", err)
	}

	if err := consentChaincode.Start(); err != nil {
		log.Panicf("Error starting consent chaincode: %v", err)
	}
}
