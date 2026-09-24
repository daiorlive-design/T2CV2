/**
 * Participant ID for research logging.
 *
 * The researcher sends each participant a link like
 *   https://your-site.vercel.app/?p=P01
 * The code is read from the link and remembered in this browser, so it is kept
 * if the participant reloads the page without the "?p=" part.
 * Opening a link with a different ?p= replaces the stored code.
 */

const STORAGE_KEY = "thoughts2code-participant";
const URL_PARAMS = ["p", "participant", "pid"];

function clean(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 64);
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null;
}

export function getParticipantId(): string | null {
  let fromUrl: string | null = null;
  try {
    const params = new URLSearchParams(window.location.search);
    for (const name of URL_PARAMS) {
      fromUrl = clean(params.get(name));
      if (fromUrl) break;
    }
  } catch {
    // ignore
  }

  try {
    if (fromUrl) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    return clean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return fromUrl;
  }
}
