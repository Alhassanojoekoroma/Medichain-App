# MedChain - Quick Startup Guide

## ⚡ 5-Minute Setup

### Prerequisites Checklist
```bash
# Verify all installed
node --version          # Must be v18+
docker --version        # Docker must be running
docker-compose --version
go version              # Must be v1.20+
git --version
```

---

## Step 1: Setup Blockchain (if not already running)

```bash
# Navigate to network directory
cd medichain-network

# Start Docker containers
docker-compose up -d

# Verify running
docker ps
# Should show: orderer, peer0, peer1, ca containers

# Create channel (run once)
./create-channel.sh

# Deploy chaincode (run once)
./deploy-chaincode.sh
```

**Expected output:**
```
✓ Network started
✓ Channel 'medichain' created
✓ Chaincodes deployed
✓ Ready for transactions
```

---

## Step 2: Start Backend API

```bash
cd backend/api

# Install dependencies (first time only)
npm install

# Start server
npm start

# Verify running
curl http://localhost:3000/health
# Should return: { "status": "healthy" }
```

**Expected output:**
```
✓ Express server running on port 3000
✓ Fabric connected
✓ Ready to receive transactions
```

---

## Step 3: Start React Native App

```bash
cd ../../  # Back to project root

# Install dependencies (first time only)
npm install

# Start Expo
npm start

# Choose:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code on physical device
```

**Expected output:**
```
✓ Metro bundler started
✓ App compiled successfully
✓ App running on device/simulator
```

---

## 🎯 What Should Work

### Home Screen
- ✅ Welcome greeting
- ✅ Health status (72 bpm, 4.2k steps, 1.2L hydration)
- ✅ 2x2 quick access grid
- ✅ Upcoming appointment card
- ✅ Data sharing toggle
- ✅ Health insights scroll
- ✅ Health info grid (Medications, Allergies, Records, Settings)

### Navigation
- ✅ Bottom tab navigation (Home, Records, Appointments, Profile, More)
- ✅ All screens use design tokens (colors, spacing, typography)
- ✅ Consistent header styling across all screens

### Core Features
- ✅ **Medications**: View/manage medications (UI/UX updated)
- ✅ **Allergies**: Add/remove allergies (bottom sheet instead of modal)
- ✅ **Records**: Browse/view medical records (bottom sheet detail view)
- ✅ **Appointments**: Schedule/view appointments (calendar picker)
- ✅ **Profile**: View/edit user profile
- ✅ **Doctor Search**: Find & book doctors
- ✅ **Report Upload**: Upload medical documents with OCR
- ✅ **Security**: Data access control, encryption
- ✅ **Notifications**: View access requests & alerts

### Blockchain
- ✅ Medical records notarized on Hyperledger Fabric
- ✅ Immutable audit trail
- ✅ Doctor access requests signed by blockchain
- ✅ Hash verification available on records

---

## 🚨 Common Issues & Fixes

### "Cannot connect to blockchain"
```bash
# Check if Docker containers running
docker ps

# If not, start them
docker-compose up -d

# Restart backend
npm restart
```

### "App won't load"
```bash
# Clear cache and restart
npm start -- --reset-cache

# Or in development:
r  # Reload app
c  # Clear cache
```

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Restart backend
npm start
```

### "Docker containers keep crashing"
```bash
# Check logs
docker-compose logs -f peer0.org1.medichain.local

# Remove all containers and restart
docker-compose down -v
docker-compose up -d
```

### "Chaincode install failed"
```bash
# Check if chaincode exists
peer lifecycle chaincode queryinstalled

# If not, deploy again
./deploy-chaincode.sh

# Check logs
docker logs $(docker ps -q -f "ancestor=hyperledger/fabric-peer")
```

---

## 📊 Project Structure

```
medichain-app/
├── src/
│   ├── screens/              ← All UI screens
│   ├── components/
│   │   └── shared/          ← Design system components
│   ├── services/            ← API, auth, database
│   ├── store/               ← Zustand state management
│   ├── theme/               ← Design tokens (colors, spacing, etc)
│   ├── types/               ← TypeScript definitions
│   └── utils/               ← Helper functions
├── backend/
│   ├── api/                 ← Express.js REST API
│   └── chaincode/           ← Hyperledger Fabric smart contracts (Go)
├── medichain-network/       ← Blockchain network config
│   ├── docker-compose.yml   ← Network definition
│   ├── crypto-config.yaml   ← Certificate generation
│   ├── configtx.yaml        ← Channel configuration
│   └── channel-artifacts/   ← Generated files
└── README.md
```

---

## 🔐 Security Notes

- Patient data encrypted at rest (SQLite with expo-secure-store)
- API requests over HTTPS only (production)
- Medical records signed by blockchain
- Doctor access logged and auditable
- JWT tokens expire after 24 hours
- Refresh tokens stored in secure keychain

---

## 📱 Test Data

### Login Credentials
```
Email: patient@medichain.local
Password: Test@123456

Doctor Email: doctor@medichain.local
Password: Test@123456
```

### Test Medical Records
The app comes with sample records:
- 3 Laboratory tests (blood work)
- 2 Radiology scans (X-ray)
- 1 General consultation
- All notarized on blockchain

### Test Health Data
- Heart Rate: 72 bpm
- Steps: 4,200
- Hydration: 1.2L
- Medications: 3 active

---

## 🎓 Development Tips

### Enable Debug Logging
```bash
# iOS
DEBUG=* npm start

# Android
adb logcat
```

### View State Management
```bash
# Check current state
console.log(useStore.getState());

# In component
const { user, medications, records } = useStore();
```

### Test Blockchain Transactions
```bash
# Submit a patient record to blockchain
peer chaincode invoke -C medichain -n medichain-patient \
  -c '{"Args":["CreateRecord","patient123","Lab Test","2024-04-28","123abc"]}' \
  -o localhost:7050
```

### View Blockchain Ledger
```bash
# Query patient records
peer chaincode query -C medichain -n medichain-patient \
  -c '{"Args":["GetPatientRecords","patient123"]}'
```

---

## 📈 Performance Optimization

### App Size
- iOS: ~180 MB (with dependencies)
- Android: ~150 MB (with dependencies)

### Storage
- SQLite: ~50 MB for 1000+ records
- Blockchain: Unlimited (ledger grows with transactions)

### Network
- API calls: ~200-500ms per request
- Blockchain transactions: ~2-5 seconds
- Recommended WiFi/4G or better

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Update API URLs to production endpoints
- [ ] Enable HTTPS only
- [ ] Set environment variables (.env file)
- [ ] Configure Sentry for error tracking
- [ ] Enable Firebase Analytics
- [ ] Set up backup/restore procedures
- [ ] Configure CI/CD pipeline
- [ ] Load test blockchain network (Hyperledger TestNet)
- [ ] Security audit completed
- [ ] Privacy policy published
- [ ] HIPAA compliance verified

---

## 📞 Support

For issues or questions:

1. **Check logs**: `npm start -- --verbose`
2. **Read docs**: See [SETUP_HYPERLEDGER_FABRIC.md](./SETUP_HYPERLEDGER_FABRIC.md)
3. **Review code**: Check [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)
4. **Submit issue**: GitHub issues with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (Node version, Docker version, OS)

---

## ✅ Success Criteria

Your setup is complete when:

1. ✅ `npm start` runs without errors
2. ✅ App appears on device/simulator
3. ✅ Login successful
4. ✅ Can view medical records
5. ✅ Can upload new records
6. ✅ Blockchain transactions appear in logs
7. ✅ Records show blockchain hash
8. ✅ Can search & book doctors
9. ✅ Notifications appear when access requested
10. ✅ All screens use design system (consistent colors, spacing)

---

## 🎉 You're Ready!

The MedChain application is now ready to use. Start with:

1. **Explore** the HomeScreen - see the refined UI/UX
2. **Add Medication** from MedicationsScreen
3. **View Medical Records** with blockchain verification
4. **Book a Doctor** from ExploreDoctorsScreen
5. **Upload a Report** with AI OCR processing

Enjoy using MedChain! 🏥📱
