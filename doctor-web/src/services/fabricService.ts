/**
 * Hyperledger Fabric Service
 * Handles enrollment, identity management, and blockchain calls
 */

export interface FabricUser {
  id: string;
  name: string;
  role: 'doctor' | 'admin' | 'patient';
  enrollmentID: string;
  orgName: string;
  isEnrolled: boolean;
}

export interface FabricStatus {
  connected: boolean;
  gateway?: string;
  currentUser?: FabricUser;
  error?: string;
}

/**
 * Mock Hyperledger Fabric Service
 * In production, this connects to a real Fabric network
 */
class FabricService {
  private currentUser: FabricUser | null = null;
  private enrolled = false;

  /**
   * Enroll a user with Fabric CA
   */
  async enrollUser(enrollmentID: string, _enrollmentSecret: string): Promise<FabricUser> {
    try {
      console.log(`[Fabric] Enrolling user: ${enrollmentID}`);

      // In production: Call your Fabric CA REST API
      // const response = await fetch('/api/fabric/enroll', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enrollmentID, enrollmentSecret })
      // });

      // Mock enrollment response
      const mockUser: FabricUser = {
        id: `${enrollmentID}-fabric`,
        name: enrollmentID,
        role: enrollmentID.includes('doctor') ? 'doctor' : 'admin',
        enrollmentID,
        orgName: 'Org1',
        isEnrolled: true
      };

      this.currentUser = mockUser;
      this.enrolled = true;

      // Store in sessionStorage for this session
      sessionStorage.setItem('fabric_user', JSON.stringify(mockUser));

      return mockUser;
    } catch (error) {
      console.error('[Fabric] Enrollment failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently enrolled
   */
  isEnrolled(): boolean {
    if (!this.enrolled) {
      const stored = sessionStorage.getItem('fabric_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.enrolled = true;
        return true;
      }
    }
    return this.enrolled;
  }

  /**
   * Get current enrolled user
   */
  getCurrentUser(): FabricUser | null {
    if (!this.currentUser) {
      const stored = sessionStorage.getItem('fabric_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUser = null;
    this.enrolled = false;
    sessionStorage.removeItem('fabric_user');
  }

  /**
   * Get Fabric connection status
   */
  getStatus(): FabricStatus {
    return {
      connected: this.enrolled,
      gateway: 'grpc://localhost:7051',
      currentUser: this.currentUser || undefined,
      error: this.enrolled ? undefined : 'Not enrolled'
    };
  }

  /**
   * Submit transaction to Hyperledger Fabric
   */
  async submitTransaction(
    _chaincodeName: string,
    functionName: string,
    args: string[]
  ): Promise<string> {
    if (!this.isEnrolled()) {
      throw new Error('User must be enrolled first');
    }

    try {
      console.log(`[Fabric] Submitting transaction: ${functionName}(${args.join(', ')})`);

      // In production: Call your Fabric API
      // const response = await fetch(`/api/fabric/submit-transaction`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chaincode: chaincodeName,
      //     function: functionName,
      //     args
      //   })
      // });

      // Mock transaction response
      const txID = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return txID;
    } catch (error) {
      console.error('[Fabric] Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Query the ledger
   */
  async queryLedger(
    _chaincodeName: string,
    functionName: string,
    args: string[]
  ): Promise<any> {
    if (!this.isEnrolled()) {
      throw new Error('User must be enrolled first');
    }

    try {
      console.log(`[Fabric] Querying ledger: ${functionName}(${args.join(', ')})`);

      // In production: Call your Fabric API
      // const response = await fetch(`/api/fabric/query-ledger`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chaincode: chaincodeName,
      //     function: functionName,
      //     args
      //   })
      // });

      // Mock query response
      return { success: true, data: {} };
    } catch (error) {
      console.error('[Fabric] Query failed:', error);
      throw error;
    }
  }

  /**
   * Grant access to a patient's records
   */
  async grantAccess(patientId: string, doctorId: string, expiryDays: number = 30): Promise<string> {
    return this.submitTransaction('patientRecords', 'grantAccess', [
      patientId,
      doctorId,
      expiryDays.toString()
    ]);
  }

  /**
   * Check if doctor has access to patient records
   */
  async checkAccess(patientId: string, doctorId: string): Promise<boolean> {
    try {
      const result = await this.queryLedger('patientRecords', 'checkAccess', [
        patientId,
        doctorId
      ]);
      return result.success && result.data.hasAccess === true;
    } catch {
      return false;
    }
  }

  /**
   * Create a patient record on blockchain
   */
  async createPatientRecord(patientData: Record<string, any>): Promise<string> {
    const recordId = `patient_${Date.now()}`;
    const dataHash = this.hashData(JSON.stringify(patientData));

    return this.submitTransaction('patientRecords', 'createPatientRecord', [
      recordId,
      patientData.name || '',
      patientData.dob || '',
      dataHash
    ]);
  }

  /**
   * Create a medical record on blockchain
   */
  async createMedicalRecord(
    patientId: string,
    recordType: string,
    recordData: Record<string, any>
  ): Promise<string> {
    const recordId = `record_${Date.now()}`;
    const dataHash = this.hashData(JSON.stringify(recordData));

    return this.submitTransaction('patientRecords', 'createMedicalRecord', [
      recordId,
      patientId,
      recordType,
      dataHash
    ]);
  }

  /**
   * Verify integrity of a record
   */
  async verifyRecordIntegrity(recordId: string, currentHash: string): Promise<boolean> {
    try {
      const result = await this.queryLedger('patientRecords', 'getRecordHash', [recordId]);
      return result.success && result.data.hash === currentHash;
    } catch {
      return false;
    }
  }

  /**
   * Log access to a record (audit trail)
   */
  async logAccess(patientId: string, recordId: string, action: string): Promise<string> {
    const timestamp = new Date().toISOString();
    return this.submitTransaction('auditLog', 'logAccess', [
      patientId,
      recordId,
      action,
      timestamp
    ]);
  }

  /**
   * Simple hash function for demo (in production, use proper crypto)
   */
  private hashData(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `0x${Math.abs(hash).toString(16)}`;
  }
}

export const fabricService = new FabricService();
