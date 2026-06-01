/**
 * DEPRECATED: This file is no longer used for Hyperledger Fabric
 * 
 * This file previously used ethers.js for Ethereum wallet connections.
 * We've migrated to Hyperledger Fabric certificate-based enrollment.
 * 
 * Use fabricService.ts instead:
 * import { fabricService } from './fabricService'
 * 
 * If you see imports from this file, please update them immediately.
 */

console.warn(
  '[DEPRECATION WARNING] blockchain.ts is no longer maintained.\n' +
  'Use: import { fabricService } from "./fabricService.ts" instead.'
);

// Prevent any accidental usage
throw new Error(
  'blockchain.ts has been deprecated. ' +
  'Please use fabricService.ts for Hyperledger Fabric integration.'
);
