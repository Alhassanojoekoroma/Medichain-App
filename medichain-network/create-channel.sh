#!/bin/bash
# create-channel.sh
# Creates the Medichain channel and joins peers

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export CORE_PEER_TLS_ENABLED=false

CRYPTO_PATH=${PWD}/crypto-config
CHANNEL_NAME="medichainchannel"

# Set MSP for orderer/channel create commands (using Org1 Admin)
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${CRYPTO_PATH}/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "Creating channel $CHANNEL_NAME..."
peer channel create -o localhost:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block
if [ "$?" -ne 0 ]; then
  echo "Failed to create channel..."
  exit 1
fi

echo "Joining peer0.org1 to the channel..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${CRYPTO_PATH}/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
if [ "$?" -ne 0 ]; then
  echo "Failed to join peer0.org1..."
  exit 1
fi

echo "Joining peer1.org1 to the channel..."
export CORE_PEER_MSPCONFIGPATH=${CRYPTO_PATH}/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7061
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
if [ "$?" -ne 0 ]; then
  echo "Failed to join peer1.org1..."
  exit 1
fi

echo "Channel created and peers joined successfully!"
