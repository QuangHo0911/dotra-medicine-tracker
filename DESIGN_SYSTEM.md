# Medicine Tracker Design System

A comprehensive design system built with NativeWind for consistent UI across the app.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Usage Examples](#usage-examples)
7. [Migration Guide](#migration-guide)

---

## Getting Started

### 1. Import Global CSS

Ensure `global.css` is imported in your app's entry point:

```typescript
// App.tsx or index.tsx
import '../global.css';
```

### 2. Use Tailwind Classes

Apply Tailwind utility classes using the `className` prop:

```tsx
import { View } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 bg-background p-4">
      {/* Content */}
    </View>
  );
}
```

### 3. Import Components from Theme

```tsx
import { Button, Card, Text } from './src/theme';
```

---

## Colors

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4CAF50` | Primary brand color, CTAs, active states |
| `primary-50` | `#e8f5e9` | Light backgrounds, success states |
| `primary-100` | `#c8e6c9` | Hover states, subtle highlights |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#4CAF50` | Success messages, completed states |
| `warning` | `#FF9800` | Warnings, medium priority |
| `danger` | `#ef5350` | Errors, destructive actions |
| `info` | `#2196F3` | Information, links |

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `neutral-50` | `#f8f9fa` | Page background |
| `neutral-100` | `#f5f5f5` | Card backgrounds, inputs |
| `neutral-200` | `#e0e0e0` | Borders, dividers |
| `neutral-600` | `#666` | Secondary text |
| `neutral-900` | `#1a1a1a` | Primary text |

### Usage

```tsx
// Tailwind classes
<View className="bg-primary text-white" />
<View className="bg-success-light text-success" />
<View className="border border-neutral-200" />

// Theme tokens (for dynamic styles)
import { colors } from './src/theme';
const primaryColor = colors.primary.DEFAULT;
```

---

## Typography

### Text Variants

| Variant | Size | Line Height | Weight | Usage |
|---------|------|-------------|--------|-------|
| `h1` | 28px | 36px | 700 | Page titles |
| `h2` | 24px | 32px | 700 | Section headers |
| `h3` | 20px | 28px | 700 | Card titles |
| `h4` | 18px | 26px | 600 | Subsection headers |
| `body` | 15px | 22px | 400 | Body text |
| `body-small` | 13px | 18px | 400 | Secondary text |
| `caption` | 11px | 16px | 400 | Captions, metadata |
| `label` | 13px | 18px | 600 | Form labels |
| `stat` | 24px | 32px | 800 | Statistics, numbers |

### Text Colors

- `default` - Primary text color (#1a1a1a)
- `secondary` - Secondary text color (#666)
- `muted` - Muted text color (#9e9e9e)
- `inverse` - White text for dark backgrounds
- `primary`, `success`, `warning`, `danger`, `info` - Semantic colors

### Usage

```tsx
import { Text, Heading, Caption } from './src/theme';

// Using variants
<Text variant="h2">Page Title</Text>
<Text variant="body" color="secondary">Secondary text</Text>
<Text variant="stat" color="primary">42</Text>

// Helper components
<Heading>Section Title</Heading>
<Caption>Posted 2 hours ago</Caption>
```

---

## Spacing

Based on a 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Minimal spacing |
| `2` | 8px | Tight spacing |
| `3` | 12px | Standard spacing |
| `4` | 16px | Comfortable spacing |
| `5` | 20px | Large spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Major section spacing |

### Usage

```tsx
// Padding
<View className="p-4" />     // 16px padding
<View className="px-6 py-3" /> // 24px horizontal, 12px vertical

// Margin
<View className="m-4" />     // 16px margin
<View className="mb-2" />    // 8px bottom margin

// Gap
<View className="gap-3" />   // 12px gap between children
```

---

## Components

### Button

A versatile button component with multiple variants and sizes.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `primary \| secondary \| danger \| ghost \| outline` | `primary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Button size |
| `isLoading` | `boolean` | `false` | Show loading state |
| `isDisabled` | `boolean` | `false` | Disable interaction |
| `leftIcon` | `ReactNode` | - | Icon before text |
| `rightIcon` | `ReactNode` | - | Icon after text |

#### Usage

```tsx
import { Button } from './src/theme';
import { Plus, Trash2 } from 'lucide-react-native';

// Basic button
<Button onPress={handlePress}>Click me</Button>

// With icons
<Button leftIcon={<Plus size={20} />}>
  Add Medicine
</Button>

// Variants
<Button variant="secondary">Cancel</Button>
<Button variant="danger" leftIcon={<Trash2 size={18} />}>
  Delete
</Button>
<Button variant="ghost">Dismiss</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large Button</Button>

// Loading state
<Button isLoading>Loading...</Button>
```

---

### Card

Container component with multiple variants for different states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `default \| completed \| highlighted \| outlined` | `default` | Card style |
| `isPressable` | `boolean` | `false` | Enable press interactions |

#### Sub-components

- `CardHeader` - Top section with title and actions
- `CardContent` - Main content area
- `CardFooter` - Bottom section with actions

#### Usage

```tsx
import { Card, CardHeader, CardContent, CardFooter, Badge } from './src/theme';

// Basic card
<Card>
  <CardContent>
    <Text variant="h4">Medicine Name</Text>
  </CardContent>
</Card>

// With header and footer
<Card>
  <CardHeader>
    <Text variant="h4">Aspirin</Text>
    <Badge variant="success">Active</Badge>
  </CardHeader>
  <CardContent>
    <Text>Take 1 tablet daily</Text>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Edit</Button>
    <Button variant="primary">Mark Taken</Button>
  </CardFooter>
</Card>

// Completed variant
<Card variant="completed">
  <Text>Course completed!</Text>
</Card>
```

---

### Text

Typography component with preset variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | TextVariant | `body` | Typography style |
| `color` | TextColor | `default` | Text color |
| `weight` | `normal \| medium \| semibold \| bold \| extrabold` | - | Font weight |
| `align` | `left \| center \| right` | - | Text alignment |

#### Usage

```tsx
import { Text, Heading, Caption, Label } from './src/theme';

// Variants
<Text variant="h2">Title</Text>
<Text variant="body" color="secondary">
  Description text
</Text>

// Required field label (per UX guidelines)
<Text variant="label">
  <Text className="text-danger">*</Text> Medicine Name
</Text>

// Helper components
<Heading>Quick heading</Heading>
<Caption>Small caption text</Caption>
<Label>FORM LABEL</Label>
```

---

### Modal

Dialog and modal components for overlays.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls visibility |
| `onClose` | `() => void` | Close callback |

#### Usage

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter } from './src/theme';

<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <Text variant="h3">Confirm Delete</Text>
  </ModalHeader>
  <ModalContent>
    <Text>Are you sure you want to delete this medicine?</Text>
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onPress={handleClose}>
      Cancel
    </Button>
    <Button variant="danger" onPress={handleDelete}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

---

## Usage Examples

### Complete Medicine Card Example

```tsx
import { View } from 'react-native';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Text,
  Button,
  Badge,
  cn
} from '../theme';
import { Pill, MoreVertical } from 'lucide-react-native';

function MedicineCard({ medicine, isCompleted }) {
  return (
    <Card variant={isCompleted ? 'completed' : 'default'}>
      <CardHeader>
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <Pill size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text variant="h4" numberOfLines={1}>
              {medicine.name}
            </Text>
            <Text variant="caption" color="muted">
              Day 5 of 14
            </Text>
          </View>
        </View>
        <Button variant="ghost" size="sm">
          <MoreVertical size={20} />
        </Button>
      </CardHeader>

      <CardContent>
        <View className="flex-row gap-2 flex-wrap">
          {medicine.times.map((time, i) => (
            <Badge key={i} variant="info" size="sm">
              {time}
            </Badge>
          ))}
        </View>
      </CardContent>

      <CardFooter>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          size="sm"
        >
          {isCompleted ? 'Completed' : 'Take Dose'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Form Example with Required Fields

```tsx
import { View, TextInput } from 'react-native';
import { Text, Button, Card } from '../theme';

function MedicineForm() {
  return (
    <Card className="gap-4">
      <View>
        <Text variant="label" className="mb-2">
          <Text className="text-danger">*</Text> Medicine Name
        </Text>
        <TextInput
          className="bg-background-input px-4 py-3 rounded-xl text-text"
          placeholder="Enter medicine name"
        />
      </View>

      <View>
        <Text variant="label" className="mb-2">
          <Text className="text-danger">*</Text> Dosage
        </Text>
        <TextInput
          className="bg-background-input px-4 py-3 rounded-xl text-text"
          placeholder="e.g., 500mg"
        />
      </View>

      <View className="flex-row gap-3 mt-2">
        <Button variant="ghost" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1">
          Save Medicine
        </Button>
      </View>
    </Card>
  );
}
```

---

## Migration Guide

### From StyleSheet to NativeWind

**Before (StyleSheet):**

```tsx
import { View, Text, StyleSheet } from 'react-native';

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
```

**After (NativeWind):**

```tsx
import { View } from 'react-native';
import { Text } from './src/theme';

function MyComponent() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text variant="h2">Hello</Text>
    </View>
  );
}
```

### Key Differences

1. **No StyleSheet.create** - Use Tailwind utility classes instead
2. **className prop** - Native components support `className` directly
3. **Dynamic styles** - Use the `cn()` utility for conditional classes

### Conditional Classes

```tsx
import { cn } from './src/theme';

// Conditional styling
<View
  className={cn(
    'p-4 rounded-xl',
    isActive && 'bg-primary',
    !isActive && 'bg-neutral-100',
    isDisabled && 'opacity-50'
  )}
/>
```

---

## Best Practices

1. **Use semantic colors** - Prefer `bg-success-light` over `bg-green-100`
2. **Stick to the spacing scale** - Use `p-4` (16px) instead of arbitrary values
3. **Leverage variants** - Use the pre-built component variants
4. **Maintain consistency** - Use the Text component for typography
5. **Icon colors** - Pass className to Lucide icons: `<Pill className="text-primary" />`

---

## Troubleshooting

### Classes not applying

Ensure `global.css` is imported in your app entry point.

### TypeScript errors

Add the NativeWind types to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["nativewind/types"]
  }
}
```

### Metro bundler issues

Clear the cache:

```bash
npx expo start --clear
```
