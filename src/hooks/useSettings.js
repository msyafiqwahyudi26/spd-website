import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export const DEFAULT_SETTINGS = {
  siteName: 'SPD Indonesia',
  email: 'kontak@spdindonesia.org',
  phone: '',
  images: { logo: '', hero: '', placeholder: '' },
  content: { vision: '', aboutIntro: '', heroSubtitle: '' },
  hero: { cta1: { label: '', href: '' }, cta2: { label: '', href: '' } },
  social: { facebook: '', twitter: '', linkedin: '', instagram: '', youtube: '' },
  logoHeight: 76,
};

// Local-only seed used until the API responds. Real values come from the DB.
export const DEFAULT_CATEGORIES = [
  { id: 'default-1', value: 'RISET SINGKAT', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'default-2', value: 'RISET',         color: 'text-teal-500',   bg: 'bg-teal-50'   },
  { id: 'default-3', value: 'OPINI',         color: 'text-slate-500',  bg: 'bg-slate-100' },
  { id: 'default-4', value: 'ANALISIS',      color: 'text-blue-500',   bg: 'bg-blue-50'   },
];

const SETTINGS_EVENT   = 'spd_settings_changed';
const CATEGORIES_EVENT = 'spd_categories_changed';

let cachedSettings   = null;
let cachedCategories = null;
let settingsInflight   = null;
let categoriesInflight = null;

function normalizeSettings(s) {
  if (!s || typeof s !== 'object') return DEFAULT_SETTINGS;
  return {
    siteName: typeof s.siteName === 'string' ? s.siteName : DEFAULT_SETTINGS.siteName,
    email:    typeof s.email    === 'string' ? s.email    : DEFAULT_SETTINGS.email,
    phone:    typeof s.phone    === 'string' ? s.phone    : '',
    images: {
      logo:        s.images?.logo        ?? '',
      hero:        s.images?.hero        ?? '',
      placeholder: s.images?.placeholder ?? '',
    },
    content: {
      vision:       s.content?.vision       ?? '',
      aboutIntro:   s.content?.aboutIntro   ?? '',
      heroSubtitle: s.content?.heroSubtitle ?? '',
    },
    hero: {
      cta1: {
        label: s.hero?.cta1?.label ?? '',
        href:  s.hero?.cta1?.href  ?? '',
      },
      cta2: {
        label: s.hero?.cta2?.label ?? '',
        href:  s.hero?.cta2?.href  ?? '',
      },
    },
    social: {
      facebook:  s.social?.facebook  ?? '',
      twitter:   s.social?.twitter   ?? '',
      linkedin:  s.social?.linkedin  ?? '',
      instagram: s.social?.instagram ?? '',
      youtube:   s.social?.youtube   ?? '',
    },
    logoHeight: typeof s.logoHeight === 'number' ? s.logoHeight : 76,
  };
}

function emit(name) {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(name));
}

export function loadSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (settingsInflight) return settingsInflight;
  settingsInflight = api('/settings')
    .then((d) => { cachedSettings = normalizeSettings(d); emit(SETTINGS_EVENT); return cachedSettings; })
    .catch(() => { cachedSettings = DEFAULT_SETTINGS; emit(SETTINGS_EVENT); return cachedSettings; })
    .finally(() => { settingsInflight = null; });
  return settingsInflight;
}

export function loadCategories() {
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (categoriesInflight) return categoriesInflight;
  categoriesInflight = api('/categories')
    .then((d) => {
      cachedCategories = Array.isArray(d) && d.length > 0 ? d : DEFAULT_CATEGORIES;
      emit(CATEGORIES_EVENT);
      return cachedCategories;
    })
    .catch(() => { cachedCategories = DEFAULT_CATEGORIES; emit(CATEGORIES_EVENT); return cachedCategories; })
    .finally(() => { categoriesInflight = null; });
  return categoriesInflight;
}

export function getSettingsSync() {
  if (!cachedSettings && !settingsInflight) loadSettings();
  return cachedSettings || DEFAULT_SETTINGS;
}

export function getCategoriesSync() {
  if (!cachedCategories && !categoriesInflight) loadCategories();
  return cachedCategories || DEFAULT_CATEGORIES;
}

export function useSettings() {
  const [settings,   setSettings]   = useState(() => getSettingsSync());
  const [categories, setCategories] = useState(() => getCategoriesSync());

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s)   => { if (!cancelled) setSettings(s); });
    loadCategories().then((c) => { if (!cancelled) setCategories(c); });

    const onSettings = () => setSettings(getSettingsSync());
    const onCats     = () => setCategories(getCategoriesSync());
    window.addEventListener(SETTINGS_EVENT, onSettings);
    window.addEventListener(CATEGORIES_EVENT, onCats);
    return () => {
      cancelled = true;
      window.removeEventListener(SETTINGS_EVENT, onSettings);
      window.removeEventListener(CATEGORIES_EVENT, onCats);
    };
  }, []);

  const saveSettings = useCallback(async (updates) => {
    const updated = await api('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    cachedSettings = normalizeSettings(updated);
    emit(SETTINGS_EVENT);
    return cachedSettings;
  }, []);

  const addCategory = useCallback(async ({ value, color, bg }) => {
    const created = await api('/categories', {
      method: 'POST',
      body: JSON.stringify({ value, color, bg }),
    });
    cachedCategories = [...(cachedCategories || []), created];
    emit(CATEGORIES_EVENT);
    return created;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await api(`/categories/${id}`, { method: 'DELETE' });
    cachedCategories = (cachedCategories || []).filter((c) => c.id !== id);
    emit(CATEGORIES_EVENT);
  }, []);

  return { settings, categories, saveSettings, addCategory, deleteCategory };
}
