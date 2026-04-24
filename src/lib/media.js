import { useEffect, useState } from 'react';
import { api, BASE_URL } from '@/lib/api';

/**
 * Media-by-key client.
 *
 * Backend stores admin-curated images with optional semantic keys such as
 * "homepage.hero" or "footer.logo". Any frontend component can resolve a
 * key to a URL without knowing anything about storage:
 *
 *   const url = useMediaUrl('homepage.hero', fallbackUrl);
 *
 * Failures and missing keys resolve to the fallback. The cache is module-
 * scoped so the same key is only fetched once per page load.
 */

const cache = new Map();      // key -> { url, type, ...public fields }
const inflight = new Map();   // key -> Promise

export function resolveMediaUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
  if (relativeUrl.startsWith('/')) {
    // BASE_URL ends with "/api". Uploads are served at /uploads on the
    // same origin — strip the /api segment so the URL is correct in both
    // same-origin and cross-origin deployments.
    const origin = BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${relativeUrl}`;
  }
  return relativeUrl;
}

export async function loadMediaByKey(key) {
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const promise = api(`/media/by-key/${encodeURIComponent(key)}`)
    .then((row) => {
      const resolved = row ? { ...row, url: resolveMediaUrl(row.url) } : null;
      cache.set(key, resolved);
      return resolved;
    })
    .catch(() => {
      cache.set(key, null);
      return null;
    })
    .finally(() => { inflight.delete(key); });

  inflight.set(key, promise);
  return promise;
}

export function invalidateMediaKey(key) {
  if (key) cache.delete(key);
}

/**
 * Hook variant. Returns the resolved URL or the provided fallback.
 *   const url = useMediaUrl('footer.logo', defaultLogo);
 */
export function useMediaUrl(key, fallback = null) {
  const initial = cache.has(key) ? (cache.get(key)?.url || fallback) : fallback;
  const [url, setUrl] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    loadMediaByKey(key).then((row) => {
      if (cancelled) return;
      setUrl(row?.url || fallback);
    });
    return () => { cancelled = true; };
  }, [key, fallback]);

  return url;
}
