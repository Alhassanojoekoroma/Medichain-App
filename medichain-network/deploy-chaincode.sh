#!/bin/bash
# deploy-chaincode.sh
# Packages, installs, and instantiates chaincodes

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/
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

echo "Packaging chaincode $CC_NAME..."
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang golang --label ${CC_NAME}_${CC_VERSION}

echo "Installing chaincode on peer0.org1..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "Installing chaincode on peer0.org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.medichain.local/users/Admin@org2.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:9051
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "Chaincode $CC_NAME installed successfully! (Remember to approve and commit the chaincode definition as per Fabric Lifecycle)"
