export type SandboxMode = 'balanced' | 'compat' | 'none';

export const SANDBOX: Record<Exclude<SandboxMode, 'none'>, string> = {
  balanced: 'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups',
  compat:   'allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-popups allow-popups-to-escape-sandbox',
};

export const IFRAME_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';

export function applySandbox(iframe: HTMLIFrameElement, mode: SandboxMode): void {
  if (mode === 'none') {
    iframe.removeAttribute('sandbox');
    return;
  }
  iframe.setAttribute('sandbox', SANDBOX[mode]);
}
