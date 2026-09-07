import { defaultSettings } from "./content";
import { DEFAULT_IMAGES } from "./images";

/**
 * Merge whatever is stored in the database on top of the defaults in
 * lib/content.js, one level at a time. Arrays are replaced wholesale (a saved
 * list of categories replaces the default list); objects are merged key by key,
 * so a partial save never wipes fields the admin form did not touch.
 */
export function mergeSettings(saved) {
  if (!saved || typeof saved !== "object") return withImages(defaultSettings);

  const out = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings)) {
    const base = defaultSettings[key];
    const next = saved[key];
    if (next === undefined || next === null) continue;
    if (Array.isArray(base)) out[key] = Array.isArray(next) ? next : base;
    else if (typeof base === "object") out[key] = { ...base, ...next };
    else out[key] = next;
  }
  // keys the defaults don't know about (future-proofing)
  for (const key of Object.keys(saved)) {
    if (!(key in out)) out[key] = saved[key];
  }
  return withImages(out);
}

/** Fold the uploaded image overrides onto the slot defaults from lib/images.js */
function withImages(settings) {
  const images = { ...DEFAULT_IMAGES };
  Object.entries(settings.images || {}).forEach(([k, v]) => {
    if (!v) return;
    images[k] = { ...(images[k] || { x: 50, y: 50, zoom: 1 }), ...v };
  });
  return { ...settings, resolvedImages: images };
}

/** Categories in display order: assigned to a keyword first, then the rest. */
export function orderedCategories(settings) {
  const order = (settings.keywords || []).map((k) => k.id);
  const cats = settings.categories || [];
  const rank = (c) => {
    const i = order.indexOf(c.keyword);
    return i === -1 ? order.length + 1 : i;
  };
  return [...cats].sort((a, b) => rank(a) - rank(b));
}

/** The categories that belong to one keyword. */
export function categoriesForKeyword(settings, keywordId) {
  return (settings.categories || []).filter((c) => c.keyword === keywordId);
}

/** Categories with no keyword — shown at the bottom of the portfolio. */
export function unassignedCategories(settings) {
  const order = (settings.keywords || []).map((k) => k.id);
  return (settings.categories || []).filter((c) => !order.includes(c.keyword));
}
