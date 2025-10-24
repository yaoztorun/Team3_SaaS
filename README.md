# 🍸 Cocktail Companion

### Overview
**Cocktail Companion** is a SaaS web application that helps cocktail lovers log, rate, and explore drinks.  
Users can discover cocktails they can make with ingredients at home, add their own recipes, and plan parties with smart recommendations.

### Key Features
- Log and rate cocktails you’ve tried  
- Find cocktails based on ingredients you have  
- Create and share your own recipes  
- Estimate bottle quantities for parties  
- Get bartending tips, techniques, and history  

<br>

## Tech Stack
- **Front end**: React Native (TypeScript)
- **Mobile local testing**: Expo Go
- **Back end**: Supabase
- **Styling**: NativeWind
- **UI Component Library**: GlueStack UI
- **DB**: Supabase SQL 
- **Hosting**: Vercel
- **CI/CD**: Github Actions 

<br>

# 🔑 Environment Variables

Each developer must create their own **`.env` file** at the root of the project before running locally.

> ⚠️ Do **NOT** commit your `.env` file — it contains your personal Supabase credentials.

### 🧩 Example `.env` file

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
````

### 🧭 Where to find these values

1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. Navigate to **Project Settings → API**.
4. Copy the **Project URL** → use it as your `EXPO_PUBLIC_SUPABASE_URL`.
5. Copy the **anon public key** under **Project API Keys** → use it as your `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

💡 Restart your development server after adding or changing `.env`.

---

## Contributing

For contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

# Technical

## ⚙️ **0) Prerequisites (Windows)**

✅ **Node.js LTS installed** → check:

```bash
node -v
npm -v
```

📲 **Expo Go** on your phone (App Store / Play Store)
💻 **Laptop & phone** on same Wi-Fi (or use `--tunnel` mode)

⚠️ If `npx` errors mention `cmd.exe` in a PHP folder, fix:

```
ComSpec → C:\Windows\System32\cmd.exe
```

Then reopen VS Code.

## 🚀 **1) Create the project (in an empty folder)**

```bash
# from the desired parent folder
mkdir mobile-app && cd mobile-app
npx create-expo-app@latest . --template blank-typescript
```

📘 Docs → [Expo Quickstart](https://docs.expo.dev/get-started/start-developing/)

## 🎨 **2) Add NativeWind (Tailwind for React Native)**

```bash
npm i nativewind tailwindcss
npx tailwindcss init
npm i -D babel-preset-expo
```

🧾 **tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
```

🧩 **babel.config.js**
*(only Babel file you should have)*

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
```

📘 **tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "types": ["nativewind/types"]
  }
}
```

🚫 Ensure there is **no `.babelrc` file** and **no `"babel"` block** inside `package.json`.

## 🧠 **3) Quick UI Sanity Test**

Replace your **App.tsx** with:

```tsx
import { StatusBar } from "expo-status-bar";
import { View, Text, Pressable } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-500">NativeWind ✅</Text>
      <Text className="mt-2 text-gray-600">Tailwind-style classes on RN</Text>
      <Pressable className="mt-6 rounded-xl px-5 py-3 bg-blue-500 active:opacity-80">
        <Text className="text-white font-semibold">Tap me</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}
```

## 🧩 **4) Run the app (development)**

Use **tunnel mode** so your phone connects easily:

```bash
npx expo start -c --tunnel
```

* Scan the QR with **Expo Go**
* Terminal shortcuts:

  * **w** → open web
  * **a** → Android emulator
  * **i** → iOS simulator (Mac)

> 💡 If a blank tab opens on port 8081 (from VS Code Live Server), click **“Port: 8081 / Go Live”** to stop it and use the Expo web URL shown in the terminal instead.

## 🛠️ **5) Useful Commands / Checks**

```bash
# start with tunnel (phone friendly)
npx expo start --tunnel

# start web + clear cache
npx expo start --web -c --tunnel

# TypeScript check
npx tsc --noEmit

# Diagnose environment
npx expo doctor
```

## 🧰 **6) Common Issues & Fixes**

### ❌ Babel error about `babel-preset-expo` or `.plugins`

```bash
npm i -D babel-preset-expo
# keep ONLY babel.config.js at root
# remove .babelrc and "babel" in package.json
npx expo start -c
```

### ⚠️ `className` TypeScript error

* Add `"types": ["nativewind/types"]` to **tsconfig.json**
* Restart TS server:
  `Ctrl + Shift + P → TypeScript: Restart TS Server`

### 📶 Phone times out

* Use tunnel:

  ```bash
  npx expo start --tunnel
  ```
* Update **Expo Go**
* Ensure both devices share same network


