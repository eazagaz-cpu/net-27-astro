export type SandboxMode = 'strict' | 'balanced' | 'compat' | 'none';

export const SANDBOX: Record<Exclude<SandboxMode, 'none'>, string> = {
  // strict: blocks popups, new tabs, top-level redirects — safest for embed players
  strict:   'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen',
  balanced: 'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups allow-fullscreen',
  compat:   'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-fullscreen',
};

export const IFRAME_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';

export function applySandbox(iframe: HTMLIFrameElement, mode: SandboxMode): void {
  if (mode === 'none') {
    iframe.removeAttribute('sandbox');
    return;
  }
  iframe.setAttribute('sandbox', SANDBOX[mode]);
}
