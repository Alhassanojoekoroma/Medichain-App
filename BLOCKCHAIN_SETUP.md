# MediChain Hyperledger Fabric Setup Guide

This guide outlines the steps required to set up and configure the Hyperledger Fabric network for MediChain.

## Prerequisites
- Docker & Docker Compose
- Go (1.19 or higher)
- Node.js (18 or higher)
- Hyperledger Fabric Binaries & Docker Images

## Network Architecture
The MediChain network consists of:
- **Orderer Org**: `OrdererOrg` (Raft Consensus)
- **Hospital Org**: `Org1MSP` (Hospitals and Clinics)
- **Patient Org**: `Org2MSP` (Patient Data Custodians)

## 1. Network Initialization
Navigate to the `fabric-network` directory:
```bash
cd fabric-network
./network.sh up createChannel -c medichainchannel -ca
```
This script brings up the network, creates the `medichainchannel`, and sets up Certificate Authorities (CAs) for identity management.

## 2. Deploying the Smart Contracts
Deploy the separated smart contracts (Patient, Doctor, Audit):
```bash
./network.sh deployCC -ccn patientcontract -ccp ../chaincode/patient -ccl typescript
./network.sh deployCC -ccn doctorcontract -ccp ../chaincode/doctor -ccl typescript
./network.sh deployCC -ccn auditcontract -ccp ../chaincode/audit -ccl typescript
```

## 3. Registering Users
Use the Fabric CA client to register admin and patient/doctor identities:
```bash
node registerUser.js --org Org1 --user doctor_smith
node registerUser.js --org Org2 --user patient_john
```

## 4. IPFS Integration
Ensure your IPFS node is running for off-chain storage:
```bash
ipfs daemon
```
MediChain uses IPFS to store encrypted PII and files, storing only the content hash on the Fabric ledger.

## 5. Connecting the Mobile App
Update the REST API endpoints in the MediChain mobile app environment configuration (`.env`):
```env
EXPO_PUBLIC_FABRIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_IPFS_GATEWAY=http://localhost:8080/ipfs
```

## Maintenance
To tear down the network and remove volumes:
```bash
./network.sh down
```
