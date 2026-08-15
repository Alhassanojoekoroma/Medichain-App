import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

/**
 * Stepper — Visual Signature Component
 *
 * Matches medichain-app-screens.html Screen B exactly:
 *   - Default dot  : 10×10 px, black #0A0A0A fill, 2px white border
 *   - Current dot  : 20×20 px, blue  #1E3AE0 fill, 3px white border
 *   - Final dot    : 20×20 px, lime  #D4FF3F fill, 3px lime  border
 *   - Connector    : absolute dotted track, 2px dotted #6a6a72
 *   - Labels       : 11px, #c7c7cc, centered, max-width 70
 */

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed — steps BEFORE this are completed, this is current
  /** Optional: override final completed step index. Defaults to steps.length-1 */
  finalStep?: number;
}

export function Stepper({ steps, currentStep, finalStep }: StepperProps) {
  const final = finalStep ?? steps.length - 1;

  return (
    <View style={styles.wrapper}>
      {/* Dotted connector track — sits behind dots */}
      <View style={styles.track} />

      {steps.map((label, index) => {
        const isDefault   = index !== currentStep && index !== final;
        const isCurrent   = index === currentStep && index !== final;
        const isFinal     = index === final;

        return (
          <View key={label} style={styles.stepCol}>
            <View
              style={[
                styles.dotBase,
                isDefault && styles.dotDefault,
                isCurrent && styles.dotCurrent,
                isFinal   && styles.dotFinal,
              ]}
            />
            <Text style={styles.lbl}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    position:       'relative',
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xl,
  },

  // Dotted horizontal track spanning full width, aligned to dot centre
  track: {
    position:     'absolute',
    top:          5,            // centre of small 10px dot (10/2 = 5)
    left:         20,
    right:        20,
    height:       0,
    borderTopWidth: 2,
    borderTopColor: '#6a6a72',
    borderStyle:  'dashed' as const,
    zIndex:       0,
  },

  stepCol: {
    flex:      1,
    alignItems:'center',
    position:  'relative',
    zIndex:    1,
  },

  dotBase: {
    borderRadius: 50,
  },

  // ── Three states ──────────────────────────────────────────────────────────

  dotDefault: {
    width:           10,
    height:          10,
    backgroundColor: Colors.black,
    borderWidth:     2,
    borderColor:     Colors.white,
  },

  dotCurrent: {
    width:           20,
    height:          20,
    backgroundColor: Colors.blue,
    borderWidth:     3,
    borderColor:     Colors.white,
  },

  dotFinal: {
    width:           20,
    height:          20,
    backgroundColor: Colors.lime,
    borderWidth:     3,
    borderColor:     Colors.lime,
  },

  lbl: {
    fontSize:   FontSize.tiny,
    color:      '#c7c7cc',
    textAlign:  'center',
    marginTop:  10,
    lineHeight: 14.3,  // 1.3 × 11px
    maxWidth:   70,
    fontWeight: FontWeight.medium,
  },
});

export default Stepper;
