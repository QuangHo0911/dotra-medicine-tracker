# Dotra Medicine Tracker — Continuation Plan

## Current branch / repo state
- Repo path: `/Users/apple/.openclaw/workspace/dotra-medicine-tracker`
- Branch: `UX-enhancement`
- Latest local commit:
  - `33d709a`
  - `feat: scaffold auth flow and redesign core medicine UI`
- Push failed because current GitHub auth does not have permission to `QuangHo0911/dotra-medicine-tracker`

## What has already been implemented

### 1. Auth foundation
Added:
- `src/context/AuthContext.tsx`
- `src/services/auth.ts`
- `src/screens/AuthWelcomeScreen.tsx`
- `src/screens/LoginScreen.tsx`
- `src/screens/RegisterScreen.tsx`
- `src/screens/ForgotPasswordScreen.tsx`

Status:
- Auth structure exists
- Email auth flow scaffolding exists
- Google OAuth path started
- Profile model + initials avatar fallback introduced

### 2. Navigation restructure
Changed:
- `App.tsx`
- `src/navigation/AppNavigator.tsx`

Status:
- Auth-gated navigation structure exists
- Main tabs and completion screen are wired conceptually

### 3. Home redesign direction
Added/changed:
- `src/screens/HomeScreen.tsx`
- `src/components/CalendarStrip.tsx`
- `src/components/MedicineCard.tsx`
- `src/components/InitialsAvatar.tsx`

Status:
- Dark header style exists
- Real date header exists
- Horizontal calendar strip exists
- Streak/fire concept introduced
- Medicine cards redesigned
- Empty state redesigned

### 4. Completion flow
Added:
- `src/screens/CompletionScreen.tsx`

Status:
- Emotional completion screen exists
- Confetti path exists
- Daily progress / streak summary is partially wired

### 5. Settings/profile direction
Changed:
- `src/screens/SettingsScreen.tsx`

Status:
- Profile/account UI direction started
- Avatar upload entry exists, but persistence is incomplete

### 6. Data / state layer
Changed:
- `src/context/MedicineContext.tsx`
- `src/config/firebase.ts`
- `src/services/firebase.ts`
- `src/services/storage.ts`
- `src/services/notifications.ts`
- `src/utils/dateUtils.ts`
- `src/types/index.ts`

Status:
- Expanded state model for auth/profile/streak/progress
- Notification typings fixed
- Utilities for calendar/streak logic added

## Validation already done

### Clean now
- `npx tsc --noEmit` passes
- `npx expo-doctor` passes `17/17`

### Dependencies already aligned
Installed/fixed:
- `expo-auth-session`
- `expo-image-picker`
- `expo-web-browser`
- `react-native-svg`
- SDK-compatible picker versions

## OAuth / credentials status

### Google OAuth client created
Saved in workspace root:
- `/Users/apple/.openclaw/workspace/Credentials/google-oauth-client.json`

Contains:
- Google OAuth web client ID
- Redirect URI:
  - `https://auth.expo.io/@quangho0911/dotra-medicine-tracker`

### Expo username
- `quangho0911`

## What still needs to be done

# Phase 1 — Finish auth flow properly

## 1. Verify Firebase Auth setup
Need to confirm:
- Firebase Email/Password auth is enabled
- Firebase Google auth provider is enabled

Likely next check:
- Inspect Firebase console expectations
- Verify current config in app matches actual Firebase project behavior

## 2. Wire Google OAuth cleanly
Current status:
- Client info exists
- Code path exists
- Not fully verified end-to-end

Tasks:
- Load Google client ID from safe config/env path
- Avoid hardcoding secrets in repo
- Verify `expo-auth-session` redirect strategy works with current Expo setup
- Test Google sign-in flow end-to-end
- Hydrate/create user profile after OAuth login

## 3. Verify email auth flow
Tasks:
- Test register
- Test login
- Test forgot password
- Verify profile creation
- Verify auth state persistence on app restart

## 4. Clean profile behavior
Tasks:
- Manual signup → initials avatar from first + last name
- OAuth signup → use provider name/avatar
- Fallback behavior if fields missing
- Prevent profile duplication or bad hydration

# Phase 2 — Stabilize navigation/runtime behavior

## 5. Verify auth gate
Tasks:
- Unauthenticated → auth flow
- Authenticated → main app
- Logout → returns to auth flow
- Completion screen route doesn’t break stack history

## 6. Sanity-check all screens after auth changes
Need to verify:
- Home
- Settings
- Create Medicine
- Edit Medicine
- Completion

# Phase 3 — Finish home/calendar/streak feature

## 7. Verify calendar strip behavior
Goal behavior:
- Show real dates
- Not selectable
- Horizontal scroll
- Previous weeks + one week ahead
- Today visually emphasized
- Fire icon for streak dates

Tasks:
- Verify current date window logic
- Confirm scroll centering works well
- Ensure no tap/select behavior
- Polish styling to better match mockup

## 8. Finish streak logic
Need to confirm implementation behavior:
- Day counts only when all scheduled doses are completed
- Streak shown on calendar as fire
- Streak breaks correctly
- Completion summary uses correct streak

Tasks:
- Verify daily completion calculation
- Verify current streak calculation
- Verify streak dates shown in calendar
- Edge-case test with no medicines / partial doses / multiple medicines

## 9. Verify completion trigger
Goal:
- Completion screen should appear when the user finishes all required doses for the day
- Ideally only once per day

Tasks:
- Verify `checkMedicine` summary logic
- Verify “already seen today” handling
- Verify completion still re-computes correctly if doses are unchecked/rechecked

# Phase 4 — Finish create/edit flow polish

## 10. Redesign Create Medicine screen to match mockup style
Constraint:
Keep current fields only:
- Medicine name
- Times per day
- Duration days
- Reminders enabled
- Reminder times

Do not add:
- Dosage amount
- Form/type
- Frequency
- First dose time
- Food requirement

Tasks:
- Update header style
- Update form blocks/cards
- Improve spacing and hierarchy
- Use capsule icon only
- Match new visual language more closely

## 11. Redesign Edit Medicine screen similarly
Tasks:
- Same visual language as create
- Keep existing logic
- Keep delete affordance clean
- Make bottom actions consistent

# Phase 5 — Finish settings/profile

## 12. Finish avatar handling
Current state:
- Upload entry exists
- Persistence not finished

Tasks:
- Implement avatar image persistence strategy
- Decide whether to store local URI only or upload to Firebase Storage
- If using Firebase Storage, wire upload flow
- Update profile after avatar change

## 13. Improve settings/profile screen
Tasks:
- Make profile card cleaner
- Show account provider if useful
- Keep sync/logout/clear actions stable
- Ensure no broken flows after auth integration

# Phase 6 — Firebase/storage cleanup

## 14. Decide source of truth for profile + medicine data
Need to stabilize:
- Local storage fallback
- Firebase sync behavior
- Merge behavior between local and cloud
- User-scoped data assumptions

Tasks:
- Verify current merge logic
- Verify no accidental data leakage across users
- Verify medicines don’t break when auth state changes

## 15. Verify notifications after refactor
Tasks:
- Reminders still schedule properly
- Updated reminders still work
- Deleting medicine cancels reminders
- No typing/runtime errors remaining around notifications

# Phase 7 — Final polish and delivery

## 16. Run final checks
Must run:
- `npx tsc --noEmit`
- `npx expo-doctor`
- Likely also `npx expo start` for runtime sanity

## 17. Review diff and clean rough edges
Tasks:
- Remove any dead code from half-finished paths
- Tighten naming and consistency
- Check UI copy
- Verify no secrets accidentally committed where they shouldn’t be

## 18. Git push problem
Current blocker:
- Local commit exists
- Push failed with `403`

Need in next session:
- Either switch git auth to an account with push access
- Or push to a fork
- Or let user fix remote permissions first

## Recommended immediate next step in new session
Prompt to resume with:

> Continue `dotra-medicine-tracker` from branch `UX-enhancement` at local commit `33d709a`. First verify Firebase auth + Google provider setup using the existing workspace credentials file at `/Users/apple/.openclaw/workspace/Credentials/google-oauth-client.json`, then finish auth runtime verification before more UI polish.

## Extra context worth carrying into the new session
- User wants regular progress updates without needing to ask
- User wants features done one by one, not giant silent refactors
- User explicitly asked to commit and push; commit succeeded, push failed due to GitHub permission mismatch
- Do not claim Google OAuth is done until end-to-end verified with Firebase + Expo flow
