const STORAGE_KEY = "mmo-ex-save-v1";
const SAVE_VERSION = 1;

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ok: true, data: null, message: "New local world created." };
    }

    const parsed = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION || typeof parsed !== "object") {
      return { ok: false, data: null, message: "Old save ignored. Starting fresh." };
    }

    return { ok: true, data: parsed, message: "Local save loaded." };
  } catch (error) {
    return { ok: false, data: null, message: "Save could not be read. Starting fresh." };
  }
}

export function saveGame(snapshot) {
  const payload = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    ...snapshot,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload.savedAt;
}

export function resetSave() {
  localStorage.removeItem(STORAGE_KEY);
}
