import { Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const getWebDomain = () => {
  const envDomain = process.env.EXPO_PUBLIC_WEB_DOMAIN;
  if (envDomain) return envDomain.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://my-domain.com';
};

export const buildShareUrl = (id: string, userId?: string, shareMethod?: string) => {
  const baseUrl = `${getWebDomain()}/log/${id}`;
  
  // Add UTM parameters for tracking
  if (userId) {
    const params = new URLSearchParams({
      utm_source: 'share',
      utm_medium: shareMethod || 'unknown',
      utm_campaign: 'user_referral',
      ref: userId, // Track who shared it
    });
    return `${baseUrl}?${params.toString()}`;
  }
  
  return baseUrl;
};

// --- Cocktail share helpers ---
export const buildCocktailShareUrl = (id: string, userId?: string, shareMethod?: string) => {
  const baseUrl = `${getWebDomain()}/cocktail/${id}`;
  if (userId) {
    const params = new URLSearchParams({
      utm_source: 'share',
      utm_medium: shareMethod || 'unknown',
      utm_campaign: 'user_referral',
      ref: userId,
    });
    return `${baseUrl}?${params.toString()}`;
  }
  return baseUrl;
};

const composeShareText = (id: string, cocktailName?: string, userId?: string, shareMethod?: string) => {
  const url = buildShareUrl(id, userId, shareMethod);
  return cocktailName
    ? `Check out this ${cocktailName} I logged 🍸\n${url}`
    : `Check this out:\n${url}`;
};

export async function shareSystemSheet(id: string, cocktailName?: string, userId?: string, shareMethod?: string) {
  const message = composeShareText(id, cocktailName, userId, shareMethod);
  try {
    await Share.share({ message, url: buildShareUrl(id, userId, shareMethod) });
  } catch (e) {
    // noop
  }
}

export async function shareCocktailSystemSheet(id: string, cocktailName?: string, userId?: string, shareMethod?: string) {
  const url = buildCocktailShareUrl(id, userId, shareMethod);
  const message = cocktailName ? `Check out the ${cocktailName} recipe 🍸\n${url}` : `Check this cocktail:\n${url}`;
  try {
    await Share.share({ message, url });
  } catch (e) {
    // noop
  }
}

export async function shareToWhatsApp(id: string, cocktailName?: string, userId?: string) {
  const text = composeShareText(id, cocktailName, userId, 'whatsapp');
  const appUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
  const webUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  try {
    const can = await Linking.canOpenURL(appUrl);
    if (can) {
      await Linking.openURL(appUrl);
      return;
    }
    // fallback to web if native not available (including web platform)
    await Linking.openURL(webUrl);
  } catch {
    // best-effort fallback to system sheet
    await shareSystemSheet(id, cocktailName, userId, 'whatsapp');
  }
}

export async function copyLinkForLog(id: string, userId?: string) {
  const url = buildShareUrl(id, userId, 'copy_link');
  await Clipboard.setStringAsync(url);
  return url;
}

export async function copyLinkForCocktail(id: string, userId?: string) {
  const url = buildCocktailShareUrl(id, userId, 'copy_link');
  await Clipboard.setStringAsync(url);
  return url;
}
