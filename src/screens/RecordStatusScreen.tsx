import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Stepper }                     from '../components/ui/Stepper';
import { VerificationSplitCardDefault } from '../components/ui/VerificationSplitCard';

/**
 * RecordStatusScreen — matches medichain-app-screens.html Screen B exactly:
 *
 *   Background:  #0A0A0A (black)
 *   Header:      dark icon-btn (40×40 black circle, white arrow) + "Hi, Jess!" + sub
 *   Stepper:     4 steps — Initiated, Verified, Uploaded, Secured
 *                Steps 0-1: default (black dot), Step 2: current (blue), Step 3: final (lime)
 *   SummaryCard: VerificationSplitCardDefault component (blue top + cost-row bottom)
 *   Docs block:  white rounded card with doc-tiles (dark + grey)
 */

const STEPS = ['Record\nInitiated', 'Identity\nVerified', 'Documents\nUploaded', 'Record\nSecured'];

function BackArrow() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={Colors.white} strokeWidth={2.4}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function RecordStatusScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const doc    = route?.params?.doc ?? { name: 'Lab_Report_Jun2025.pdf', sizeKb: 348 };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Back button ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BackArrow />
        </TouchableOpacity>

        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hi, Jess!</Text>
          <Text style={styles.greetingSub}>Your record has been secured on-chain</Text>
        </View>

        {/* ── Stepper (4 steps, current = step 2, final = step 3) ── */}
        <Stepper steps={STEPS} currentStep={2} finalStep={3} />

        {/* ── Summary card (blue top + black/lime cost-row bottom) ── */}
        <VerificationSplitCardDefault
          patientName="Jess Willing"
          initials="JW"
          dateOfVisit="01/10/23"
          recordId="REC12345678"
          recordsVerified={4}
          pendingReview={2}
          style={styles.summaryCard}
        />

        {/* ── Documents block (white card) ── */}
        <View style={styles.docsBlock}>
          <View style={styles.docsHeader}>
            <Text style={styles.docsTitle}>Documents</Text>
            <View style={styles.docsNavs}>
              <TouchableOpacity style={styles.navBtnGrey} accessibilityRole="button" accessibilityLabel="Previous document">
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M15 18l-6-6 6-6" stroke={Colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtnDark} accessibilityRole="button" accessibilityLabel="Next document">
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 6l6 6-6 6" stroke={Colors.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.docTiles}>
            {/* Dark tile */}
            <View style={[styles.docTile, styles.docTileDark]}>
              <Text style={styles.docTileDateDark}>12 Feb 2023</Text>
              <Text style={styles.docTileLblDark}>Lab Report</Text>
              <View style={[styles.docThumb, styles.docThumbDark]} />
            </View>
            {/* Grey tile */}
            <View style={[styles.docTile, styles.docTileGrey]}>
              <Text style={styles.docTileDateGrey}>10 Feb 2023</Text>
              <Text style={styles.docTileLblGrey}>ID Card</Text>
              <View style={[styles.docThumb, styles.docThumbGrey]} />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom:     Spacing.xxxxl,
  },

  // ── Back button (dark icon-btn style) ─────────────────────────────────────
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.black,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     0,
  },

  // ── Greeting ──────────────────────────────────────────────────────────────
  greeting: { marginTop: Spacing.xl },
  greetingTitle: {
    fontSize:   24,
    fontWeight: FontWeight.black,
    color:      Colors.white,
  },
  greetingSub: {
    fontSize:   FontSize.bodySmall,
    color:      '#9a9aa0',
    marginTop:  2,
  },

  // ── Summary card ──────────────────────────────────────────────────────────
  summaryCard: {
    borderRadius: 24,
    overflow:     'hidden',
  },

  // ── Docs block ────────────────────────────────────────────────────────────
  docsBlock: {
    backgroundColor: Colors.white,
    borderRadius:    24,
    marginTop:       Spacing.lg,
    padding:         Spacing.xl,
    paddingBottom:   0,
    height:          220,
    overflow:        'hidden',
  },
  docsHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing.lg,
  },
  docsTitle: {
    fontSize:   17,
    fontWeight: FontWeight.bold,
    color:      Colors.black,
  },
  docsNavs: { flexDirection: 'row', gap: 8 },
  navBtnGrey: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.grey100,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnDark: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.black,
    alignItems: 'center', justifyContent: 'center',
  },

  docTiles: { flexDirection: 'row', gap: 10 },

  docTile: {
    flex: 1, borderRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    padding: 14, paddingBottom: 0, height: 170,
    position: 'relative', overflow: 'visible',
  },
  docTileDark: { backgroundColor: Colors.black },
  docTileGrey: { backgroundColor: Colors.grey100 },

  docTileDateDark: { fontSize: 10.5, fontWeight: FontWeight.medium, color: '#8a8a90' },
  docTileDateGrey: { fontSize: 10.5, fontWeight: FontWeight.medium, color: '#a0a0a6' },
  docTileLblDark:  { fontSize: 13.5, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 2 },
  docTileLblGrey:  { fontSize: 13.5, fontWeight: FontWeight.bold, color: Colors.black, marginTop: 2 },

  docThumb: {
    position: 'absolute', left: 10, right: -4, top: 52,
    height: 90, borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  docThumbDark: {
    // White lined paper pattern — approximated with gradient
    backgroundColor: Colors.white,
  },
  docThumbGrey: {
    backgroundColor: Colors.blue,
  },
});
