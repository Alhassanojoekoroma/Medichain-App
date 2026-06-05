#!/bin/sh
# Install, approve and commit all 4 MediChain chaincodes
# Run this INSIDE the peer container: docker exec peer0... sh /tmp/deploy-cc.sh

set -e

ORDERER="orderer.medichain.local:7050"
CHANNEL="medichain"
MSP_PATH="/tmp/admin-msp"

export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=$MSP_PATH
export CORE_PEER_TLS_ENABLED=false

install_approve_commit() {
  NAME=$1
  LABEL="${NAME}_1.0"
  TAR="/tmp/${NAME}.tar.gz"

  echo ""
  echo "=============================="
  echo " Installing: $NAME"
  echo "=============================="

  peer lifecycle chaincode install "$TAR" 2>&1 || true
  
  echo "--- Querying installed ---"
  CC_ID=$(peer lifecycle chaincode queryinstalled 2>&1 | grep "$LABEL" | sed 's/.*Package ID: \([^,]*\),.*/\1/')
  echo "Package ID: $CC_ID"

  if [ -z "$CC_ID" ]; then
    echo "ERROR: Could not find package ID for $LABEL"
    exit 1
  fi

  echo "--- Approving ---"
  peer lifecycle chaincode approveformyorg \
    -o "$ORDERER" \
    -C "$CHANNEL" \
    -n "$NAME" \
    --package-id "$CC_ID" \
    --version 1.0 \
    --sequence 1 2>&1

  echo "--- Checking commit readiness ---"
  peer lifecycle chaincode checkcommitreadiness \
    -C "$CHANNEL" \
    -n "$NAME" \
    --version 1.0 \
    --sequence 1 2>&1

  echo "--- Committing ---"
  peer lifecycle chaincode commit \
    -o "$ORDERER" \
    -C "$CHANNEL" \
    -n "$NAME" \
    --version 1.0 \
    --sequence 1 \
    --peerAddresses peer0.org1.medichain.local:7051 2>&1

  echo "✅ $NAME deployed successfully"
}

install_approve_commit "medichain-patient"
install_approve_commit "medichain-doctor"
install_approve_commit "medichain-audit"
install_approve_commit "medichain-consent"

echo ""
echo "=============================="
echo " All chaincodes deployed!"
echo "=============================="
peer lifecycle chaincode querycommitted -C "$CHANNEL" 2>&1
