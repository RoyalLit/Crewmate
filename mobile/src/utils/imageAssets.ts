import { Asset } from 'expo-asset';

export const CHAT_BG_LIGHT = require('../../assets/images/chat_bg_light.png');
export const CHAT_BG_DARK = require('../../assets/images/chat_bg_dark.png');

export function preloadChatAssets() {
  return Asset.loadAsync([CHAT_BG_LIGHT, CHAT_BG_DARK]);
}
