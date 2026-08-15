import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const C = {
  brand:       '#3E7BFA',
  brandDark:   '#2F63D9',
  brandLight:  '#E4EDFE',
  ink900:      '#10131A',
  ink700:      '#2B303A',
  gray500:     '#8A93A6',
  gray200:     '#E7EAF0',
  gray100:     '#F1F3F8',
  gray50:      '#F8F9FC',
  green100:    '#DCF3E1',
  green600:    '#0D9426',
  red100:      '#FDEAEA',
  red600:      '#EF4444',
  amber100:    '#FDF3E2',
  amber600:    '#F5A524',
  white:       '#FFFFFF',
  canvas:      '#EEF3FF',
  shadow: { shadowColor: '#10131A', shadowOffset: {width:0,height:4}, shadowOpacity:0.06, shadowRadius:14, elevation:3 },
};

export default function QrScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Create a placeholder QR pattern (16x16 grid)
  const qrGrid = Array.from({ length: 16 * 16 }).map((_, i) => (
    <View
      key={i}
      style={{
        width: `${100 / 16}%`,
        height: `${100 / 16}%`,
        backgroundColor: Math.random() > 0.5 ? C.ink900 : C.white,
      }}
    />
  ));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={24} color={C.ink900} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>My Health QR Code</Text>
        <Text style={styles.subtitle}>
          Show this to any MediChain-connected hospital to grant access to your records
        </Text>

        <View style={styles.qrContainer}>
          <View style={styles.qrInner}>
            {qrGrid}
          </View>
        </View>

        <Text style={styles.patientName}>Mariatu Kamara</Text>
        <Text style={styles.patientId}>ID: MC-994821</Text>

        <TouchableOpacity style={styles.downloadBtn}>
          <Feather name="download" size={20} color={C.white} style={{ marginRight: 8 }} />
          <Text style={styles.downloadBtnText}>Download QR</Text>
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Feather name="shield" size={24} color={C.green600} style={{ marginRight: 12 }} />
          <Text style={styles.securityNoteText}>
            This QR code gives hospitals access to your records only when you show it to them
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: C.gray500,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.ink900,
    ...C.shadow,
    marginBottom: 24,
  },
  qrInner: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: C.ink900,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 16,
    color: C.gray500,
    marginBottom: 32,
  },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: C.brand,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 32,
  },
  downloadBtnText: {
    color: C.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.green100,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  securityNoteText: {
    flex: 1,
    color: C.green600,
    fontSize: 14,
    lineHeight: 20,
  },
});
