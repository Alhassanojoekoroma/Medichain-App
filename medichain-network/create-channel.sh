#!/bin/bash
# create-channel.sh
# Creates the Medichain channel and joins peers

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/medichain.local/orderers/orderer.medichain.local/msp/tlscacerts/tlsca.medichain.local-cert.pem
export PEER0_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.medichain.local/peers/peer0.org1.medichain.local/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/organizations/peerOrganizations/org2.medichain.local/peers/peer0.org2.medichain.local/tls/ca.crt

CHANNEL_NAME="medichainchannel"

echo "Creating channel $CHANNEL_NAME..."
peer channel create -o localhost:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block --tls --cafile $ORDERER_CA
if [ "$?" -ne 0 ]; then
  echo "Failed to create channel..."
  exit 1
fi

echo "Joining peer0.org1 to the channel..."
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block

echo "Joining peer0.org2 to the channel..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.medichain.local/users/Admin@org2.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:9051
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block

echo "Channel created and peers joined successfully!"
