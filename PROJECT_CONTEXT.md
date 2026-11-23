# GameLibrarian — Project Context

This file describes the whole project so any AI assistant or new developer can get oriented quickly. Read it fully before suggesting or writing code.

## 1. What the app is

A mobile app where gamers **organize their game library**: add games, categorize them, set a play status (backlog, playing, completed, etc.), and see simple stats. Data is stored **locally on the device only** (no backend or database yet).

Working name: GameLibrarian (taken from the project folder name).

## 2. Tech stack

- **React Native with Expo** (managed workflow)
- **Expo Router** (file-based routing) with the app code under `src/app`
- **JavaScript with JSX. Do NOT use TypeScript/TSX.** All files are `.js` / `.jsx`.
- **AsyncStorage** (`@react-native-async-storage/async-storage`) for local persistence
- **zod (v4+)** for login form validation (uses `z.email(...)`)
- **expo-status-bar**, **react-native-safe-area-context** (both ship with Expo)
- Plain `StyleSheet` styling. No UI library, no Tailwind/NativeWind.

## 3. Folder structure

```
assets/
  icons/                 custom PNG tab icons: home, news, library, profile
src/
  app/
    _layout.jsx          root layout: providers, StatusBar, login-vs-tabs gating
    login.jsx            login screen (outside the tabs, so no navbar)
    (tabs)/              parentheses are required (route group)
      _layout.jsx        the bottom tab navbar
      index.jsx          Home (stats, currently playing, recently added)
      news.jsx           placeholder
      library.jsx        placeholder (next to build)
      profile.jsx        placeholder
  components/
    AppScreen.jsx        screen wrapper (ivory background, ScrollView, padding)
    AppButton.jsx        primary button
    AppTextInput.jsx     text input
  context/
    AuthContext.jsx      in-memory login state: isLoggedIn, login(), logout()
  library/
    storage.js           the ONLY file that touches AsyncStorage
    LibraryContext.js    state + actions for games and categories
  theme/
    colors.js            every color in the app
scripts/                 Expo template helper (reset-project), unrelated to the app
```

Important: files inside `src/app` become routes. Never put helpers or data files there.

## 4. Navigation and auth flow

- Root layout (`src/app/_layout.jsx`) wraps the app in `AuthProvider` and `LibraryProvider`, and renders `<StatusBar style="dark" />`.
- It uses `Stack.Protected` (needs Expo SDK 53+): `(tabs)` is only reachable when `isLoggedIn` is true, `login` only when false. After `login()` is called, the guard switches screens automatically, so no manual `router.replace` is needed.
- The bottom navbar shows on all four tabs at all times, and never on the login screen.
- Login is **mocked**: email `student@example.com`, password `password2026`. Auth state is in memory only, so the user is logged out whenever the app fully reloads.

## 5. Tab navbar (`src/app/(tabs)/_layout.jsx`)

- Four tabs in this order: **Home, News, Library, Profile** (route names: `index`, `news`, `library`, `profile`).
- Icons are the user's own PNGs rendered with `Image` and `tintColor`, so each must be a single-color PNG with a transparent background. Icon paths use `../../../assets/icons/...` because `assets` is outside `src`.
- Customizations applied: the bar is taller by `EXTRA_HEIGHT` (20px, grows upward), the icons and labels sit `ICONS_UP` (15px) higher, sizing uses `useSafeAreaInsets()`, and the Android press ripple is disabled via a custom `tabBarButton` using `Pressable`.
- Colors come from `colors.js` (active = dark purple, inactive = muted, bar background = ivory).

## 6. Data model

**Game**
```
id            string (generated)
title         string
platform      string
status        'backlog' | 'playing' | 'completed' | 'dropped' | 'wishlist'
categories    string[] (category ids)
rating        number | null (1-5)
notes         string
coverUrl      string | null
addedAt       timestamp
completedAt   timestamp | null (set automatically when status becomes 'completed')
```

**Category**: `{ id, name, color }`

Status is a fixed lifecycle. Categories are user-defined labels (RPG, Co-op, etc.). Keep them separate.

## 7. State and storage

- `storage.js` saves everything as one JSON object under the AsyncStorage key `gameLibrary`, shaped `{ version, games, categories }`. The `version` field is for future migrations. Reads fail safe to an empty library.
- `LibraryContext.js` holds state with `useReducer` and exposes `useLibrary()`:
  `games`, `categories`, `loaded`, `addGame`, `updateGame`, `setStatus`, `deleteGame`, `addCategory`, `deleteCategory`.
- New games are prepended to the array (newest first). Deleting a category also removes it from every game.
- Saving happens automatically after any change.
- When a real database is added later, only `storage.js` should need to change.

## 8. Design system

- Color scheme: **ivory and dark purple**. All colors live in `src/theme/colors.js` (`background`, `surface`, `border`, `primary`, `primaryLight`, `onPrimary`, `text`, `textMuted`, and a `status` map). Never hardcode hex values in screens. Import `colors` instead.
- The status bar is dark (black icons) on the ivory background.
- `AppScreen` accepts `centered`, `contentStyle`, and `safeTop` (adds the top safe-area inset plus 20px; opt-in, used on screens with no header such as login).
- The login screen and the three `App*` components were provided by the course instructor and then adapted to the theme. Their props are intentionally minimal. Extend them rather than replacing them.

## 9. Conventions for AI assistants

1. JSX only, never TSX.
2. Reuse `AppScreen`, `AppButton`, `AppTextInput` for new screens and forms.
3. Pull colors from `colors.js`.
4. Access persisted data only through `useLibrary()`. Never call AsyncStorage outside `storage.js`.
5. `AppScreen` wraps a `ScrollView`. For long lists use a plain `View` + `FlatList` instead, to avoid nested-scroll warnings.
6. Keep `(tabs)` spelled with parentheses and keep non-route files out of `src/app`.
7. Explain steps simply. The developer is a student building this as a learning project, so say where each file goes and what each change does.

## 10. Current status

**Done**
- Data layer (`storage.js`, `LibraryContext.js`) and auth context
- Root layout with login gating and dark status bar
- Themed tab navbar with custom icons
- Login screen (zod validation, mock credentials)
- Themed `App*` components
- Home screen (stats, completion rate, currently playing, recently added, empty state)

**To do**
- **Library screen:** full game list (`FlatList`), filters by status/category, search, sort, add/edit game form, delete with confirmation
- Game details screen
- Category manager
- News screen content (undecided)
- Profile screen content, including a logout button that calls `logout()`
- Persist login state
- JSON export/import as backup (AsyncStorage is wiped if the user clears app data)
- Home rows should open the specific game instead of just the Library tab
