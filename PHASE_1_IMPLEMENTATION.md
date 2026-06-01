# Phase 1 Implementation: IPFS + Fabric Notarization

## Summary

This phase implements real IPFS pinning (via web3.storage) and Hyperledger Fabric blockchain notarization for medical records. All transactions are queued locally and synced to the blockchain asynchronously.

**Status**: ✅ Complete

---

## What Was Implemented

### 1. **IPFS Storage Integration** (`backend/api/services/IPFSStorage.js`)
- Real IPFS pinning via web3.storage
- Uploads medical documents with automatic retry
- Returns IPFS CID + SHA-256 integrity hash
- Gateway URL generation for retrieval

### 2. **Fabric Gateway** (`backend/api/services/FabricGateway.js`)
- Connects to Hyperledger Fabric network
- Submits transactions to 3 chaincode contracts:
  - `medichain-audit`: Log access events
  - `medichain-consent`: Register/revoke consents
  - `medichain-patient`: Notarize record hashes
- Handles wallet authentication
- Fallback read-only mode if admin identity missing

### 3. **Offline Queue** (`backend/api/services/OfflineQueue.js`)
- PostgreSQL-backed queue for reliable sync
- Persists all transactions locally first
- Tracks retry count and errors
- Supports: AUDIT_LOG, CONSENT, NOTARIZE_RECORD, REVOCATION events

### 4. **Sync Scheduler** (`backend/api/services/SyncScheduler.js`)
- Background worker that periodically syncs queue to Fabric
- Configurable sync interval (default: 30 seconds)
- Exponential backoff for failed retries (max 5 attempts)
- Auto-starts on server launch

### 5. **Updated API Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ipfs/upload` | POST | Upload file to IPFS, get CID + integrity hash |
| `/api/blockchain/notarize` | POST | Notarize record on Fabric (queues if offline) |
| `/api/sync/blockchain` | POST | Manually trigger sync of pending transactions |
| `/api/health` | GET | System health + service status |

---

## How to Use

### **Step 1: Install Dependencies**

```bash
cd backend/api
npm install
```

### **Step 2: Configure Environment**

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required variables**:

```env
DATABASE_URL=postgresql://user:pass@localhost/medichain
WEB3_STORAGE_TOKEN=eyJhbGc... # Get from https://web3.storage/
FABRIC_CONNECTION_PROFILE=../../medichain-network/connection-profile.json
FABRIC_WALLET_PATH=./wallet
FABRIC_LOCALNET=true
```

### **Step 3: Start the Server**

```bash
npm start
# or for development
npm run dev
```

### **Step 4: Verify Setup**

```bash
curl http://localhost:3000/api/health | jq
```

Expected response:
```json
{
  "status": "OK",
  "services": {
    "fabric": { "connected": true, "hasAuditContract": true, ... },
    "ipfs": { "configured": true, "gateway": "https://w3s.link/ipfs/" },
    "queue": { "pending": 0, "synced": 42, "failed": 0 }
  }
}
```

---

## Usage Examples

### **Upload a Medical Record to IPFS**

```bash
curl -X POST http://localhost:3000/api/ipfs/upload \
  -F "document=@medical-scan.pdf"
```

Response:
```json
{
  "cid": "bafyreih...",
  "integrityHash": "a1b2c3d4...",
  "gateway": "https://w3s.link/ipfs/bafyreih...",
  "size": 245632
}
```

### **Notarize Record on Blockchain**

```bash
curl -X POST http://localhost:3000/api/blockchain/notarize \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "uuid-here",
    "recordType": "lab_report",
    "ipfsCid": "bafyreih...",
    "integrityHash": "a1b2c3d4...",
    "uploadedBy": "doctor-uuid"
  }'
```

Response:
```json
{
  "recordId": "uuid-here",
  "ipfsCid": "bafyreih...",
  "txHash": "0x1234...",
  "status": "notarized",
  "message": "Record notarized on blockchain"
}
```

### **Manually Sync Pending Transactions**

```bash
curl -X POST http://localhost:3000/api/sync/blockchain
```

Response:
```json
{
  "synced": 5,
  "failed": 0,
  "pending": 0,
  "message": "Synced 5 / 5 transactions"
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Mobile/Web Client               │
│  (Upload Document, Request Access)      │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  API Gateway    │
        │ (index.js)      │
        └────────┬────────┘
                 │
    ┌────────────┼─────────────┐
    │            │             │
    ▼            ▼             ▼
  ┌───┐      ┌────────┐    ┌──────┐
  │OCR│      │ IPFS   │    │Queue │
  └───┘      │Storage │    │Mgr   │
             └────────┘    └──┬───┘
                    │          │
                    ▼          │
                ┌────────┐     │
                │ IPFS   │     │
                │Network │     │
                └────────┘     │
                               ▼
                        ┌─────────────┐
                        │ Fabric Gtwy │
                        └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │         │
                    ▼          ▼         ▼
              ┌─────────┐ ┌────────┐ ┌──────┐
              │ Audit   │ │Consent │ │Patient│
              │Contract │ │Contract│ │Contract
              └─────────┘ └────────┘ └──────┘
                    │          │         │
                    └──────────┼─────────┘
                               │
                        ┌──────▼──────┐
                        │ Fabric Ledger
                        │(Immutable)   │
                        └──────────────┘
```

---

## Database Schema Requirements

The `sync_queue` table must exist (already in `schema.sql`):

```sql
CREATE TABLE sync_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(30) NOT NULL,
  payload     JSONB NOT NULL,
  attempts    INT DEFAULT 0,
  last_error  TEXT,
  synced_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Monitoring & Debugging

### **View Queue Status**

```bash
curl http://localhost:3000/api/health | jq .services.queue
```

### **Check Failed Syncs**

```bash
psql $DATABASE_URL -c "
  SELECT id, event_type, attempts, last_error, created_at
  FROM sync_queue
  WHERE synced_at IS NULL AND attempts > 0
  ORDER BY created_at DESC
  LIMIT 10;
"
```

### **Logs**

Server logs show real-time sync activity:
```
[IPFS] Upload successful: bafyreih...
[Fabric] Record notarized (tx: 0x1234...)
[Queue] Enqueued AUDIT_LOG
[Scheduler] Syncing 3 pending transactions...
```

---

## Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | API server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `WEB3_STORAGE_TOKEN` | - | web3.storage API token |
| `FABRIC_CONNECTION_PROFILE` | `../../medichain-network/connection-profile.json` | Fabric network config path |
| `FABRIC_WALLET_PATH` | `./wallet` | Wallet directory (generated by CA) |
| `FABRIC_LOCALNET` | `true` | Use localhost for Fabric peers |
| `SYNC_INTERVAL_MS` | 30000 | How often to sync queue (ms) |

---

## Next Steps (Phase 2)

1. **Doctor Web Scan Flow** - Complete the ScanQR UI in doctor-web
2. **Access Request Workflow** - Implement async doctor→patient consent requests
3. **Patient Consent Revoke** - Add mobile UI to revoke active consents

---

## Troubleshooting

### "IPFS storage not configured"
→ Set `WEB3_STORAGE_TOKEN` in `.env`

### "Failed to connect to Fabric"
→ Ensure Fabric network is running: `docker-compose up -d` in `medichain-network/`
→ Check connection profile path is correct

### "Wallet path not found"
→ Run Fabric CA enrollment: `fabric-ca-client enroll ...`
→ Ensure `FABRIC_WALLET_PATH` points to correct directory

### Transactions stuck in queue
→ Check logs: `docker-compose logs -f` on Fabric network
→ Manually retry: `curl -X POST http://localhost:3000/api/sync/blockchain`

---

## Files Changed

- ✅ `backend/api/index.js` — Updated endpoints, added imports, added scheduler init
- ✅ `backend/api/package.json` — Added: fabric-network, web3.storage, pg, uuid
- ✅ `backend/api/.env.example` — Updated with Fabric + IPFS vars
- ✨ `backend/api/services/IPFSStorage.js` — NEW
- ✨ `backend/api/services/FabricGateway.js` — NEW
- ✨ `backend/api/services/OfflineQueue.js` — NEW
- ✨ `backend/api/services/SyncScheduler.js` — NEW
