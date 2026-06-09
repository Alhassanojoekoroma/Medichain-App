// services/auth.ts
/**
 * SECURITY REQUIREMENTS FOR BACKEND TEAM:
 * 1. JWT tokens must be signed with RS256 (asymmetric) — not HS256
 * 2. JWT expiry: 8 hours (doctor work day)
 * 3. httpOnly + Secure + SameSite=Strict cookie flags on all tokens
 * 4. Fabric CA enrollment secrets must be rotated every 90 days
 * 5. All API routes must validate JWT on every request (middleware)
 * 6. Rate limit login endpoint: max 5 attempts per IP per 15 minutes
 * 7. All doctor actions write an audit event to the Fabric ledger
 * 8. MFA (TOTP via Google Authenticator) required in production
 * 9. Patient QR public routes MUST ONLY return fields patient explicitly permitted
 * 10. Never return full patient record to public QR routes regardless of query params
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface EnrollmentResponse {
  success: boolean;
  token?: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    role: string;
    fabricId: string;
    hospitalAffiliation: string;
    licenseNumber: string;
  };
  error?: string;
}

export async function enrollDoctor(credentials: LoginCredentials): Promise<EnrollmentResponse> {
  let email = credentials.username;
  let password = credentials.password;

  // Translate demo credentials to match the seeded DB entries
  if (email === 'doctor' && password === 'medichain2026') {
    email = 'doctor@medichain.sl';
    password = 'password123';
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/doctor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || 'Authentication failed' };
    }

    const data = await res.json(); // { success, token, doctorId }
    
    // Map details for local UI based on who logged in
    const isKamara = email.includes('local') || email.includes('kamara');
    const isNurse = email.includes('nurse');
    const isStaff = email.includes('staff');
    
    const role = data.role || (isNurse ? 'nurse' : isStaff ? 'staff' : 'doctor');
    const name = isNurse ? 'Nurse Inos' : isStaff ? 'Staff Member' : (isKamara ? 'Dr. John Kamara' : 'Dr. Amara Kofi');
    const licenseNumber = isNurse ? 'SL-NUR-2020-0112' : isStaff ? 'SL-STA-2021-0021' : (isKamara ? 'SL-MED-2022-0089' : 'SL-MED-2019-0047');
    const fabricId = `${role}-${isNurse ? 'inos' : isStaff ? 'staff-member' : (isKamara ? 'john-kamara' : 'amara-kofi')}@medichain.sl`;

    const doctorDetails = {
      id: data.doctorId || (isNurse ? 'd0010000-0000-0000-0000-000000000003' : isStaff ? 'd0010000-0000-0000-0000-000000000004' : (isKamara ? 'd0010000-0000-0000-0000-000000000002' : 'd0010000-0000-0000-0000-000000000001')),
      name: name,
      email: email,
      role: role,
      fabricId: fabricId,
      hospitalAffiliation: 'Connaught Hospital, Freetown',
      licenseNumber: licenseNumber,
    };

    // Store token and user in sessionStorage (safe in browser only)
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('mc_token', data.token);
        sessionStorage.setItem('mc_user', JSON.stringify(doctorDetails));
      } catch (e) {
        // Silently fail if sessionStorage is unavailable
        console.warn('sessionStorage unavailable:', e);
      }
    }

    return {
      success: true,
      token: data.token,
      doctor: doctorDetails,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Unable to connect to the backend server. Please verify the API is running.',
    };
  }
}

export async function logoutDoctor(): Promise<void> {
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('mc_token');
      sessionStorage.removeItem('mc_user');
    } catch (e) {
      console.warn('sessionStorage unavailable:', e);
    }
  }
}

export async function getSession(): Promise<EnrollmentResponse['doctor'] | null> {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null;
  }

  try {
    const user = sessionStorage.getItem('mc_user');
    if (user) {
      return JSON.parse(user);
    }
  } catch (e) {
    console.warn('Failed to parse session:', e);
  }

  return null;
}
