# Dotra: Medicine Tracker

A cross-platform mobile app for tracking medication doses with a visual "loyalty card" style interface. Built with React Native, Expo, and Firebase.

## Features

- **Visual Medicine Cards**: Track doses by tapping circles on a "loyalty card" style interface
- **Daily Reminders**: Schedule push notifications for medication times
- **Progress Tracking**: See completion percentage and days remaining
- **Confetti Celebration**: Animated celebration when a medicine course is completed
- **Cloud Sync**: Data syncs to Firebase for backup and cross-device access
- **Offline Support**: Works without internet, syncs when reconnected

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI**: React Native Paper
- **Backend**: Firebase (Auth, Firestore, Cloud Messaging)
- **Storage**: AsyncStorage (local) + Firestore (cloud)
- **Notifications**: Expo Notifications
- **Animations**: React Native Confetti Cannon

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── MedicineCard.tsx
│   ├── CircleCarousel.tsx
│   ├── Stepper.tsx
│   └── ConfettiCelebration.tsx
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── CreateMedicineScreen.tsx
│   ├── EditMedicineScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/        # Navigation configuration
│   └── AppNavigator.tsx
├── context/           # React Context for state management
│   └── MedicineContext.tsx
├── hooks/            # Custom React hooks
│   ├── useMedicines.ts
│   └── useNotifications.ts
├── services/         # External service integrations
│   ├── firebase.ts
│   ├── storage.ts
│   └── notifications.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   └── dateUtils.ts
└── config/           # Configuration files
    └── firebase.ts
```

## Firebase Setup Guide

Since this is your first time with Firebase, here's a step-by-step guide:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it: `dotra-medicine-tracker`
4. Enable Google Analytics (optional but recommended)
5. Accept terms and create the project

### Step 2: Register Your App

1. In Firebase Console, click the **Web** icon (`</>`) to add a web app
2. App nickname: `dotra-web`
3. Click "Register app"
4. **Copy the firebaseConfig object** - you'll need these values

### Step 3: Enable Firebase Services

**Authentication:**
1. Go to "Build" > "Authentication"
2. Click "Get started"
3. Enable "Anonymous" sign-in method
4. Save

**Firestore Database:**
1. Go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your region (closest to your users)
5. Enable

### Step 4: Add Config to App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase values from Step 2:
   ```
   FIREBASE_API_KEY=AIza...
   FIREBASE_AUTH_DOMAIN=dotra-medicine-tracker.firebaseapp.com
   FIREBASE_PROJECT_ID=dotra-medicine-tracker
   FIREBASE_STORAGE_BUCKET=dotra-medicine-tracker.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## Running the App

### Prerequisites

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install dependencies
cd medicine-tracker
npm install
```

### Development

```bash
# Start the development server
npx expo start

# Options:
# - Scan QR code with Expo Go app (iOS/Android)
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web browser
```

### Testing on Physical Device

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Run `npx expo start` in your terminal
3. Scan the QR code displayed
4. Test all features including push notifications

## Building for Production

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configure Build

```bash
eas build:configure
```

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

## Verification Checklist

Before releasing, verify:

- [ ] App launches without errors
- [ ] Can create a medicine with all fields
- [ ] Medicine card displays correctly
- [ ] Circle carousel shows correct number of circles
- [ ] Tapping circle marks it checked/unchecked
- [ ] At least one empty circle always visible
- [ ] Can edit medicine details
- [ ] Can delete medicine with confirmation
- [ ] Reminder notifications schedule correctly
- [ ] Medicine turns green when completed
- [ ] Confetti animation plays on completion
- [ ] Data persists after app restart
- [ ] Data syncs to Firebase when online
- [ ] App works offline

## App Store Submission Checklist

### iOS App Store

- [ ] Create App Store Connect record
- [ ] Generate certificates with EAS
- [ ] Build with `eas build --platform ios`
- [ ] Submit with `eas submit --platform ios`

### Google Play Store

- [ ] Create Play Console app
- [ ] Generate Android signing key with EAS
- [ ] Build with `eas build --platform android`
- [ ] Upload AAB to Play Console

### Required Assets

- [ ] App icon (1024x1024)
- [ ] Splash screen (1242x2436)
- [ ] Screenshots for App Store (5.5", 6.5", iPad)
- [ ] Screenshots for Play Store (phone, tablet)
- [ ] App description and keywords
- [ ] Privacy policy URL

## Troubleshooting

### Firebase not connecting

- Check that all environment variables are set in `.env`
- Verify Firebase project is in "Test mode" (Firestore rules)
- Check console for specific error messages

### Notifications not working

- Must test on physical device (not simulator)
- Ensure notification permissions are granted
- Check iOS/Android specific configuration in app.json

### Build errors

- Clear cache: `npx expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Reset Metro bundler cache

## License

MIT

## Support

For issues or questions, please check the Firebase documentation or Expo documentation.
