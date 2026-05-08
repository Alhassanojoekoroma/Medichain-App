# UI/UX Refactoring Template - MedChain Design System

## Standard Screen Structure

Every screen should follow this pattern:

### 1. Imports
```typescript
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CardBody, Badge, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { useStore } from '../store/useStore';
```

### 2. Header Component
```typescript
// Always include padding for safe area + consistent spacing
<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
  {/* Back Button */}
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="chevron-back" size={24} color={Colors.neutral900} />
  </TouchableOpacity>

  {/* Title */}
  <Text style={styles.headerTitle}>Screen Title</Text>

  {/* Action Button (if needed) */}
  <TouchableOpacity style={styles.actionButton}>
    <Ionicons name="icon-name" size={24} color={Colors.white} />
  </TouchableOpacity>
</View>
```

### 3. Content Area
```typescript
// Always use ScrollView with proper padding
<ScrollView
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={16}
>
  {/* Content goes here */}
</ScrollView>
```

### 4. Styles Template
```typescript
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },

  // Sections
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },

  // Cards
  card: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    textAlign: 'center',
  },
});
```

### 5. Key Design Token Rules

**Colors:**
- Use `Colors.*` from theme
- Never hardcode hex values
- For backgrounds: `Colors.neutral50` (off-white)
- For text: `Colors.neutral900` (dark text on white)
- For accents: `Colors.primary` (blue), `Colors.success` (green), etc.

**Spacing:**
- `Spacing.xs` (4px) - minimal gaps
- `Spacing.sm` (8px) - small gaps
- `Spacing.md` (16px) - general spacing
- `Spacing.lg` (24px) - section spacing
- `Spacing.xl` (32px) - major breaks
- `Spacing.xxxl` (48px) - end of scroll padding

**Typography:**
- `FontSize.h1` (36px) - page titles
- `FontSize.h2` (28px) - section headers
- `FontSize.h3` (20px) - subsections
- `FontSize.h4` (16px) - card titles
- `FontSize.body` (14px) - regular text
- `FontSize.bodySmall` (12px) - labels
- `FontWeight.bold` - headings
- `FontWeight.medium` - highlights
- `FontWeight.regular` - body text

**Border Radius:**
- `Radius.md` (8px) - inputs, small buttons
- `Radius.lg` (12px) - cards
- `Radius.xl` (16px) - large cards

---

## Refactoring Checklist

For each screen:

- [ ] Replace hardcoded colors with `Colors.*`
- [ ] Replace hardcoded spacing with `Spacing.*`
- [ ] Replace hardcoded font sizes with `FontSize.*`
- [ ] Replace hardcoded border radius with `Radius.*`
- [ ] Use `Card` and `CardBody` for content containers
- [ ] Use `Button` component for actions
- [ ] Use `Badge` component for status indicators
- [ ] Ensure header always has SafeArea padding
- [ ] Add proper error handling with Toast
- [ ] Test on multiple device sizes
- [ ] Verify 44pt minimum touch targets
- [ ] Check text contrast (WCAG AAA)

---

## Common Patterns

### List Item
```typescript
<TouchableOpacity
  style={styles.listItem}
  onPress={handlePress}
  activeOpacity={0.7}
>
  <View style={styles.listItemIcon}>
    <MaterialCommunityIcons name="icon" size={24} color={Colors.primary} />
  </View>
  <View style={styles.listItemContent}>
    <Text style={styles.listItemTitle}>Title</Text>
    <Text style={styles.listItemSubtitle}>Subtitle</Text>
  </View>
  <Ionicons name="chevron-forward" size={18} color={Colors.neutral400} />
</TouchableOpacity>
```

### Status Badge
```typescript
<Badge
  variant={status === 'active' ? 'primary' : 'secondary'}
>
  {status}
</Badge>
```

### Info Box
```typescript
<View style={styles.infoBox}>
  <View style={styles.infoIcon}>
    <Ionicons name="information-circle" size={24} color={Colors.primary} />
  </View>
  <Text style={styles.infoText}>Information message</Text>
</View>
```

### Empty State
```typescript
<View style={styles.emptyState}>
  <View style={styles.emptyIcon}>
    <MaterialCommunityIcons
      name="folder-open-outline"
      size={64}
      color={Colors.neutral300}
    />
  </View>
  <Text style={styles.emptyTitle}>No Items</Text>
  <Text style={styles.emptySubtitle}>Add your first item to get started</Text>
</View>
```

---

## Performance Checklist

- [ ] No inline object creation in styles
- [ ] Proper use of `key` prop in lists
- [ ] No unnecessary re-renders
- [ ] Images cached properly
- [ ] ScrollView with `scrollEventThrottle={16}` for 60fps
- [ ] No console.log in production code

---

## Accessibility Checklist

- [ ] All interactive elements ≥44pt
- [ ] Text contrast ≥4.5:1 (WCAG AAA)
- [ ] Icons paired with text labels
- [ ] Color not sole information indicator
- [ ] Error messages clear and actionable
- [ ] Focus indicators visible

---

## Testing Checklist

- [ ] Renders without errors
- [ ] Navigation works (back button, etc)
- [ ] All buttons/links functional
- [ ] Empty state displays correctly
- [ ] Data loads and displays
- [ ] Error states handled properly
- [ ] Layout works on all device sizes
- [ ] Touch targets all ≥44pt
- [ ] Text readable (WCAG AAA contrast)
- [ ] No layout shift/jank on scroll
