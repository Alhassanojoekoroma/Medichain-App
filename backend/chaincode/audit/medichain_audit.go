package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/**
 * AuditContract — Hyperledger Fabric Chaincode
 *
 * ARCHITECTURE NOTES:
 * - Immutable audit log for all actions in the system
 * - Queryable by actor (doctor, patient, system) and subject (whose data was accessed)
 * - Supports CouchDB rich queries for comprehensive audit trails
 * - Required for regulatory compliance (HIPAA, GDPR audit requirements)
 */

type AuditContract struct {
	contractapi.Contract
}

type AuditLog struct {
	ID        string `json:"id"`
	Timestamp string `json:"timestamp"`
	ActorID   string `json:"actorId"`    // Who performed the action
	ActorRole string `json:"actorRole"`  // doctor, patient, admin, system
	SubjectID string `json:"subjectId"`  // Who the action affected
	Action    string `json:"action"`     // VIEW_RECORD, GRANT_ACCESS, ADD_RECORD, etc.
	Details   string `json:"details"`
	Status    string `json:"status"`     // success, failure
}

// AddAuditLog — Create a new immutable audit entry
func (s *AuditContract) AddAuditLog(
	ctx contractapi.TransactionContextInterface,
	id string,
	actor string,
	actorRole string,
	subject string,
	action string,
	details string,
	status string,
) error {
	exists, err := s.LogExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("log %s already exists", id)
	}

	txTime, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return err
	}

	timestamp := time.Unix(txTime.Seconds, int64(txTime.Nanos)).Format(time.RFC3339)

	logEntry := AuditLog{
		ID:        id,
		Timestamp: timestamp,
		ActorID:   actor,
		ActorRole: actorRole,
		SubjectID: subject,
		Action:    action,
		Details:   details,
		Status:    status,
	}

	logJSON, err := json.Marshal(logEntry)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, logJSON)
}

// ReadLog — Retrieve a specific audit entry
func (s *AuditContract) ReadLog(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*AuditLog, error) {
	logJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if logJSON == nil {
		return nil, fmt.Errorf("log %s does not exist", id)
	}

	var logEntry AuditLog
	err = json.Unmarshal(logJSON, &logEntry)
	if err != nil {
		return nil, err
	}

	return &logEntry, nil
}

// GetAuditTrailByActor — Query all actions performed by an actor (doctor, patient, etc.)
// Used for: "What has Dr. Smith done?" audits
// Example: doctor compliance review, finding unauthorized access attempts
func (s *AuditContract) GetAuditTrailByActor(
	ctx contractapi.TransactionContextInterface,
	actorId string,
) ([]*AuditLog, error) {
	queryString := fmt.Sprintf(`{"selector":{"actorId":"%s"}}`, actorId)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs by actor: %v", err)
	}
	defer resultsIterator.Close()

	var logs []*AuditLog
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var logEntry AuditLog
		err = json.Unmarshal(queryResponse.Value, &logEntry)
		if err != nil {
			return nil, err
		}
		logs = append(logs, &logEntry)
	}

	return logs, nil
}

// GetAuditTrailBySubject — Query all actions affecting a subject (patient, record, etc.)
// Used for: "Who accessed this patient's records?" audits
// Example: GDPR right-to-access request, finding all data access
func (s *AuditContract) GetAuditTrailBySubject(
	ctx contractapi.TransactionContextInterface,
	subjectId string,
) ([]*AuditLog, error) {
	queryString := fmt.Sprintf(`{"selector":{"subjectId":"%s"}}`, subjectId)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs by subject: %v", err)
	}
	defer resultsIterator.Close()

	var logs []*AuditLog
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var logEntry AuditLog
		err = json.Unmarshal(queryResponse.Value, &logEntry)
		if err != nil {
			return nil, err
		}
		logs = append(logs, &logEntry)
	}

	return logs, nil
}

// GetAuditTrailByAction — Query all instances of a specific action (e.g., all "VIEW_RECORD" events)
// Used for: "How many times were records accessed?" analytics
func (s *AuditContract) GetAuditTrailByAction(
	ctx contractapi.TransactionContextInterface,
	action string,
) ([]*AuditLog, error) {
	queryString := fmt.Sprintf(`{"selector":{"action":"%s"}}`, action)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs by action: %v", err)
	}
	defer resultsIterator.Close()

	var logs []*AuditLog
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var logEntry AuditLog
		err = json.Unmarshal(queryResponse.Value, &logEntry)
		if err != nil {
			return nil, err
		}
		logs = append(logs, &logEntry)
	}

	return logs, nil
}

// LogExists — Check if an audit entry exists
func (s *AuditContract) LogExists(
	ctx contractapi.TransactionContextInterface,
	id string,
) (bool, error) {
	logJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return logJSON != nil, nil
}

func main() {
	auditChaincode, err := contractapi.NewChaincode(&AuditContract{})
	if err != nil {
		log.Panicf("Error creating audit chaincode: %v", err)
	}

	if err := auditChaincode.Start(); err != nil {
		log.Panicf("Error starting audit chaincode: %v", err)
	}
}
