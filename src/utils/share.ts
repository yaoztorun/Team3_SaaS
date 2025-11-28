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

export const buildShareUrl = (id: string) => `${getWebDomain()}/log/${id}`;

const composeShareText = (id: string, cocktailName?: string) => {
  const url = buildShareUrl(id);
  return cocktailName
    ? `Check out this ${cocktailName} I logged 🍸\n${url}`
    : `Check this out:\n${url}`;
};

export async function shareSystemSheet(id: string, cocktailName?: string) {
  const message = composeShareText(id, cocktailName);
  try {
    await Share.share({ message, url: buildShareUrl(id) });
  } catch (e) {
    // noop
  }
}

export async function shareToWhatsApp(id: string, cocktailName?: string) {
  const text = composeShareText(id, cocktailName);
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
    await shareSystemSheet(id, cocktailName);
  }
}

export async function copyLinkForLog(id: string) {
  const url = buildShareUrl(id);
  await Clipboard.setStringAsync(url);
  return url;
}
