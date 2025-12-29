/**
 * React Refresh preamble - robust init for Vite dev
 */

// Extend Window interface for React Refresh globals
declare global {
  interface Window {
    $RefreshReg$?: () => void;
    $RefreshSig$?: () => (type: any) => any;
    __vite_plugin_react_preamble_installed__?: boolean;
  }
}

export async function ensureReactRefresh() {
  if (typeof window === 'undefined') return;
  if (!import.meta.env.DEV) return;

  try {
    // Load Vite React Refresh runtime and inject into global hook
    // Using dynamic import to avoid bundling in prod
    // @ts-ignore - virtual module provided by Vite dev server
    const RefreshRuntime = await import('/@react-refresh');
    if (RefreshRuntime?.injectIntoGlobalHook) {
      RefreshRuntime.injectIntoGlobalHook(window);
    }

    // Safety fallbacks
    if (!window.$RefreshReg$) window.$RefreshReg$ = () => {};
    if (!window.$RefreshSig$) window.$RefreshSig$ = () => (type: any) => type;

    window.__vite_plugin_react_preamble_installed__ = true;
  } catch (e) {
    // If runtime can't be loaded, install harmless fallbacks to avoid crashes
    if (!window.$RefreshReg$) window.$RefreshReg$ = () => {};
    if (!window.$RefreshSig$) window.$RefreshSig$ = () => (type: any) => type;
  }
}

