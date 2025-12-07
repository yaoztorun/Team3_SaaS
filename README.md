<div align="center">
  <img src="assets/icon.png" alt="Sippin Logo" width="100"/>
  <h1>Sippin</h1>
</div>

### Overview
**Sippin** is a Progressive Web App (PWA) that helps cocktail lovers log, rate, and explore drinks.  
Users can discover cocktails they can make with ingredients at home, add their own recipes, and plan parties.

Built with React Native (Web/PWA), Sippin delivers a native-like mobile experience directly in the browser, with offline support and installability on any device.

### 🌐 Live Demo
Try the app at [team3-saas.vercel.app](https://team3-saas.vercel.app)

### ✨ Key Features

**Cocktail Logging & Rating 📝**  
Track every drink you've tried with detailed ratings and personal notes

**Smart Discovery 🔍**  
Find cocktails based on ingredients you already have at home — no more guessing what you can make

**Recipe Creation 👨‍🍳**  
Design and share your own signature cocktails with the community

**AI Bartender Assistant 🤖**  
Get expert tips, techniques, and cocktail history from our intelligent chatbot

**Bar Finder 📍**  
Discover great cocktail bars in your area

**Curated Shop 🛒**  
Browse Sippin-approved bartending tools and cocktail gear from trusted partners

**Progressive Web App 📱**  
- Works offline with full PWA support
- Install directly to your home screen on any device
- Native-like mobile experience in your browser  

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

## Initial Setup

Install dependencies before running the app for the first time:

```bash
npm install
```

</br>

## Web Development Mode

The primary way to develop and test Sippin is through the web browser.

```bash
npm run web
```

This opens the app in your default browser with hot reloading enabled.

>💡 Tip: Use Chrome DevTools (F12) to simulate mobile devices and test responsive design.

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

# Build and serve PWA locally
npm run pwa

# TypeScript check
npx tsc --noEmit

# Diagnose environment
npx expo doctor
```

</br>

## Deployment

The app uses **continuous deployment** via GitHub Actions to Vercel:
- Push to `main` → deploys to **Production** ([team3-saas.vercel.app](https://team3-saas.vercel.app))
- Push to `dev` → deploys to **Development** ([team3-saasdev.vercel.app](https://team3-saasdev.vercel.app))

No manual deployment needed — just push your code!


