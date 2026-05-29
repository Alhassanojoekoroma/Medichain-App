#!/bin/bash
# generate-certs.sh
# Generates the crypto material using cryptogen and config transactions using configtxgen

export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}

echo "Generating crypto material with cryptogen..."
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

mkdir -p system-genesis-block channel-artifacts
echo "Generating genesis block for the orderer..."
configtxgen -profile MediChainGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate genesis block..."
  exit 1
fi

echo "Generating channel configuration transaction 'channel.tx'..."
configtxgen -profile MediChainChannel -outputCreateChannelTx ./channel-artifacts/medichainchannel.tx -channelID medichainchannel
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

echo "Certs and channel artifacts generated successfully!"
