# MediChain Deployment & Hosting Guide

This guide covers deploying the MediChain infrastructure (API, Fabric Network, IPFS) and the React Native application.

## 1. Cloud Infrastructure Requirements
For a production deployment, it is recommended to use Managed Kubernetes (EKS/GKE/AKS) for high availability.
- Minimum 3 Kubernetes Worker Nodes (4 vCPUs, 16GB RAM)
- Cloud Storage (S3/GCS) for IPFS backend

## 2. Deploying Hyperledger Fabric (Kubernetes)
We use the Fabric Operator for Kubernetes.
1. Deploy the Hyperledger Fabric Operator:
   ```bash
   kubectl apply -k github.com/hyperledger/fabric-operator/config/default
   ```
2. Apply the MediChain network configuration:
   ```bash
   kubectl apply -f k8s/fabric-network.yaml
   ```
3. Verify pods are running:
   ```bash
   kubectl get pods -n fabric
   ```

## 3. Deploying the API Gateway (Node.js)
The REST API serves as the bridge between the mobile app and the Fabric network.
1. Build the Docker image:
   ```bash
   docker build -t medichain/api-gateway:latest .
   ```
2. Push to your container registry (e.g., Docker Hub, ECR).
3. Deploy to Kubernetes:
   ```bash
   kubectl apply -f k8s/api-deployment.yaml
   kubectl apply -f k8s/api-service.yaml
   ```

## 4. IPFS Cluster Deployment
For decentralized storage:
1. Deploy IPFS Cluster on Kubernetes:
   ```bash
   helm repo add ipfs-cluster https://ipfs-cluster.io/helm
   helm install medichain-ipfs ipfs-cluster/ipfs-cluster
   ```

## 5. Mobile App Deployment (Expo / React Native)
### Building for Production (EAS Build)
Ensure you have the Expo CLI installed.
1. Login to Expo:
   ```bash
   eas login
   ```
2. Configure your `eas.json` for production environments.
3. Build for iOS:
   ```bash
   eas build --platform ios --profile production
   ```
4. Build for Android:
   ```bash
   eas build --platform android --profile production
   ```
5. Submit to App Store / Google Play:
   ```bash
   eas submit -p ios
   eas submit -p android
   ```

## 6. Over-the-Air (OTA) Updates
For minor fixes that don't require native changes:
```bash
eas update --branch production --message "Fixing button alignment"
```
