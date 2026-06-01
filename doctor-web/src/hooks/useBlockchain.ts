/**
 * DEPRECATED: This hook is no longer used for Hyperledger Fabric
 * 
 * This hook previously used ethers.js for Ethereum wallet connections.
 * We've migrated to Hyperledger Fabric certificate-based enrollment.
 * 
 * Use fabricService directly instead:
 * import { fabricService } from '../services/fabricService'
 * 
 * If you see imports from this file, please update them immediately.
 */

console.warn(
  '[DEPRECATION WARNING] useBlockchain.ts is no longer maintained.\n' +
  'Use: import { fabricService } from "../services/fabricService.ts" instead.'
);

// Prevent any accidental usage
throw new Error(
  'useBlockchain.ts has been deprecated. ' +
  'Please use fabricService directly for Hyperledger Fabric integration.'
);
