import { Platform } from 'react-native';

const INSTALL_PROMPT_SHOWN_KEY = 'sippin_install_prompt_shown';
const INSTALL_PROMPT_SKIPPED_KEY = 'sippin_install_prompt_skipped';
const PWA_INSTALLED_KEY = 'sippin_pwa_installed';

/**
 * Check if the app should show the install prompt
 */
export const shouldShowInstallPrompt = (): boolean => {
  if (Platform.OS !== 'web') return false;

  // Check if already installed
  if (isPWAInstalled()) return false;

  // Check if user has already skipped
  const hasSkipped = localStorage.getItem(INSTALL_PROMPT_SKIPPED_KEY) === 'true';
  if (hasSkipped) return false;

  // Check if prompt was already shown
  const hasShown = localStorage.getItem(INSTALL_PROMPT_SHOWN_KEY) === 'true';
  return !hasShown;
};

/**
 * Mark that the install prompt has been shown
 */
export const markInstallPromptShown = (): void => {
  if (Platform.OS === 'web') {
    localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, 'true');
  }
};

/**
 * Mark that user skipped the install prompt
 */
export const markInstallPromptSkipped = (): void => {
  if (Platform.OS === 'web') {
    localStorage.setItem(INSTALL_PROMPT_SKIPPED_KEY, 'true');
  }
};

/**
 * Mark that the PWA has been installed
 */
export const markPWAInstalled = (): void => {
  if (Platform.OS === 'web') {
    localStorage.setItem(PWA_INSTALLED_KEY, 'true');
  }
};

/**
 * Check if the PWA is installed (running in standalone mode)
 */
export const isPWAInstalled = (): boolean => {
  if (Platform.OS !== 'web') return false;

  // Check if marked as installed in localStorage
  if (localStorage.getItem(PWA_INSTALLED_KEY) === 'true') return true;

  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) {
    markPWAInstalled();
    return true;
  }

  // Check iOS standalone mode
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    markPWAInstalled();
    return true;
  }

  return false;
};

/**
 * Check if browser supports PWA installation
 */
export const supportsPWAInstall = (): boolean => {
  if (Platform.OS !== 'web') return false;
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

/**
 * Get install prompt event (for Chrome/Edge on Android)
 */
let deferredPrompt: any = null;

export const setupInstallPrompt = (): void => {
  if (Platform.OS !== 'web') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('Install prompt ready');
  });

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    markPWAInstalled();
    deferredPrompt = null;
  });
};

/**
 * Trigger the browser's native install prompt (Android Chrome/Edge)
 */
export const triggerInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      markPWAInstalled();
      deferredPrompt = null;
      return true;
    } else {
      console.log('User dismissed the install prompt');
      return false;
    }
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
};

/**
 * Check if device is iOS
 */
export const isIOSDevice = (): boolean => {
  if (Platform.OS !== 'web') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Reset install prompt state (for testing)
 */
export const resetInstallPromptState = (): void => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(INSTALL_PROMPT_SHOWN_KEY);
    localStorage.removeItem(INSTALL_PROMPT_SKIPPED_KEY);
    localStorage.removeItem(PWA_INSTALLED_KEY);
  }
};
