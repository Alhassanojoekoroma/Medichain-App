package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type AnchorContract struct{ contractapi.Contract }
type Anchor struct {
	SchemaVersion int    `json:"schemaVersion"`
	EventID       string `json:"eventId"`
	EventType     string `json:"eventType"`
	PayloadDigest string `json:"payloadDigest"`
	PolicyVersion string `json:"policyVersion"`
	Organization  string `json:"organization"`
	OccurredAt    string `json:"occurredAt"`
}

var uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`)
var digestPattern = regexp.MustCompile(`^[0-9a-f]{64}$`)
var eventTypes = map[string]bool{"AUDIT": true, "CONSENT_GRANTED": true, "CONSENT_REVOKED": true, "CLINICAL_RECORD_SIGNED": true, "ACCESS_DECISION": true}
var approvedMSPs = map[string]bool{"MoHMSP": true, "HospitalMSP": true}

func authorize(ctx contractapi.TransactionContextInterface, allowedRoles ...string) error {
	mspID, err := ctx.GetClientIdentity().GetMSPID(); if err != nil || !approvedMSPs[mspID] { return fmt.Errorf("submitting MSP is not approved") }
	role, found, err := ctx.GetClientIdentity().GetAttributeValue("palmchain.role"); if err != nil || !found { return fmt.Errorf("palmchain.role attribute is required") }
	for _, allowed := range allowedRoles { if role == allowed { return nil } }
	return fmt.Errorf("client role is not authorized")
}

func parseAnchor(raw string) (*Anchor, error) {
	decoder := json.NewDecoder(bytes.NewBufferString(raw)); decoder.DisallowUnknownFields()
	var anchor Anchor
	if err := decoder.Decode(&anchor); err != nil { return nil, fmt.Errorf("anchor schema invalid: %v", err) }
	if anchor.SchemaVersion != 1 || !uuidPattern.MatchString(anchor.EventID) || !eventTypes[anchor.EventType] || !digestPattern.MatchString(anchor.PayloadDigest) { return nil, fmt.Errorf("anchor fields invalid") }
	if _, err := time.Parse(time.RFC3339, anchor.OccurredAt); err != nil { return nil, fmt.Errorf("occurredAt invalid") }
	return &anchor, nil
}

func (c *AnchorContract) PutAnchor(ctx contractapi.TransactionContextInterface, raw string) error {
	if err := authorize(ctx, "anchor-writer"); err != nil { return err }
	anchor, err := parseAnchor(raw); if err != nil { return err }
	existing, err := ctx.GetStub().GetState(anchor.EventID); if err != nil { return err }
	encoded, _ := json.Marshal(anchor)
	if existing != nil { if bytes.Equal(existing, encoded) { return nil }; return fmt.Errorf("eventId already exists with different content") }
	return ctx.GetStub().PutState(anchor.EventID, encoded)
}

func (c *AnchorContract) ReadAnchor(ctx contractapi.TransactionContextInterface, eventID string) (*Anchor, error) {
	if err := authorize(ctx, "anchor-writer", "anchor-auditor", "consortium-admin"); err != nil { return nil, err }
	raw, err := ctx.GetStub().GetState(eventID); if err != nil || raw == nil { return nil, fmt.Errorf("anchor not found") }
	var anchor Anchor; if err := json.Unmarshal(raw, &anchor); err != nil { return nil, err }; return &anchor, nil
}

func main() { chaincode, err := contractapi.NewChaincode(&AnchorContract{}); if err != nil { log.Fatal(err) }; if err := chaincode.Start(); err != nil { log.Fatal(err) } }
