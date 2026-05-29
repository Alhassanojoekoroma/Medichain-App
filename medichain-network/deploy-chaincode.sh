#!/bin/bash
# deploy-chaincode.sh
# Packages, installs, approves, and commits chaincode (Fabric 2.x lifecycle)

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export CORE_PEER_TLS_ENABLED=false

CRYPTO_PATH=${PWD}/crypto-config
CHANNEL_NAME="medichainchannel"
CC_NAME=$1
CC_SRC_PATH="../backend/chaincode/${CC_NAME}"
CC_VERSION=${2:-"1.0"}
CC_SEQUENCE=${3:-"1"}

if [ -z "$CC_NAME" ]; then
  echo "Usage: ./deploy-chaincode.sh <contract-name> [version] [sequence]"
  echo "Example: ./deploy-chaincode.sh patient 1.0 1"
  exit 1
fi

# Set peer env for Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${CRYPTO_PATH}/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "==> Step 1: Packaging chaincode $CC_NAME..."
peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_SRC_PATH} \
  --lang golang \
  --label ${CC_NAME}_${CC_VERSION}
if [ "$?" -ne 0 ]; then echo "Failed to package $CC_NAME"; exit 1; fi

echo "==> Step 2: Installing chaincode on peer0.org1..."
peer lifecycle chaincode install ${CC_NAME}.tar.gz || true

echo "==> Step 3: Installing chaincode on peer1.org1..."
export CORE_PEER_ADDRESS=localhost:7061
peer lifecycle chaincode install ${CC_NAME}.tar.gz || true

echo "==> Step 4: Querying installed chaincodes to get Package ID..."
export CORE_PEER_ADDRESS=localhost:7051
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "${CC_NAME}_${CC_VERSION}" | awk -F 'Package ID: ' '{print $2}' | awk -F ',' '{print $1}')
echo "Package ID: $PACKAGE_ID"

echo "==> Step 5: Approving chaincode for Org1..."
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $PACKAGE_ID \
  --sequence $CC_SEQUENCE
if [ "$?" -ne 0 ]; then echo "Failed to approve $CC_NAME"; exit 1; fi

echo "==> Step 6: Committing chaincode to the channel..."
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --peerAddresses localhost:7051
if [ "$?" -ne 0 ]; then echo "Failed to commit $CC_NAME"; exit 1; fi

echo ""
echo "Chaincode '$CC_NAME' deployed and committed successfully!"
