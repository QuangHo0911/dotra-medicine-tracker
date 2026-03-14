# UX Design Philosophy

## Required Field Indicators

- **All required form fields must display a red asterisk (*) before the label**
- This provides immediate visual recognition of mandatory inputs without user interaction
- Red color signifies importance and draws attention to fields that must be completed
- The asterisk should appear at the beginning of the label (e.g., "* Name") rather than the end
- Do not use red asterisks for optional fields — omit any indicator for optional inputs

## Icon Library

- **Use Lucide icons throughout the app** (`lucide-react-native`)
- Lucide provides a clean, modern, consistent icon style that matches the app's design aesthetic
- Import icons from `lucide-react-native` instead of `@expo/vector-icons`
- Examples: `import { Pill, MoreVertical, CheckCircle, Pencil, Trash2 } from 'lucide-react-native';`
- Avoid Material Design icons as they don't match the app's visual style
