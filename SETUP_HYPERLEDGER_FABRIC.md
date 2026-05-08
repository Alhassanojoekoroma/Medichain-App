# MedChain - Hyperledger Fabric Setup Guide

## Prerequisites

### 1. System Requirements
- Node.js 18+ (verify: `node --version`)
- Docker & Docker Compose (verify: `docker --version`)
- Go 1.20+ (for chaincode development)
- Git
- curl
- wget

### 2. Install Hyperledger Fabric Tools

```bash
# Create fabric directory
mkdir -p ~/hyperledger-fabric
cd ~/hyperledger-fabric

# Download Fabric binaries and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0

# Add fabric binaries to PATH
export PATH=$PATH:$(pwd)/bin

# Verify installation
fabric-ca-client version
peer version
```

### 3. Clone Fabric Samples (Optional but Recommended)

```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples
```

---

## MedChain Network Setup

### Step 1: Create Network Directory Structure

```bash
mkdir -p medichain-network/{channel-artifacts,crypto-config}
cd medichain-network
```

### Step 2: Create Docker Compose Network

**Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  # CA (Certificate Authority) - Org1
  ca.org1.medichain.local:
    image: hyperledger/fabric-ca:latest
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca-org1
      - FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org1.medichain.local-cert.pem
      - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/ca.org1.medichain.local-key.pem
    ports:
      - "7054:7054"
    command: sh -c 'fabric-ca-server start'
    volumes:
      - ./crypto-config/peerOrganizations/org1.medichain.local/ca:/etc/hyperledger/fabric-ca-server-config

  # Orderer
  orderer.medichain.local:
    image: hyperledger/fabric-orderer:latest
    environment:
      - ORDERER_GENERAL_LOGLEVEL=INFO
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_LISTENPORT=7050
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
    ports:
      - "7050:7050"
    volumes:
      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ./crypto-config/ordererOrganizations/medichain.local/orderers/orderer.medichain.local/msp:/var/hyperledger/orderer/msp

  # Peer0 - Org1
  peer0.org1.medichain.local:
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_PEER_ID=peer0.org1.medichain.local
      - CORE_PEER_ADDRESS=peer0.org1.medichain.local:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer0.org1.medichain.local:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_LOCALMSPDIR=/etc/hyperledger/msp/peer
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer
      - CORE_CHAINCODE_BUILDER=hyperledger/fabric-ccenv:latest
    ports:
      - "7051:7051"
      - "7053:7053"
    volumes:
      - ./crypto-config/peerOrganizations/org1.medichain.local/peers/peer0.org1.medichain.local/msp:/etc/hyperledger/msp/peer
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - orderer.medichain.local

  # Peer1 - Org1 (for redundancy)
  peer1.org1.medichain.local:
    image: hyperledger/fabric-peer:latest
    environment:
      - CORE_PEER_ID=peer1.org1.medichain.local
      - CORE_PEER_ADDRESS=peer1.org1.medichain.local:7051
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1.org1.medichain.local:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_LOCALMSPDIR=/etc/hyperledger/msp/peer
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer
    ports:
      - "7061:7051"
      - "7063:7053"
    volumes:
      - ./crypto-config/peerOrganizations/org1.medichain.local/peers/peer1.org1.medichain.local/msp:/etc/hyperledger/msp/peer
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - orderer.medichain.local

networks:
  default:
    name: medichain-network
```

### Step 3: Generate Cryptographic Material

**Create `crypto-config.yaml`:**

```yaml
OrdererOrgs:
  - Name: Orderer
    Domain: medichain.local
    Specs:
      - Hostname: orderer

PeerOrgs:
  - Name: Org1
    Domain: org1.medichain.local
    EnableNodeOUs: true
    Template:
      Count: 2  # 2 peers for redundancy
    Users:
      Count: 1  # 1 admin user
```

**Generate certificates:**

```bash
cryptogen generate --config=crypto-config.yaml --output=crypto-config
```

### Step 4: Create Channel Genesis Block

**Create `configtx.yaml`:**

```yaml
---
Organizations:
  - &OrdererOrg
    Name: OrdererOrg
    ID: OrdererMSP
    MSPDir: crypto-config/ordererOrganizations/medichain.local/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('OrdererMSP.member')"
      Writers:
        Type: Signature
        Rule: "OR('OrdererMSP.member')"
      Admins:
        Type: Signature
        Rule: "OR('OrdererMSP.admin')"

  - &Org1
    Name: Org1
    ID: Org1MSP
    MSPDir: crypto-config/peerOrganizations/org1.medichain.local/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('Org1MSP.member')"
      Writers:
        Type: Signature
        Rule: "OR('Org1MSP.member')"
      Admins:
        Type: Signature
        Rule: "OR('Org1MSP.admin')"

Capabilities:
  Channel: &ChannelCapabilities
    V2_0: true
  Orderer: &OrdererCapabilities
    V2_0: true
  Application: &ApplicationCapabilities
    V2_0: true

Application: &ApplicationDefaults
  Organizations:
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
  Capabilities:
    <<: *ApplicationCapabilities

Orderer: &OrdererDefaults
  OrdererType: solo
  Addresses:
    - orderer.medichain.local:7050
  BatchTimeout: 2s
  BatchSize:
    MaxMessageCount: 10
    AbsoluteMaxBytes: 99 MB
    PreferredMaxBytes: 2 MB
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
  Capabilities:
    <<: *OrdererCapabilities

Channel: &ChannelDefaults
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
  Capabilities:
    <<: *ChannelCapabilities

Profiles:
  MediChainGenesis:
    <<: *ChannelDefaults
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *OrdererOrg
    Consortiums:
      SampleConsortium:
        Organizations:
          - *Org1

  MediChainChannel:
    <<: *ChannelDefaults
    Consortium: SampleConsortium
    Application:
      <<: *ApplicationDefaults
      Organizations:
        - *Org1
```

**Generate genesis block:**

```bash
export FABRIC_CFG_PATH=$PWD

configtxgen -profile MediChainGenesis -channelID syschannel -outputBlock channel-artifacts/genesis.block

configtxgen -profile MediChainChannel -outputCreateChannelTx channel-artifacts/medichain.tx -channelID medichain
```

### Step 5: Start the Network

```bash
# Start containers
docker-compose up -d

# Verify containers are running
docker ps

# Verify network connectivity
docker-compose exec peer0.org1.medichain.local peer version
```

### Step 6: Create Channel

```bash
# Set environment variables
export FABRIC_CFG_PATH=$PWD
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=$PWD/crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp
export CORE_PEER_ADDRESS=localhost:7051

# Create channel
peer channel create -o localhost:7050 \
  -c medichain \
  -f channel-artifacts/medichain.tx \
  --outputBlock channel-artifacts/medichain.block

# Join peer0 to channel
peer channel join -b channel-artifacts/medichain.block

# Join peer1 to channel
export CORE_PEER_ADDRESS=localhost:7061
peer channel join -b channel-artifacts/medichain.block
```

### Step 7: Deploy Chaincode

```bash
# Copy your chaincode to the network
cp -r ../src/chaincode/patient $PWD/chaincode/

# Install chaincode on peer0
export CORE_PEER_ADDRESS=localhost:7051
peer lifecycle chaincode package medichain-patient.tar.gz \
  --path /path/to/chaincode/patient \
  --lang golang \
  --label medichain-patient_1.0

# Install on peers
peer lifecycle chaincode install medichain-patient.tar.gz

# Get package ID
export CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep medichain-patient | awk '{print $3}' | cut -d',' -f1)

# Approve chaincode
peer lifecycle chaincode approveformyorg \
  -C medichain \
  -n medichain-patient \
  --package-id $CC_PACKAGE_ID \
  --version 1.0 \
  --sequence 1 \
  -o localhost:7050

# Commit chaincode
peer lifecycle chaincode commit \
  -C medichain \
  -n medichain-patient \
  --version 1.0 \
  --sequence 1 \
  -o localhost:7050
```

---

## Integration with MedChain App

### 1. Install Fabric Node SDK

```bash
cd /path/to/medichain-app/backend/api
npm install fabric-network fabric-ca-client
```

### 2. Create Network Configuration

**`connection-profile.json`:**

```json
{
  "name": "MediChain-Network",
  "version": "1.0",
  "client": {
    "organization": "Org1",
    "connection": {
      "timeout": {
        "peer": {
          "endorser": "300"
        }
      }
    }
  },
  "organizations": {
    "Org1": {
      "mspid": "Org1MSP",
      "peers": ["peer0.org1.medichain.local", "peer1.org1.medichain.local"],
      "certificateAuthorities": ["ca.org1.medichain.local"],
      "adminPrivateKey": {
        "path": "crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp/keystore/key.pem"
      },
      "signedCert": {
        "path": "crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp/signcerts/Admin@org1.medichain.local-cert.pem"
      }
    }
  },
  "peers": {
    "peer0.org1.medichain.local": {
      "url": "grpc://localhost:7051",
      "tlsCACerts": {
        "path": "crypto-config/peerOrganizations/org1.medichain.local/peers/peer0.org1.medichain.local/tls/ca.crt"
      },
      "grpcOptions": {
        "ssl-target-name-override": "peer0.org1.medichain.local"
      }
    },
    "peer1.org1.medichain.local": {
      "url": "grpc://localhost:7061",
      "tlsCACerts": {
        "path": "crypto-config/peerOrganizations/org1.medichain.local/peers/peer1.org1.medichain.local/tls/ca.crt"
      },
      "grpcOptions": {
        "ssl-target-name-override": "peer1.org1.medichain.local"
      }
    }
  },
  "certificateAuthorities": {
    "ca.org1.medichain.local": {
      "url": "http://localhost:7054",
      "caName": "ca-org1",
      "tlsCACerts": {
        "path": ""
      },
      "httpOptions": {
        "verify": false
      }
    }
  }
}
```

### 3. Create Fabric Connection Module

**`backend/api/fabric.js`:**

```javascript
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricConnection {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contract = null;
  }

  async connect() {
    try {
      const ccpPath = path.resolve(__dirname, '../../medichain-network/connection-profile.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if identity exists
      const identity = await wallet.get('admin');
      if (!identity) {
        console.log('Admin identity not found in wallet');
        return;
      }

      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
      });

      this.network = await this.gateway.getNetwork('medichain');
      this.contract = this.network.getContract('medichain-patient');
    } catch (error) {
      console.error('Failed to connect to Fabric:', error);
      throw error;
    }
  }

  async submitTransaction(fnName, ...args) {
    try {
      const result = await this.contract.submitTransaction(fnName, ...args);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Transaction ${fnName} failed:`, error);
      throw error;
    }
  }

  async evaluateTransaction(fnName, ...args) {
    try {
      const result = await this.contract.evaluateTransaction(fnName, ...args);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Evaluation ${fnName} failed:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
    }
  }
}

module.exports = new FabricConnection();
```

---

## Quick Start Commands

```bash
# 1. Start blockchain network
cd medichain-network
docker-compose up -d

# 2. Generate certificates
./generate-certs.sh

# 3. Create channel
./create-channel.sh

# 4. Deploy chaincode
./deploy-chaincode.sh

# 5. Start Node.js backend
cd ../backend/api
npm start

# 6. Start React Native app
cd ../
npm start
```

---

## Verification Checklist

- [ ] Docker containers running (`docker ps`)
- [ ] Peers joined channel (`peer channel list`)
- [ ] Chaincode installed (`peer lifecycle chaincode queryinstalled`)
- [ ] API server running (`localhost:3000`)
- [ ] App connects to API
- [ ] Transactions successful on blockchain

---

## Troubleshooting

### Peer not joining channel:
```bash
peer channel list
peer channel join -b channel-artifacts/medichain.block
```

### Chaincode install failed:
```bash
peer lifecycle chaincode install medichain-patient.tar.gz
peer lifecycle chaincode queryinstalled
```

### Connection timeout:
- Verify Docker bridge network: `docker network ls`
- Check firewall: `sudo ufw allow 7050:7063/tcp`

---

## Next Steps

1. ✅ Set up blockchain network (this guide)
2. ⏳ Deploy patient/doctor/audit chaincode
3. ⏳ Connect React Native app to Fabric SDK
4. ⏳ Test end-to-end transactions
5. ⏳ Deploy to production (Kubernetes)
