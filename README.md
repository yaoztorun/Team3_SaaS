# 🍸 Sippin

### Overview
**Sippin** is a Progressive Web App (PWA) that helps cocktail lovers log, rate, and explore drinks.  
Users can discover cocktails they can make with ingredients at home, add their own recipes, and plan parties with smart recommendations.

Built with React Native Web, Sippin delivers a native-like mobile experience directly in the browser, with offline support and installability on any device.

### 🌐 Live Deployments
- **Production**: [team3-saas.vercel.app](https://team3-saas.vercel.app)
- **Development**: [team3-saasdev.vercel.app](https://team3-saasdev.vercel.app)

### Key Features
- Log and rate cocktails you've tried  
- Find cocktails based on ingredients you have  
- Create and share your own recipes  
- Estimate bottle quantities for parties  
- Get bartending tips, techniques, and history
- Works offline with PWA support
- Installable on mobile and desktop devices  

<br>

## Tech Stack
- **Front end**: React Native Web (TypeScript)
- **PWA**: Progressive Web App with Service Workers
- **Back end**: Supabase
- **Styling**: NativeWind (Tailwind CSS)
- **UI Component Library**: GlueStack UI
- **DB**: Supabase PostgreSQL 
- **Hosting**: Vercel
- **CI/CD**: Github Actions 

<br>

# 🔑 Environment Variables

Each developer must create their own **`.env.local` file** at the root of the project before running locally.

> ⚠️ Do **NOT** commit your `.env.local` file — it contains your personal credentials.

A **`.env.example`** file is provided as a template. Copy it to create your own:

```bash
cp .env.example .env.local
```

Then fill in your actual values.

</br></br>

### Where to find Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. Navigate to **Project Settings → API**.
4. Copy the **Project URL** → use it as your `EXPO_PUBLIC_SUPABASE_URL`.
5. Copy the **anon public key** under **Project API Keys** → use it as your `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

💡 Restart your development server after adding or changing `.env.local`.

</br>

## Contributing

For contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

</br></br>

# 🚀 Running the App

</br>

## Web Development Mode

The primary way to develop and test Sippin is through the web browser.

```bash
npm run web
```

This opens the app in your default browser with hot reloading enabled.

>💡 Tip: Use Chrome DevTools (F12) to simulate mobile devices and test responsive design.

</br>

## Mobile Testing (Optional)

You can also test on physical devices using Expo Go:

```bash
npm start
```
Then press `w` for web, or scan the QR with Expo Go app (iOS/Android)

For tunnel mode (easier for mobile devices):
```bash
npm start -- --tunnel
```

</br>

Terminal shortcuts when running `npm start`:
```
w → open in web browser
a → open in Android emulator
i → open in iOS simulator (Mac)
```

</br>

## PWA Production Build

Build and test the production PWA locally:

```bash
npm run pwa
```

This will:
1. Export the optimized web build
2. Generate the service worker for offline support
3. Serve the PWA locally

You can then:
- Test the PWA in your browser
- Install it to your home screen (mobile) or desktop
- Test offline functionality

>💡 The production build is optimized and minified. Use this to test performance and PWA features before deploying.

</br></br>

## Useful Commands

```bash
# Start development server (default)
npm start

# Start web development server
npm run web

# Start with Android emulator
npm run android

# Start with iOS simulator (Mac only)
npm run ios

# Build and serve PWA locally
npm run pwa

# TypeScript check
npx tsc --noEmit

# Diagnose environment
npx expo doctor
```

</br>

## Deployment

The app is automatically deployed to Vercel:
- **Production branch (`main`)** → [team3-saas.vercel.app](https://team3-saas.vercel.app)
- **Development branch (`dev`)** → [team3-saasdev.vercel.app](https://team3-saasdev.vercel.app)

Push to either branch to trigger automatic deployment via GitHub Actions.


