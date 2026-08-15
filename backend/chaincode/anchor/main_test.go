package main

import (
	"strings"
	"testing"
)

func TestParseAnchorAcceptsMinimizedSchema(t *testing.T) {
	raw := `{"schemaVersion":1,"eventId":"019c011e-70b0-7000-8000-000000000001","eventType":"CLINICAL_RECORD_SIGNED","payloadDigest":"` + strings.Repeat("a", 64) + `","policyVersion":"v1","organization":"HospitalMSP","occurredAt":"2026-08-02T00:00:00Z"}`
	anchor, err := parseAnchor(raw)
	if err != nil {
		t.Fatalf("expected valid anchor: %v", err)
	}
	if anchor.Organization != "HospitalMSP" || anchor.EventType != "CLINICAL_RECORD_SIGNED" {
		t.Fatalf("unexpected anchor: %#v", anchor)
	}
}

func TestParseAnchorRejectsUnknownOrIdentifyingFields(t *testing.T) {
	base := `{"schemaVersion":1,"eventId":"019c011e-70b0-7000-8000-000000000001","eventType":"AUDIT","payloadDigest":"` + strings.Repeat("b", 64) + `","policyVersion":"v1","organization":"HospitalMSP","occurredAt":"2026-08-02T00:00:00Z"`
	for _, extra := range []string{`,"patientId":"patient-1"}`, `,"objectKey":"clean/private-record"}`, `,"diagnosis":"malaria"}`} {
		if _, err := parseAnchor(base + extra); err == nil {
			t.Fatalf("expected unknown field to be rejected: %s", extra)
		}
	}
}

func TestParseAnchorRejectsMalformedDigestAndEvent(t *testing.T) {
	raw := `{"schemaVersion":1,"eventId":"not-a-uuid","eventType":"PATIENT_DATA","payloadDigest":"short","policyVersion":"v1","organization":"HospitalMSP","occurredAt":"2026-08-02T00:00:00Z"}`
	if _, err := parseAnchor(raw); err == nil {
		t.Fatal("expected malformed anchor to be rejected")
	}
}
