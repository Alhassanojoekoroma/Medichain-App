
# MedChain Shared Components Implementation Guide

## Overview

This guide shows how to apply the new shared components library across all 14 screens. The components replace hardcoded styles with design tokens and follow mobile best practices.

## Components Library

Located in `src/components/shared/` with barrel export at `src/components/index.ts`.

### Available Components

1. **Button** — Multiple variants (primary, outline, ghost, accent, danger, small)
2. **BottomSheet** — Replaces Alert.alert() and modals (swipeable, non-blocking)
3. **Toast** — Snackbar notifications (auto-dismiss)
4. **Card** — Container with consistent borders and shadows
5. **Badge** — Status indicators with semantic colors
6. **TextInput** — Form input with focus states
7. **ScreenHeader** — Consistent screen titles

## Quick Reference: Import Statement

```typescript
import {
  Button,
  BottomSheet,
  Toast,
  Card,
  CardTitle,
  CardBody,
  Badge,
  TextInput,
  ScreenHeader,
} from '@/components';

import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '@/theme';
```

## Pattern 1: Modal → BottomSheet

### BEFORE (Old Pattern)
```typescript
const [selectedRecord, setSelectedRecord] = useState(null);

<Modal visible={!!selectedRecord} transparent animationType="slide">
  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <TouchableOpacity
      onPress={() => setSelectedRecord(null)}
      style={{ flex: 0.3, backgroundColor: 'rgba(0,0,0,0.4)' }}
    />
    <View style={{ backgroundColor: '#fff', padding: 20 }}>
      <Text>{selectedRecord?.title}</Text>
      <TouchableOpacity onPress={close}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

### AFTER (New Pattern)
```typescript
const bottomSheetRef = useRef<BottomSheetHandle>(null);
const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

// Show sheet when record is selected
useEffect(() => {
  if (selectedRecord) {
    bottomSheetRef.current?.show();
  }
}, [selectedRecord]);

// Component
<BottomSheet
  ref={bottomSheetRef}
  title={selectedRecord?.title || ''}
  description={selectedRecord?.description}
  actions={[
    { 
      label: 'Close', 
      variant: 'ghost', 
      onPress: () => setSelectedRecord(null) 
    },
  ]}
/>
```

**Benefits:**
- Swipeable to dismiss
- Proper safe area handling
- Consistent with MedChain design
- Non-blocking (users can tap backdrop to close)

## Pattern 2: Hardcoded Styles → Theme Tokens

### BEFORE (Old Pattern)
```typescript
<View style={{ backgroundColor: '#2952FF', paddingHorizontal: 16 }}>
  <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>
    My Title
  </Text>
</View>

<TouchableOpacity
  style={{
    backgroundColor: '#2952FF',
    height: 44,
    borderRadius: 24,
    paddingHorizontal: 16,
  }}
  onPress={handlePress}
>
  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
    Continue
  </Text>
</TouchableOpacity>
```

### AFTER (New Pattern)
```typescript
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/theme';
import { Button, ScreenHeader } from '@/components';

<ScreenHeader 
  title="My Title" 
  subtitle="Optional subtitle"
/>

<Button
  label="Continue"
  variant="primary"
  onPress={handlePress}
/>
```

**Benefits:**
- Consistent across entire app
- Easy theme updates (change in one place)
- Proper spacing grid
- Better maintainability

## Pattern 3: Custom Cards → Card Component

### BEFORE
```typescript
<View style={{ 
  backgroundColor: '#fff', 
  borderWidth: 1, 
  borderColor: '#e5e7eb', 
  borderRadius: 16, 
  padding: 16,
  marginBottom: 12,
}}>
  <Text style={{ fontSize: 15, fontWeight: '700' }}>{record.title}</Text>
  <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
    {record.date}
  </Text>
</View>
```

### AFTER
```typescript
<Card>
  <CardTitle>{record.title}</CardTitle>
  <CardBody>
    <Text style={{ fontSize: FontSize.body, color: Colors.neutral600 }}>
      {record.date}
    </Text>
  </CardBody>
</Card>
```

## Pattern 4: Alert → Toast

### BEFORE
```typescript
Alert.alert('Success', 'Record uploaded successfully');
```

### AFTER
```typescript
const toastRef = useRef<ToastHandle>(null);

<Toast ref={toastRef} />

// Then use:
toastRef.current?.show({
  message: 'Record uploaded successfully',
  type: 'success',
  duration: 3000,
});
```

## Pattern 5: Status Labels → Badge

### BEFORE
```typescript
<View style={{
  backgroundColor: '#E1F5EE',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
}}>
  <Text style={{ color: '#0F6E56', fontSize: 10, fontWeight: '700' }}>
    Verified
  </Text>
</View>
```

### AFTER
```typescript
<Badge variant="verified">Verified</Badge>

// For blockchain verification with dot:
<Badge variant="onChain" withDot>
  On-chain
</Badge>
```

## Screen-by-Screen Implementation Plan

### Phase 1: Authentication & Navigation (2 screens)
- **LoginScreen.tsx**: Form inputs, buttons
- **HomeScreen.tsx**: ScreenHeader, Cards, Button

### Phase 2: Medical Data Views (5 screens)
- **RecordsScreen.tsx**: BottomSheet (replace modal), Badge, Card
- **MedicationsScreen.tsx**: Card, Badge
- **AllergiesScreen.tsx**: Card, Button
- **AppointmentsScreen.tsx**: BottomSheet, Card
- **NotificationsScreen.tsx**: Card, Badge

### Phase 3: Profile & Settings (3 screens)
- **ProfileScreen.tsx**: Card, Button
- **SecurityScreen.tsx**: Card, Toggle, Button
- **HelpCenterScreen.tsx**: Card, Button

### Phase 4: Doctor Features (3 screens)
- **ExploreDoctorsScreen.tsx**: Card, Button, TextInput
- **DoctorProfileScreen.tsx**: Card, Badge, Button
- **DoctorScanScreen.tsx**: Badge, Button

### Phase 5: Advanced Features (1 screen)
- **ReportUploadScreen.tsx**: Card, Badge, Toast, BottomSheet

## Checklist for Each Screen

For each screen, verify:

- [ ] Import components from `@/components`
- [ ] Import tokens from `@/theme`
- [ ] Replace all hardcoded colors with Colors.*
- [ ] Replace all hardcoded spacing with Spacing.*
- [ ] Replace all hardcoded font sizes with FontSize.*
- [ ] Replace all hardcoded font weights with FontWeight.*
- [ ] Replace all hardcoded radii with Radius.*
- [ ] Replace all Alert.alert() with Toast component
- [ ] Replace all Modal components with BottomSheet
- [ ] Replace all custom cards with Card component
- [ ] Replace all button styles with Button component
- [ ] Replace all status/type labels with Badge component
- [ ] Update ScreenHeader if present
- [ ] Verify no `fontWeight: 'bold'` or `fontWeight: 700` remains
- [ ] Verify no old hex colors remain (#2952FF, #101326, etc.)
- [ ] Test on device (colors, spacing, interactions)

## Common Mistakes to Avoid

### ❌ WRONG: Hardcoded hex values
```typescript
backgroundColor: '#2952FF'
```

### ✅ RIGHT: Use theme tokens
```typescript
backgroundColor: Colors.primary
```

---

### ❌ WRONG: fontWeight 700 or 'bold'
```typescript
fontWeight: '700'
fontWeight: 'bold' // defaults to 700
```

### ✅ RIGHT: Use FontWeight enum (max 500)
```typescript
fontWeight: FontWeight.bold // '500'
fontWeight: FontWeight.regular // '400'
```

---

### ❌ WRONG: Custom padding/margins
```typescript
paddingHorizontal: 20
marginVertical: 15
```

### ✅ RIGHT: Use spacing scale
```typescript
paddingHorizontal: Spacing.lg // 16
marginVertical: Spacing.md // 12
```

---

### ❌ WRONG: Custom modals for all flows
```typescript
<Modal visible={showDetail} transparent animationType="slide">
  {/* 100+ lines of custom styling */}
</Modal>
```

### ✅ RIGHT: Use BottomSheet for consistent UX
```typescript
<BottomSheet ref={sheet} title="Details" actions={[...]} />
```

---

### ❌ WRONG: Custom alerts
```typescript
Alert.alert('Error', 'Something went wrong');
```

### ✅ RIGHT: Use Toast for notifications
```typescript
toastRef.current?.show({
  message: 'Something went wrong',
  type: 'error',
});
```

## Testing Strategy

After implementing each screen:

1. **Visual Check**: Verify colors match design system
2. **Layout Check**: Verify spacing is consistent
3. **Interaction Check**: Test button presses, modal opens/closes
4. **Type Check**: Run `tsc --noEmit` to ensure no type errors
5. **Device Test**: Test on both iOS and Android simulators

## Performance Notes

- Components use React.memo where appropriate
- BottomSheet uses Animated API (optimized)
- No unnecessary re-renders with proper key usage
- Toast doesn't block UI (positioned absolutely)

## Accessibility

All components include:
- accessibilityRole props
- accessibilityLabel props
- Proper tab navigation order
- Color contrast ratios ≥ 4.5:1

## Troubleshooting

### Components not importing
- Verify path: `src/components/shared/index.ts` exists
- Check tsconfig.json has path mapping: `"@/components": ["./src/components"]`

### Theme tokens not available
- Verify: `src/theme/index.ts` exists
- Check path mapping for `@/theme`

### BottomSheet not showing
- Ensure ref is properly forwarded: `const ref = useRef<BottomSheetHandle>(null)`
- Call `ref.current?.show()` to display

### Toast overlapping with other UI
- Use `position: 'top'` for lower screens if needed
- Adjust `duration` for different message types

## Next Steps

1. **Start with Phase 1** (LoginScreen, HomeScreen)
2. **Implement BottomSheet replacements** (highest impact on UX)
3. **Roll out Button components** (used everywhere)
4. **Apply theme tokens** (colors, spacing, typography)
5. **Final pass**: Audit entire app for any remaining hardcoded values

## Support

If a new component pattern emerges:
1. Create it in `src/components/shared/`
2. Add it to `src/components/shared/index.ts` exports
3. Document the pattern in this guide
4. Update all relevant screens

---

**Last Updated**: Phase 2 Start (Shared Components Created)  
**Status**: Ready for implementation
