/**
 * src/components/shared/BottomSheet.tsx
 *
 * Replacement for Alert.alert() — swipeable, non-blocking modal
 * 
 * Features:
 * - Slides up from bottom (not full-screen)
 * - Swipeable to dismiss
 * - Follows MedChain design system
 * - Supports action buttons
 * - Auto-dismiss or manual
 *
 * Usage:
 * const bottomSheetRef = useRef<BottomSheetHandle>(null);
 * 
 * <BottomSheet
 *   ref={bottomSheetRef}
 *   title="Delete Record?"
 *   description="This cannot be undone."
 *   actions={[
 *     { label: 'Cancel', variant: 'ghost', onPress: () => bottomSheetRef.current?.dismiss() },
 *     { label: 'Delete', variant: 'danger', onPress: handleDelete }
 *   ]}
 * />
 */

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../theme';
import Button from './Button';

export interface BottomSheetAction {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'accent' | 'danger';
  onPress: () => void;
}

export interface BottomSheetHandle {
  show: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  title: string;
  description?: string;
  actions: BottomSheetAction[];
  closable?: boolean;
}

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  ({ title, description, actions, closable = true }, ref) => {
    const insets = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(false);
    const translateY = React.useRef(new Animated.Value(600)).current;

    // Pan responder for swipe-to-dismiss
    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderMove: (evt: GestureResponderEvent, { dy }: PanResponderGestureState) => {
          if (dy > 0) {
            translateY.setValue(dy);
          }
        },
        onPanResponderRelease: (evt: GestureResponderEvent, { dy }: PanResponderGestureState) => {
          if (dy > 100) {
            dismiss();
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
          }
        },
      })
    ).current;

    const show = () => {
      setIsVisible(true);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
    };

    const dismiss = () => {
      Animated.timing(translateY, { toValue: 600, duration: 300, useNativeDriver: false }).start(() => {
        setIsVisible(false);
      });
    };

    useImperativeHandle(ref, () => ({ show, dismiss }), []);

    if (!isVisible) return null;

    return (
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closable ? dismiss : undefined}
        />
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Description */}
          {description && <Text style={styles.description}>{description}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            {actions.map((action, idx) => (
              <Button
                key={idx}
                label={action.label}
                variant={action.variant || 'primary'}
                onPress={() => {
                  action.onPress();
                  dismiss();
                }}
                accessibilityLabel={action.label}
              />
            ))}
          </View>

          {/* Safe area bottom */}
          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </View>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    ...Shadow.strong,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    color: Colors.neutral600,
    marginBottom: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
  },
});

export default BottomSheet;
