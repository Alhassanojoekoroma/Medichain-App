import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { ChatHeader }             from '../components/ui/ChatHeader';
import { MessageBubble }          from '../components/ui/MessageBubble';
import { MessageMeta }            from '../components/ui/MessageMeta';
import { MiniDocPreview }         from '../components/ui/MiniDocPreview';
import { ChatInputBar }           from '../components/ui/ChatInputBar';
import { QuickReplyGrid }         from '../components/ui/QuickReplyGrid';
import { BlockchainVerifiedCard } from '../components/ui/BlockchainVerifiedCard';
import type { QuickReplyItem }    from '../components/ui/QuickReplyCard';

// ─── Types ────────────────────────────────────────────────────────────────────

type MsgType = 'text' | 'doc_pending' | 'blockchain_card';

interface Message {
  id:        string;
  direction: 'outgoing' | 'incoming';
  type:      MsgType;
  text:      string;
  time:      string;
  isRead?:   boolean;
  doc?:      { name: string; sizeKb: number };
  blockchainData?: { blockHeight: number; confirmations: number; fileSizeKb: number };
}

// ─── Initial mock messages ─────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1', direction: 'outgoing', type: 'text',
    text: "Hi Dr. Kamara,\nI'd like to add my new lab results to my medical record.",
    time: '1:14 pm', isRead: true,
  },
  {
    id: 'm2', direction: 'incoming', type: 'text',
    text: "Hi Jess,\nPlease attach the new documents so we can verify them",
    time: '1:15 pm', isRead: true,
  },
];

// ─── Quick replies matching Screen D exactly ──────────────────────────────────

const QUICK_REPLIES: QuickReplyItem[] = [
  { id: 'q1', label: 'Attach new\nlab report',      icon: 'document-text', action: 'attach_lab' },
  { id: 'q2', label: 'Attach your\nID Card',        icon: 'card',          action: 'attach_id' },
  { id: 'q3', label: 'Attach new\nprescription',    icon: 'clipboard',     action: 'attach_rx' },
  { id: 'q4', label: 'Attach insurance\ncard',      icon: 'card',          action: 'attach_ins' },
  { id: 'q5', label: 'Attach hospital\nrecords',    icon: 'business',      action: 'attach_hosp' },
  { id: 'q6', label: 'Attach consent\nform',        icon: 'copy',          action: 'attach_consent' },
];

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({ initials, style }: { initials: string; style?: any }) {
  return (
    <View style={[avatarStyles.wrap, style]}>
      <Text style={avatarStyles.text}>{initials}</Text>
    </View>
  );
}
const avatarStyles = StyleSheet.create({
  wrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { fontSize: 12, fontWeight: FontWeight.bold },
});

// ─── Badge-check for upload sheet ────────────────────────────────────────────

function CheckSvg() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={Colors.black} strokeWidth={3}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Doc card for upload sheet ────────────────────────────────────────────────

function SheetDocCard({ label }: { label: string }) {
  return (
    <View style={sheetDocStyles.card}>
      <View style={sheetDocStyles.thumb} />
      <Text style={sheetDocStyles.label}>{label}</Text>
      {/* Expand button */}
      <View style={sheetDocStyles.expand}>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M7 17L17 7M9 7h8v8" stroke={Colors.white}
            strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </View>
  );
}
const sheetDocStyles = StyleSheet.create({
  card: {
    width: 150, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.grey300,
    borderRadius: 16, padding: 8, position: 'relative',
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  thumb: {
    height: 100, borderRadius: 10,
    backgroundColor: Colors.grey100,
    borderWidth: 1, borderColor: '#eef0f4',
  },
  label: {
    fontSize: 14, fontWeight: FontWeight.bold,
    color: Colors.black, marginTop: 8, lineHeight: 16.8,
  },
  expand: {
    position: 'absolute', bottom: -6, right: -6,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.black,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProviderChatThreadScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages]         = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]               = useState('');
  const [showConfirmSheet, setConfirmSheet] = useState(false);
  const [pendingDoc, setPendingDoc]     = useState<{ name: string; sizeKb: number } | null>(null);
  const [activeQuickId, setActiveQuickId] = useState<string | undefined>(undefined);

  // Determine if we have a verified record (switch to Screen F mode)
  const hasVerified = messages.some((m) => m.type === 'blockchain_card');

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const sendText = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, direction: 'outgoing', type: 'text', text: input.trim(), time: now(), isRead: false },
    ]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const handleAttach = (docName = 'Lab_Report.pdf', sizeKb = 348) => {
    setPendingDoc({ name: docName, sizeKb });
    setConfirmSheet(true);
  };

  const confirmUpload = () => {
    if (!pendingDoc) return;
    setConfirmSheet(false);

    // Outgoing doc message with mini-doc preview
    const docMsgId = `m${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: docMsgId, direction: 'outgoing', type: 'doc_pending',
        text: "Hi Dr. Kamara. I've uploaded the documents we discussed — please review and add them to my record.",
        time: now(), isRead: false, doc: pendingDoc,
      },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);

    // Simulate 2s blockchain processing → BlockchainVerifiedCard
    setTimeout(() => {
      const blockHeight = 132549057 + Math.floor(Math.random() * 1000);
      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now()}`,
          direction: 'outgoing',
          type: 'blockchain_card',
          text: '',
          time: now(),
          isRead: false,
          doc: pendingDoc,
          blockchainData: { blockHeight, confirmations: 154, fileSizeKb: pendingDoc!.sizeKb },
        },
      ]);
      setPendingDoc(null);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }, 2000);
  };

  const handleQuickReply = (item: QuickReplyItem) => {
    setActiveQuickId(item.id);
    if (item.action === 'attach_lab')   { handleAttach('Lab_Report.pdf', 348);        return; }
    if (item.action === 'attach_rx')    { handleAttach('Prescription.pdf', 125);      return; }
    if (item.action === 'attach_id')    { handleAttach('ID_Card.pdf', 85);            return; }
    if (item.action === 'attach_ins')   { handleAttach('Insurance_Card.pdf', 200);    return; }
    if (item.action === 'attach_hosp')  { handleAttach('Hospital_Records.pdf', 1024); return; }
    if (item.action === 'attach_consent') { handleAttach('Consent_Form.pdf', 64);     return; }
    // Generic text
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, direction: 'outgoing', type: 'text', text: item.label, time: now(), isRead: false },
    ]);
  };

  // Determine header/input variant: Screen D (blue) before verify, Screen F (white) after
  const variant = hasVerified ? 'white' : 'blue';

  return (
    <View style={[styles.screen, { backgroundColor: hasVerified ? Colors.white : Colors.blue }]}>
      <StatusBar style={hasVerified ? 'dark' : 'light'} />

      {/* ── Header (padded for safe area) ── */}
      <View style={{ paddingTop: insets.top }}>
        <ChatHeader
          title={hasVerified ? 'Provider chat' : 'Provider\nChat'}
          variant={variant}
          onBack={() => navigation.goBack()}
          onAction={() => {}}
        />
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg) => {
          const isOut = msg.direction === 'outgoing';

          // BlockchainVerifiedCard — Screen F pattern
          if (msg.type === 'blockchain_card') {
            return (
              <View key={msg.id} style={[styles.msgRow, styles.msgRowOut]}>
                <View style={styles.msgCol}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RecordStatus', { doc: msg.doc })}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="View blockchain record status"
                    style={styles.approvedCardWrap}
                  >
                    <BlockchainVerifiedCard
                      blockHeight={msg.blockchainData!.blockHeight}
                      confirmations={msg.blockchainData!.confirmations}
                      fileSizeKb={msg.blockchainData!.fileSizeKb}
                      label="Record verified"
                      onPress={() => navigation.navigate('RecordStatus', { doc: msg.doc })}
                    />
                  </TouchableOpacity>
                  <MessageMeta timestamp={msg.time} isRead={msg.isRead} isOutgoing />
                </View>
              </View>
            );
          }

          // Regular text + doc-pending messages
          return (
            <View key={msg.id} style={[styles.msgRow, isOut ? styles.msgRowOut : styles.msgRowIn]}>
              {!isOut && (
                <Avatar
                  initials="DK"
                  style={{ backgroundColor: '#bcd2ff' }}
                />
              )}
              <View style={[styles.msgCol, isOut && styles.msgColOut]}>
                <View style={[
                  styles.bubble,
                  isOut ? styles.bubbleOut : styles.bubbleIn,
                  msg.type === 'doc_pending' && isOut && styles.bubbleGrey,
                ]}>
                  <Text style={[styles.bubbleText, !isOut && styles.bubbleTextIn]}>
                    {msg.text}
                  </Text>
                  {/* Mini-doc previews for doc_pending */}
                  {msg.type === 'doc_pending' && msg.doc ? (
                    <View style={styles.miniDocs}>
                      <View style={styles.miniDoc} />
                      <View style={styles.miniDoc} />
                    </View>
                  ) : null}
                </View>
                <MessageMeta
                  timestamp={msg.time}
                  isRead={msg.isRead}
                  isOutgoing={isOut}
                />
              </View>
              {isOut && (
                <Avatar
                  initials="JW"
                  style={{ backgroundColor: '#d4ffab' }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ── Bottom panel (Screen D blue / Screen F white) ── */}
      <View style={[
        styles.bottomPanel,
        { backgroundColor: hasVerified ? Colors.white : Colors.blue },
      ]}>
        <View style={styles.inputWrap}>
          <ChatInputBar
            value={input}
            onChangeText={setInput}
            onSend={sendText}
            variant={variant}
          />
        </View>

        {/* Quick-reply grid — only shown in Screen D (pre-verification) */}
        {!hasVerified && (
          <QuickReplyGrid
            items={QUICK_REPLIES}
            onSelect={handleQuickReply}
            activeId={activeQuickId}
          />
        )}
      </View>

      {/* ── Upload confirmation sheet (Screen A pattern) ── */}
      <Modal
        visible={showConfirmSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Lime badge-check */}
            <View style={styles.badgeCheck}>
              <CheckSvg />
            </View>

            <Text style={styles.sheetTitle}>Uploaded</Text>
            <Text style={styles.sheetSub}>
              Your medical records were securely uploaded to the blockchain
            </Text>

            {/* Doc cards row */}
            <View style={styles.docsRow}>
              <SheetDocCard label={'Lab\nReport'} />
              <SheetDocCard label="Prescription" />
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmUpload}
              accessibilityRole="button"
              accessibilityLabel="Confirm upload"
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  messages: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: 16 },

  // ── Message rows ──────────────────────────────────────────────────────────
  msgRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           8,
  },
  msgRowOut: { justifyContent: 'flex-end' },
  msgRowIn:  { justifyContent: 'flex-start' },

  msgCol:    { flexDirection: 'column', maxWidth: '78%' },
  msgColOut: { alignItems: 'flex-end' },

  bubble: {
    borderRadius:      20,
    paddingVertical:   14,
    paddingHorizontal: 16,
  },
  bubbleOut: {
    backgroundColor:         Colors.white,
    borderBottomRightRadius: 4,
  },
  bubbleIn: {
    backgroundColor:        Colors.white,
    borderBottomLeftRadius: 4,
  },
  // Screen F: outgoing with attached docs uses grey-100
  bubbleGrey: {
    backgroundColor: Colors.grey100,
  },
  bubbleText: {
    fontSize:   14,
    lineHeight: 19.6,
    color:      Colors.black,
  },
  bubbleTextIn: {
    color: Colors.black,
  },

  miniDocs: { flexDirection: 'row', gap: 6, marginTop: 8 },
  miniDoc: {
    width: 60, height: 44,
    borderRadius: 8,
    backgroundColor: '#e3e6ee',
    borderWidth: 1, borderColor: '#d7dbe6',
  },

  approvedCardWrap: { width: '84%' },

  // ── Bottom panel ──────────────────────────────────────────────────────────
  bottomPanel: {
    paddingHorizontal: Spacing.lg,
    paddingBottom:     28,
    paddingTop:        14,
    gap:               14,
  },
  inputWrap: {},

  // ── Upload confirmation sheet (Screen A) ──────────────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor:     Colors.white,
    borderTopLeftRadius:  32,
    borderTopRightRadius: 32,
    paddingHorizontal:    Spacing.xl,
    paddingTop:           Spacing.xxl,
    paddingBottom:        28,
    alignItems:           'center',
  },
  sheetHandle: {
    width:           40,
    height:          5,
    borderRadius:    3,
    backgroundColor: '#e2e2e5',
    marginBottom:    Spacing.xl,
  },
  badgeCheck: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: Colors.lime,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.lime,
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.5,
    shadowRadius:    20,
    elevation:       6,
    marginBottom:    Spacing.xl,
  },
  sheetTitle: {
    fontSize:   30,
    fontWeight: FontWeight.black,
    color:      Colors.black,
    textAlign:  'center',
  },
  sheetSub: {
    fontSize:   13,
    color:      Colors.textSecondary,
    textAlign:  'center',
    marginTop:  6,
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },
  docsRow: {
    flexDirection: 'row',
    gap:           12,
    justifyContent:'center',
    marginBottom:  Spacing.xl,
  },
  confirmBtn: {
    width:           '100%',
    height:          56,
    backgroundColor: Colors.black,
    borderRadius:    Radius.xxl,
    alignItems:      'center',
    justifyContent:  'center',
  },
  confirmBtnText: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.medium,
    color:      Colors.white,
  },
});
