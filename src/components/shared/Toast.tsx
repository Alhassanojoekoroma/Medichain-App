/**
 * src/components/shared/Toast.tsx
 *
 * Snackbar/toast notification component
 * Auto-dismisses after 3 seconds
 * Non-blocking, positioned at bottom or top
 *
 * Usage:
 * const toastRef = useRef<ToastHandle>(null);
 * 
 * <Toast ref={toastRef} />
 * 
 * toastRef.current?.show({
 *   message: 'Record uploaded successfully',
 *   type: 'success',
 *   duration: 3000
 * });
 */

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom';
}

export interface ToastHandle {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const Toast = forwardRef<ToastHandle, {}>((_, ref) => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const show = (options: ToastOptions) => {
    const id = Date.now().toString();
    const { duration = 3000, position = 'bottom' } = options;

    setToasts(prev => [...prev, { ...options, id }]);

    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: false }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      });
    }, duration);

    return () => clearTimeout(timer);
  };

  const hide = () => {
    Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
      setToasts([]);
    });
  };

  useImperativeHandle(ref, () => ({ show, hide }), []);

  if (toasts.length === 0) return null;

  const latestToast = toasts[toasts.length - 1];
  const { message, type = 'info', position = 'bottom' } = latestToast;

  const bottomToasts = toasts.filter(t => (t.position ?? 'bottom') === 'bottom');
  const topToasts = toasts.filter(t => (t.position ?? 'bottom') === 'top');

  return (
    <>
      {/* Bottom toasts */}
      {bottomToasts.map((toast, idx) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toastContainer,
            {
              bottom: insets.bottom + Spacing.lg + idx * 80,
              opacity,
            },
          ]}
        >
          <ToastContent message={toast.message} type={toast.type ?? 'info'} />
        </Animated.View>
      ))}

      {/* Top toasts */}
      {topToasts.map((toast, idx) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toastContainer,
            {
              top: insets.top + Spacing.lg + idx * 80,
              opacity,
            },
          ]}
        >
          <ToastContent message={toast.message} type={toast.type ?? 'info'} />
        </Animated.View>
      ))}
    </>
  );
});

Toast.displayName = 'Toast';

interface ToastContentProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function ToastContent({ message, type }: ToastContentProps) {
  const { bgColor, textColor, iconColor, icon } = getToastStyle(type);

  return (
    <View style={[styles.content, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

function getToastStyle(type: string) {
  switch (type) {
    case 'success':
      return {
        bgColor: Colors.successLight,
        textColor: Colors.successDark,
        iconColor: Colors.success,
        icon: 'checkmark-circle',
      };
    case 'error':
      return {
        bgColor: Colors.dangerLight,
        textColor: Colors.dangerDark,
        iconColor: Colors.danger,
        icon: 'close-circle',
      };
    case 'warning':
      return {
        bgColor: Colors.warningLight,
        textColor: Colors.warningDark,
        iconColor: Colors.warning,
        icon: 'alert-circle',
      };
    default:
      return {
        bgColor: Colors.primaryLight,
        textColor: Colors.primaryDark,
        iconColor: Colors.primary,
        icon: 'information-circle',
      };
  }
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
  },
});

export default Toast;
