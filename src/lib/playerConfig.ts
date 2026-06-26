// Iframe sandbox — blocks popup ads and parent-page redirects.
// allow-scripts + allow-same-origin: player JS and its own cookies work.
// Deliberately excludes: allow-popups, allow-top-navigation.
export const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock';

export const IFRAME_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';

export const PLAYER_TIMEOUT_MS = 12000;
export const LONG_WATCH_MS = 60000;
export const QUICK_SWITCH_MS = 10000;
