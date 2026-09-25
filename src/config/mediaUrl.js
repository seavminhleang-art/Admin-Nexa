import { FORUM_API_BASE_URL } from './forumApi.js';

// The API can return storage URLs containing its own localhost address.
export function mediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const source = value.trim();
  if (/^(data:|blob:|\/assets\/|\/src\/)/i.test(source)) return source;
  let path = source;
  if (/^(https?:)?\/\//i.test(source)) {
    try {
      const url = new URL(source, 'https://forum-istad-api.cheat.casa');
      if (!['localhost', '127.0.0.1', '[::1]', 'forum-istad-api.cheat.casa'].includes(url.hostname)) return source;
      path = url.pathname + url.search + url.hash;
    } catch { return ''; }
  }
  path = path.replace(/^\/(?:__forum_api|api\/v1)\/?/i, '').replace(/^\/+/, '');
  path = path.replace(/^(?:media|profile-images)\//i, '');
  return path ? `${FORUM_API_BASE_URL}/media/${path}` : '';
}
