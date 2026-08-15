import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, FontWeight } from '../theme';

export default function SplashScreen({ navigation }: any) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Start pulse animations
    const animate = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: delay === 0 ? 0.6 : 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );

    animate(pulse1, opacity1, 0).start();
    animate(pulse2, opacity2, 500).start();

    // Auth check + redirect after 2.5 s
    const timer = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          navigation.replace('Main');
        } else {
          const onboarded = await AsyncStorage.getItem('onboarded');
          navigation.replace(onboarded ? 'Login' : 'Onboarding');
        }
      } catch {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, pulse1, pulse2, opacity1, opacity2]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Animated pulse rings */}
      <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: pulse1 }], opacity: opacity1 }]} />
      <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }], opacity: opacity2 }]} />

      {/* Logo mark */}
      <View style={styles.logoMark}>
        <Text style={styles.logoIcon}>⛓</Text>
      </View>

      <Text style={styles.brand}>MediChain SL</Text>
      <Text style={styles.tagline}>Your records. Your control.</Text>
    </View>
  );
}

const RING_BASE = 80;

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  ring: {
    position:        'absolute',
    borderRadius:    RING_BASE,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.35)',
  },
  ring1: { width: RING_BASE * 2, height: RING_BASE * 2 },
  ring2: { width: RING_BASE * 2.4, height: RING_BASE * 2.4 },

  logoMark: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.3)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    24,
    zIndex:          1,
  },
  logoIcon: { fontSize: 32 },

  brand: {
    fontSize:    FontSize.h1,
    fontWeight:  FontWeight.bold,
    color:       Colors.white,
    letterSpacing: 0.5,
    zIndex:      1,
  },
  tagline: {
    marginTop:   12,
    fontSize:    18,
    fontStyle:   'italic',
    color:       'rgba(255,255,255,0.8)',
    zIndex:      1,
  },
});
