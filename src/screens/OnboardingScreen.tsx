import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    icon:     '🗂️',
    title:    'Own your medical history',
    subtitle: 'Your complete medical records follow you — not the hospital. One secure vault for everything.',
  },
  {
    icon:     '🔳',
    title:    'Share with one-time QR code',
    subtitle: 'Generate a single-use QR code that gives your doctor time-limited, scoped access. It expires in 5 minutes.',
  },
  {
    icon:     '📶',
    title:    'Works offline, anywhere',
    subtitle: 'Your records are cached locally on your device. No internet needed to view them.',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SCREEN_W, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Login');
  };

  const skip = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Login');
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={skip}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroller}
      >
        {SLIDES.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width: SCREEN_W }]}>
            <View style={styles.illustrationWrap}>
              <Text style={styles.illustrationIcon}>{slide.icon}</Text>
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Progress dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA button */}
      <View style={styles.btnArea}>
        {isLast ? (
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
          >
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: Colors.white },
  skipBtn:   { position: 'absolute', top: 56, right: Spacing.xl, zIndex: 10 },
  skipText:  { fontSize: FontSize.body, color: Colors.textMuted, fontWeight: FontWeight.medium },

  scroller:  { flex: 1 },
  slide:     {
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop:     80,
  },

  illustrationWrap: {
    width:           160,
    height:          160,
    borderRadius:    80,
    backgroundColor: Colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing.xxl,
  },
  illustrationIcon: { fontSize: 72 },

  slideTitle: {
    fontSize:   FontSize.h2,
    fontWeight: FontWeight.bold,
    color:      Colors.dark,
    textAlign:  'center',
    marginBottom: Spacing.lg,
  },
  slideSubtitle: {
    fontSize:   FontSize.body,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
  },

  dots: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            8,
    marginBottom:   Spacing.xl,
  },
  dot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.border,
    borderWidth:     1.5,
    borderColor:     Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
    width:           20,
  },

  btnArea: {
    paddingHorizontal: Spacing.xl,
    paddingBottom:     48,
  },
  getStartedBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius:    Radius.pill,
    paddingVertical: 14,
  },
  getStartedText: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.bold,
    color:      Colors.white,
  },
  nextBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius:    Radius.pill,
    paddingVertical: 14,
  },
  nextText: {
    fontSize:   FontSize.h4,
    fontWeight: FontWeight.bold,
    color:      Colors.primary,
  },
});
