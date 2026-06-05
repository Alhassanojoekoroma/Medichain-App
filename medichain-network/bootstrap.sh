#!/bin/bash
# =============================================================================
# MediChain Hyperledger Fabric Network Bootstrap Script
# Run this from the medichain-network/ directory inside WSL (Ubuntu)
# =============================================================================

set -e  # Exit on any error

# Colours
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[bootstrap]${NC} $1"; }
warn() { echo -e "${YELLOW}[warning]${NC}  $1"; }
fail() { echo -e "${RED}[ERROR]${NC}    $1"; exit 1; }

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAINCODE_DIR="$SCRIPT_DIR/../backend/chaincode"
CHANNEL_ID="medichain"
ORDERER="localhost:7050"
PEER="localhost:7051"

# ─── Step 0: Verify tools ─────────────────────────────────────────────────────
log "Step 0: Checking required tools..."
for tool in cryptogen configtxgen peer docker; do
  if ! command -v $tool &>/dev/null; then
    fail "'$tool' not found. Add Fabric binaries to PATH: export PATH=\$PATH:~/hyperledger-fabric/fabric-samples/bin"
  fi
done
log "All tools found ✓"

# ─── Step 1: Generate crypto materials ────────────────────────────────────────
log "Step 1: Generating cryptographic materials..."
if [ -f "crypto-config/peerOrganizations/org1.medichain.local/peers/peer0.org1.medichain.local/tls/ca.crt" ]; then
  warn "Crypto materials already exist. Skipping. (Delete crypto-config/ to regenerate)"
else
  cryptogen generate --config=crypto-config.yaml --output=crypto-config
  log "Crypto materials generated ✓"
fi

# ─── Step 2: Create channel artifacts ─────────────────────────────────────────
log "Step 2: Creating channel artifacts..."
mkdir -p channel-artifacts
export FABRIC_CFG_PATH=$SCRIPT_DIR

if [ ! -f "channel-artifacts/genesis.block" ]; then
  configtxgen -profile MediChainGenesis -channelID syschannel \
    -outputBlock channel-artifacts/genesis.block
  log "Genesis block created ✓"
else
  warn "genesis.block already exists. Skipping."
fi

if [ ! -f "channel-artifacts/medichain.tx" ]; then
  configtxgen -profile MediChainChannel -channelID $CHANNEL_ID \
    -outputCreateChannelTx channel-artifacts/medichain.tx
  log "Channel TX created ✓"
else
  warn "medichain.tx already exists. Skipping."
fi

configtxgen -profile MediChainChannel -channelID $CHANNEL_ID \
  -outputAnchorPeersUpdate channel-artifacts/Org1MSPanchors.tx \
  -asOrg Org1 2>/dev/null || warn "Anchor peer update skipped (non-fatal)"

# ─── Step 3: Start Docker network ─────────────────────────────────────────────
log "Step 3: Starting Docker containers..."
docker-compose down --volumes 2>/dev/null || true
docker-compose up -d

log "Waiting for containers to be healthy (15s)..."
sleep 15

docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "NAME|medichain|couchdb" || true

# ─── Step 4: Create & join channel ────────────────────────────────────────────
log "Step 4: Creating channel '$CHANNEL_ID'..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH="$SCRIPT_DIR/crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp"
export CORE_PEER_ADDRESS=$PEER
export CORE_PEER_TLS_ENABLED=false

peer channel create \
  -o $ORDERER \
  -c $CHANNEL_ID \
  -f channel-artifacts/medichain.tx \
  --outputBlock channel-artifacts/${CHANNEL_ID}.block

log "Joining peer0 to channel..."
peer channel join -b channel-artifacts/${CHANNEL_ID}.block

log "Updating anchor peers..."
peer channel update \
  -o $ORDERER \
  -c $CHANNEL_ID \
  -f channel-artifacts/Org1MSPanchors.tx 2>/dev/null || warn "Anchor peer update skipped"

log "Channel setup complete ✓"

# ─── Step 5: Package, install, approve & commit all 4 chaincodes ──────────────
log "Step 5: Deploying chaincodes..."

deploy_chaincode() {
  local NAME=$1
  local PATH_DIR=$2
  local LABEL="${NAME}_1.0"
  local TAR="${NAME}.tar.gz"

  log "  → Packaging $NAME..."
  peer lifecycle chaincode package $TAR \
    --path $PATH_DIR \
    --lang golang \
    --label $LABEL

  log "  → Installing $NAME..."
  peer lifecycle chaincode install $TAR

  log "  → Getting package ID for $NAME..."
  local CC_ID
  CC_ID=$(peer lifecycle chaincode queryinstalled 2>/dev/null \
    | grep "$LABEL" | sed 's/.*Package ID: \([^,]*\).*/\1/')

  if [ -z "$CC_ID" ]; then
    fail "Could not find package ID for $LABEL after install"
  fi
  log "  → Package ID: $CC_ID"

  log "  → Approving $NAME..."
  peer lifecycle chaincode approveformyorg \
    -o $ORDERER \
    -C $CHANNEL_ID \
    -n $NAME \
    --package-id "$CC_ID" \
    --version 1.0 \
    --sequence 1

  log "  → Committing $NAME..."
  peer lifecycle chaincode commit \
    -o $ORDERER \
    -C $CHANNEL_ID \
    -n $NAME \
    --version 1.0 \
    --sequence 1

  log "  ✅ $NAME deployed"
}

deploy_chaincode "medichain-patient" "$CHAINCODE_DIR/patient"
deploy_chaincode "medichain-doctor"  "$CHAINCODE_DIR/doctor"
deploy_chaincode "medichain-audit"   "$CHAINCODE_DIR/audit"
deploy_chaincode "medichain-consent" "$CHAINCODE_DIR/consent"

# ─── Step 6: Verify deployments ───────────────────────────────────────────────
log "Step 6: Verifying chaincode deployments..."
peer lifecycle chaincode querycommitted -C $CHANNEL_ID 2>/dev/null || warn "Query committed skipped"

# ─── Step 7: Update backend .env ──────────────────────────────────────────────
log "Step 7: Updating backend .env..."
ENV_FILE="$SCRIPT_DIR/../backend/.env"

# Backup existing .env
cp "$ENV_FILE" "${ENV_FILE}.bak" 2>/dev/null || true

# Set/update FABRIC_MODE to real
if grep -q "^FABRIC_MODE=" "$ENV_FILE" 2>/dev/null; then
  sed -i 's/^FABRIC_MODE=.*/FABRIC_MODE=real/' "$ENV_FILE"
else
  echo "FABRIC_MODE=real" >> "$ENV_FILE"
fi

if grep -q "^FABRIC_PEER_ENDPOINT=" "$ENV_FILE" 2>/dev/null; then
  sed -i 's|^FABRIC_PEER_ENDPOINT=.*|FABRIC_PEER_ENDPOINT=peer0.org1.medichain.local:7051|' "$ENV_FILE"
else
  echo "FABRIC_PEER_ENDPOINT=peer0.org1.medichain.local:7051" >> "$ENV_FILE"
fi

if grep -q "^FABRIC_MSP_ID=" "$ENV_FILE" 2>/dev/null; then
  sed -i 's/^FABRIC_MSP_ID=.*/FABRIC_MSP_ID=Org1MSP/' "$ENV_FILE"
else
  echo "FABRIC_MSP_ID=Org1MSP" >> "$ENV_FILE"
fi

log "backend/.env updated ✓"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ MediChain Hyperledger Fabric network is LIVE!          ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  CA:      http://localhost:7054"
echo "  Orderer: localhost:7050"
echo "  Peer0:   localhost:7051"
echo "  CouchDB: http://localhost:5984"
echo ""
echo "  Chaincodes deployed:"
echo "    • medichain-patient"
echo "    • medichain-doctor"
echo "    • medichain-audit"
echo "    • medichain-consent"
echo ""
echo "  Next step — start the backend:"
echo "    cd ../backend && npm run dev"
echo ""
echo "  Watch for:"
echo "    [FabricGateway] Successfully connected to Hyperledger Fabric"
echo ""
