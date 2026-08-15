import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../theme';

/**
 * BlockchainVerifiedCard — Visual Signature Component
 *
 * Matches medichain-app-screens.html Screen F .approved-card exactly:
 *
 *  CARD: blue #1E3AE0 background, border-radius 24
 *
 *  TOP ROW (.approved-top):
 *    - Black circle tick  (black bg, white checkmark SVG)
 *    - "Record verified"  (title, font-weight 700)
 *    - "Block #XXXXXX"    (subtitle, blue-light #C9D3FF)
 *
 *  MID SECTION (.approved-mid, aspect-ratio 4:3):
 *    LEFT  — .est-circle: dashed-border circle, "File size" label + "250MB" value
 *    RIGHT — .sticker-wrap: 12-petal lime rosette (12 circles at 30° intervals)
 *                           + solid lime core circle on top
 *                           + "Confirmations" label + count
 *
 *  BOTTOM — .pill-row:
 *    - Est-pill (dashed outline, "Block height" label + #96,000 value)
 *    - Arrow button (black circle, white right-arrow)
 */

interface BlockchainVerifiedCardProps {
  blockHeight:    number;
  confirmations:  number;
  fileSizeKb:     number;
  label?:         string;
  onPress?:       () => void;
}

// ── Rosette ───────────────────────────────────────────────────────────────────
// 12 small lime circles at 30° intervals around a center, core circle on top

const ROSETTE_SIZE   = 100;
const CX             = ROSETTE_SIZE / 2;
const CY             = ROSETTE_SIZE / 2;
const PETAL_COUNT    = 12;
const PETAL_ORBIT    = 28;   // distance from center to petal center (≈ 64% of half-width)
const PETAL_R        = 7;    // radius of each petal (≈ 26% of container half)
const CORE_R         = 34;   // solid core circle (≈ 80% of container half)

function Rosette() {
  const petals = Array.from({ length: PETAL_COUNT }).map((_, i) => {
    const deg = (i * 360) / PETAL_COUNT;
    const rad = (deg * Math.PI) / 180;
    return {
      key: i,
      cx: CX + PETAL_ORBIT * Math.cos(rad - Math.PI / 2),
      cy: CY + PETAL_ORBIT * Math.sin(rad - Math.PI / 2),
    };
  });

  return (
    <Svg width={ROSETTE_SIZE} height={ROSETTE_SIZE}>
      <G>
        {petals.map(({ key, cx, cy }) => (
          <Circle key={key} cx={cx} cy={cy} r={PETAL_R} fill={Colors.lime} />
        ))}
        {/* Core circle — layered on top with stronger visual weight */}
        <Circle cx={CX} cy={CY} r={CORE_R} fill={Colors.lime} />
      </G>
    </Svg>
  );
}

// ── Tick SVG ─────────────────────────────────────────────────────────────────

function TickSvg() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path
        d="M5 13l4 4L19 7"
        stroke={Colors.white}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ── Arrow SVG ─────────────────────────────────────────────────────────────────

function ArrowSvg() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={Colors.white}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BlockchainVerifiedCard({
  blockHeight,
  confirmations,
  fileSizeKb,
  label = 'Record verified',
  onPress,
}: BlockchainVerifiedCardProps) {
  const fileSizeMb  = fileSizeKb >= 1024
    ? `${(fileSizeKb / 1024).toFixed(0)}MB`
    : `${fileSizeKb}KB`;
  const blockLabel  = `#${blockHeight.toLocaleString()}`;

  return (
    <View style={styles.card}>

      {/* ── Top row ── */}
      <View style={styles.topRow}>
        <View style={styles.tick}>
          <TickSvg />
        </View>
        <View style={styles.topText}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.blockId}>Block {blockLabel}</Text>
        </View>
      </View>

      {/* ── Mid section ── */}
      <View style={styles.mid}>

        {/* est-circle: dashed border, file size */}
        <View style={styles.estCircle}>
          <Text style={styles.circleLabel}>File{'\n'}size</Text>
          <Text style={styles.circleAmt}>{fileSizeMb}</Text>
        </View>

        {/* sticker-wrap: rosette + core with confirmations */}
        <View style={styles.stickerWrap}>
          <Rosette />
          {/* Core label overlay — positioned over the SVG core circle */}
          <View style={styles.coreOverlay}>
            <Text style={styles.coreLabel}>Confirmations</Text>
            <Text style={styles.coreAmt}>{confirmations}</Text>
          </View>
        </View>

      </View>

      {/* ── Bottom pill row ── */}
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <View style={styles.pillText}>
            <Text style={styles.pillLabel}>Block height</Text>
            <Text style={styles.pillAmt}>
              <Text style={styles.pillCur}>#</Text>
              {blockHeight.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="View record status"
        >
          <ArrowSvg />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.blue,
    borderRadius:    24,
    padding:         20,
    // 84% width is handled by the parent / chat bubble container
  },

  // ── Top row ──────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  28,
  },
  tick: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: Colors.black,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  topText: {
    flex: 1,
  },
  title: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.bold,
    color:      Colors.white,
  },
  blockId: {
    fontSize:   FontSize.caption,
    color:      Colors.blueLight,
    marginTop:  3,
  },

  // ── Mid section ──────────────────────────────────────────────────────────
  mid: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   24,
    gap:            12,
  },

  // est-circle: dashed border circle with file size
  estCircle: {
    flex:             1,
    aspectRatio:      1,
    borderRadius:     999,
    borderWidth:      1.5,
    borderColor:      'rgba(255,255,255,0.55)',
    borderStyle:      'dashed' as const,
    alignItems:       'center',
    justifyContent:   'center',
  },
  circleLabel: {
    fontSize:   FontSize.caption,
    color:      '#e9ecff',
    textAlign:  'center',
    lineHeight: 16,
    fontWeight: FontWeight.medium,
  },
  circleAmt: {
    fontSize:   FontSize.h3,
    fontWeight: FontWeight.black,
    color:      Colors.white,
    marginTop:  8,
  },

  // sticker-wrap: rosette SVG + core overlay
  stickerWrap: {
    flex:            1,
    aspectRatio:     1,
    alignItems:      'center',
    justifyContent:  'center',
    position:        'relative',
  },
  coreOverlay: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  coreLabel: {
    fontSize:   9,
    fontWeight: FontWeight.bold,
    color:      '#20260a',
    textAlign:  'center',
    lineHeight: 11,
  },
  coreAmt: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.black,
    color:      Colors.black,
    marginTop:  2,
  },

  // ── Bottom pill row ───────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  pill: {
    flex:          1,
    borderWidth:   1.5,
    borderColor:   'rgba(255,255,255,0.55)',
    borderStyle:   'dashed' as const,
    borderRadius:  999,
    height:        46,
    paddingHorizontal: Spacing.lg,
    justifyContent:'center',
  },
  pillText: {},
  pillLabel: {
    fontSize:   FontSize.caption,
    color:      '#dfe4ff',
    fontWeight: FontWeight.medium,
  },
  pillAmt: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.black,
    color:      Colors.white,
  },
  pillCur: {
    fontSize:   FontSize.body,
    fontWeight: FontWeight.bold,
  },

  arrowBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: Colors.black,
    alignItems:      'center',
    justifyContent:  'center',
  },
});

export default BlockchainVerifiedCard;
