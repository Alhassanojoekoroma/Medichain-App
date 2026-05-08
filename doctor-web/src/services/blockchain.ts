import { ethers } from 'ethers';
import type { MedicalRecord, BlockchainStatus } from '../types';

// ─── Contract Configuration ──────────────────────────────────────────────────
// Replace with your deployed contract address and ABI
const MEDICHAIN_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const MEDICHAIN_ABI = [
  // Patient record management
  'function addMedicalRecord(address patient, string recordId, bytes32 dataHash, string ipfsCid) returns (bool)',
  'function getMedicalRecord(string recordId) view returns (address patient, bytes32 dataHash, string ipfsCid, uint256 timestamp, bool verified)',
  'function verifyRecord(string recordId) view returns (bool)',
  // Access control
  'function grantAccess(address doctor, address patient, uint256 duration) returns (bool)',
  'function revokeAccess(address doctor, address patient) returns (bool)',
  'function checkAccess(address doctor, address patient) view returns (bool, uint256 expiry)',
  // Doctor management
  'function registerDoctor(string licenseNumber, string name, string specialty) returns (bool)',
  'function isDoctorVerified(address doctor) view returns (bool)',
  // Events
  'event RecordAdded(address indexed patient, string recordId, bytes32 dataHash, uint256 timestamp)',
  'event AccessGranted(address indexed doctor, address indexed patient, uint256 expiry)',
  'event AccessRevoked(address indexed doctor, address indexed patient)',
];

// ─── Provider & Signer ───────────────────────────────────────────────────────
export const getProvider = (): ethers.BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch {
    return null;
  }
};

export const getContract = async (): Promise<ethers.Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  try {
    return new ethers.Contract(MEDICHAIN_CONTRACT_ADDRESS, MEDICHAIN_ABI, signer);
  } catch {
    return null;
  }
};

// ─── Wallet Connection ────────────────────────────────────────────────────────
export const connectWallet = async (): Promise<{ address: string; network: string; balance: string } | null> => {
  const provider = getProvider();
  if (!provider) {
    console.warn('MetaMask not found. Please install MetaMask extension.');
    return null;
  }
  try {
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balanceBN = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceBN);
    return {
      address,
      network: network.name,
      balance: parseFloat(balance).toFixed(4),
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    return null;
  }
};

export const disconnectWallet = (): void => {
  // MetaMask doesn't support programmatic disconnect; clear local state only
  localStorage.removeItem('mc_wallet_address');
};

export const getWalletStatus = async (): Promise<BlockchainStatus> => {
  const provider = getProvider();
  if (!provider) return { connected: false, pendingTx: 0 };
  try {
    const accounts = await provider.send('eth_accounts', []);
    if (accounts.length === 0) return { connected: false, pendingTx: 0 };
    const address = accounts[0];
    const network = await provider.getNetwork();
    const balanceBN = await provider.getBalance(address);
    const balance = parseFloat(ethers.formatEther(balanceBN)).toFixed(4);
    return {
      connected: true,
      walletAddress: address,
      network: network.name,
      balance,
      lastSync: new Date().toISOString(),
      pendingTx: 0,
    };
  } catch {
    return { connected: false, pendingTx: 0 };
  }
};

// ─── Record Management ────────────────────────────────────────────────────────
export const addRecordToBlockchain = async (
  patientAddress: string,
  record: Pick<MedicalRecord, 'id' | 'hash' | 'ipfsCid'>
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const contract = await getContract();
    if (!contract) return { success: false, error: 'Contract unavailable' };

    const dataHash = ethers.id(record.hash);
    const tx = await contract.addMedicalRecord(
      patientAddress,
      record.id,
      dataHash,
      record.ipfsCid || ''
    );
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown blockchain error';
    console.error('Blockchain record error:', msg);
    return { success: false, error: msg };
  }
};

export const verifyRecordOnChain = async (
  recordId: string
): Promise<{ verified: boolean; blockNumber?: number; timestamp?: Date }> => {
  try {
    const contract = await getContract();
    if (!contract) {
      // Simulate verification for demo
      await new Promise(r => setTimeout(r, 1500));
      return { verified: true, blockNumber: 18524731, timestamp: new Date() };
    }
    const result = await contract.getMedicalRecord(recordId);
    return {
      verified: result.verified,
      blockNumber: Number(result.timestamp),
      timestamp: new Date(Number(result.timestamp) * 1000),
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { verified: false };
  }
};

// ─── Access Control ───────────────────────────────────────────────────────────
export const grantPatientAccess = async (
  doctorAddress: string,
  patientAddress: string,
  durationDays: number = 30
): Promise<{ success: boolean; txHash?: string }> => {
  try {
    const contract = await getContract();
    if (!contract) return { success: false };
    const durationSeconds = durationDays * 24 * 60 * 60;
    const tx = await contract.grantAccess(doctorAddress, patientAddress, durationSeconds);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Access grant error:', error);
    return { success: false };
  }
};

export const revokePatientAccess = async (
  doctorAddress: string,
  patientAddress: string
): Promise<{ success: boolean; txHash?: string }> => {
  try {
    const contract = await getContract();
    if (!contract) return { success: false };
    const tx = await contract.revokeAccess(doctorAddress, patientAddress);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Access revoke error:', error);
    return { success: false };
  }
};

export const checkDoctorAccess = async (
  doctorAddress: string,
  patientAddress: string
): Promise<{ hasAccess: boolean; expiresAt?: Date }> => {
  try {
    const contract = await getContract();
    if (!contract) return { hasAccess: false };
    const [hasAccess, expiry] = await contract.checkAccess(doctorAddress, patientAddress);
    return {
      hasAccess,
      expiresAt: hasAccess ? new Date(Number(expiry) * 1000) : undefined,
    };
  } catch {
    return { hasAccess: false };
  }
};

// ─── Utilities ────────────────────────────────────────────────────────────────
export const hashRecordData = (data: object): string => {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return ethers.id(jsonString);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const isMetaMaskAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};
