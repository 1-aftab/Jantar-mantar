const KEY = 'jantar-mantar-protest-mayhem-v1';

export const defaultSave = () => ({
  completed: [],
  score: 0,
  settings: { music: true, sfx: true, voice: true, shake: true },
  bestChaos: 0,
  seenIntro: false
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    const stored = raw ? JSON.parse(raw) : null;
    return stored ? { ...defaultSave(), ...stored, settings: { ...defaultSave().settings, ...stored.settings } } : defaultSave();
  } catch {
    return defaultSave();
  }
}

export function writeSave(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* offline games still run if storage is full */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
