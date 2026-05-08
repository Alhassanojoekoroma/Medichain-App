/**
 * src/components/shared/index.ts
 * 
 * Shared components library barrel export
 * This is the single import source for all UI components
 */

export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as BottomSheet } from './BottomSheet';
export type { BottomSheetHandle, BottomSheetAction } from './BottomSheet';

export { default as Toast } from './Toast';
export type { ToastHandle, ToastOptions } from './Toast';

export { Card, CardTitle, CardBody, CardFooter } from './Card';

export { default as Badge } from './Badge';

export { default as TextInput } from './TextInput';

export { default as ScreenHeader } from './ScreenHeader';
