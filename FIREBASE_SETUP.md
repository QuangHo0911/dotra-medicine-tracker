# Firebase Setup Guide

This guide will help you complete the Firebase configuration for the Medicine Tracker app.

## Prerequisites

1. [Node.js](https://nodejs.org/) installed
2. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
3. A Firebase project created at [Firebase Console](https://console.firebase.google.com)

## Configuration Files

The following files have been created:

| File | Purpose |
|------|---------|
| `.env` | Environment variables (already configured) |
| `firestore.rules` | Security rules to protect user data |
| `firestore.indexes.json` | Database indexes for queries |
| `firebase.json` | Firebase project configuration |

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase (if not already done)

```bash
firebase init
```

Select:
- Firestore
- Emulators (optional, for local testing)

When asked about rules and indexes files, use the existing ones.

### 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Security Rules Overview

The security rules (`firestore.rules`) ensure:

- Users can **only read** their own medicines
- Users can **only create** medicines with their own `userId`
- Users can **only update** their own medicines
- Users can **only delete** their own medicines

## Environment Variables

Your `.env` file is already configured with your Firebase project credentials. For production builds, ensure these are set in your deployment environment.

## Testing Locally (Optional)

Start the Firebase emulators:

```bash
firebase emulators:start
```

This starts:
- Firestore emulator on port 8080
- Auth emulator on port 9099
- Emulator UI on port 4000

Update your app config to use emulators during development if needed.

## Troubleshooting

### Permission Denied Errors
If you see "Missing or insufficient permissions":
1. Ensure you've deployed the security rules
2. Check that the user is authenticated
3. Verify the medicine document has the correct `userId` field

### Environment Variable Errors
If Firebase fails to initialize:
1. Check that `.env` file exists in the project root
2. Ensure all required variables are set
3. Restart the Metro bundler: `npx expo start -c`

## Next Steps

1. Enable Firestore Database in Firebase Console if not already enabled
2. Deploy the security rules
3. Test the app to ensure data sync works correctly
