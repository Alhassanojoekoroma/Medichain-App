import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthService, SessionWindow } from '../services/authService';
import { getLastMobileSessionActivity, recordMobileSessionActivity } from '../services/sessionActivity';
import { useStore } from '../store/useStore';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const WARNING_SECONDS = 60;
const RENEWAL_LEAD_SECONDS = 120;
const READING_GRACE_MS = 10 * 60 * 1000;

function deadline(session: SessionWindow): number {
  return Math.min(...[session.expiresAt, session.idleExpiresAt, session.absoluteExpiresAt].map(Date.parse));
}

export function MobileSessionGuard() {
  const authenticated = useStore(state => state.isAuthenticated);
  const localLogout = useStore(state => state.logout);
  // The explicit test flag is the only bypass. When set, this component makes
  // zero identity-service calls; normal development remains fail-closed.
  const BYPASS_AUTH = process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';
  const [session, setSession] = useState<SessionWindow | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [renewing, setRenewing] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const inFlight = useRef(false);
  const attemptedDeadline = useRef<number | null>(null);
  const expired = useRef(false);

  const signOut = useCallback(async () => {
    if (expired.current) return;
    expired.current = true;
    await AuthService.logout();
    await localLogout();
  }, [localLogout]);

  const refresh = useCallback(async () => {
    if (!authenticated || appState.current !== 'active' || BYPASS_AUTH) return;
    try {
      const current = await AuthService.getCurrentSessionWindow();
      if (!current) return void signOut();
      setSession(current);
      expired.current = false;
    } catch {
      // Retain the last server deadline during transient connectivity loss.
    }
  }, [authenticated, signOut]);

  const renew = useCallback(async (sessionDeadline?: number, manual = false) => {
    if (BYPASS_AUTH) return;
    if (!manual && sessionDeadline && attemptedDeadline.current === sessionDeadline) return;
    if (inFlight.current) return;
    if (sessionDeadline) attemptedDeadline.current = sessionDeadline;
    inFlight.current = true;
    setRenewing(true);
    try {
      const current = await AuthService.renewSandboxSession();
      recordMobileSessionActivity();
      setSession(current);
      attemptedDeadline.current = null;
    } catch (error) {
      if (error instanceof Error && ['SESSION_RENEWAL_FAILED', 'AUTHENTICATION_REQUIRED'].includes(error.message)) await signOut();
    } finally {
      inFlight.current = false;
      setRenewing(false);
    }
  }, [signOut]);

  useEffect(() => {
    if (!authenticated) {
      setSession(null);
      setRemaining(null);
      return;
    }
    recordMobileSessionActivity();
    void refresh();
    const poll = setInterval(() => void refresh(), 30_000);
    const subscription = AppState.addEventListener('change', next => {
      appState.current = next;
      if (next === 'active') void refresh();
    });
    return () => {
      clearInterval(poll);
      subscription.remove();
    };
  }, [authenticated, refresh]);

  useEffect(() => {
    if (!session || !authenticated) return;
    const check = () => {
      const seconds = Math.max(0, Math.ceil((deadline(session) - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) return void signOut();
      const recentlyActive = appState.current === 'active' && Date.now() - getLastMobileSessionActivity() <= READING_GRACE_MS;
      if (seconds <= RENEWAL_LEAD_SECONDS && seconds > WARNING_SECONDS && recentlyActive) void renew(deadline(session));
    };
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [authenticated, renew, session, signOut]);

  const visible = remaining !== null && remaining > 0 && remaining <= WARNING_SECONDS;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.dialog} accessible accessibilityRole="alert" accessibilityLabel={`Your session expires in ${remaining} seconds`}>
          <Text style={styles.title}>Your session expires in {remaining} seconds</Text>
          <Text style={styles.description}>For your security, save any unfinished work. Stay signed in to continue, or sign out now.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => void signOut()} style={[styles.button, styles.secondary]}><Text style={styles.secondaryText}>Sign out now</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={renewing} onPress={() => { recordMobileSessionActivity(); void renew(undefined, true); }} style={[styles.button, styles.primary]}><Text style={styles.primaryText}>{renewing ? 'Renewing…' : 'Stay signed in'}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.neutral900 + 'A8', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  dialog: { width: '100%', maxWidth: 440, borderRadius: Radius.lg, backgroundColor: Colors.white, padding: Spacing.xl },
  title: { color: Colors.neutral900, fontSize: FontSize.h2, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  description: { color: Colors.textBody, fontSize: FontSize.bodyLarge, lineHeight: 24, marginBottom: Spacing.xl },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.md },
  button: { minHeight: 48, justifyContent: 'center', borderRadius: Radius.pill, paddingHorizontal: Spacing.lg },
  secondary: { borderWidth: 1, borderColor: Colors.neutral400, backgroundColor: Colors.white },
  primary: { backgroundColor: Colors.primary },
  secondaryText: { color: Colors.neutral900, fontWeight: FontWeight.medium },
  primaryText: { color: Colors.white, fontWeight: FontWeight.bold },
});
