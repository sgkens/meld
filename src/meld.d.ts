// --------------------------------------------------------
//  MELD TYPE DEFINITIONS (v1.4.0-rc1)
// --------------------------------------------------------

export type MeldState<T> = T;

export interface MeldHtml {
  (strings: TemplateStringsArray, ...values: any[]): DocumentFragment;
}

export interface SocketHandle {
  status: 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting';
  latency: number;
  error: Error | null;
  presence: string[];
  send: (type: string, data?: any) => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  request: (type: string, data?: any) => Promise<any>;
  connect: () => void;
  disconnect: () => void;
}

export interface MeldOptions {
  emit: (event: string, detail?: any) => void;
  attrs: Record<string, any>;
  useSocket?: (urlOrOptions?: string | object) => SocketHandle;
  [key: string]: any;
}

export interface DefineMeldOptions {
  observedAttributes?: string[];
  [key: string]: any;
}

/** Registers a new Meld component */
export function defineMeld(
  tagName: string, 
  setupFn: (el: HTMLElement, context: MeldOptions) => DocumentFragment | void,
  options?: DefineMeldOptions
): void;

/** Creates a deep reactive proxy state */
export function meldState<T extends object>(initial: T): MeldState<T>;

/** Creates a derived, cached, read-only reactive value */
export function computed<T>(getter: () => T): () => T;

/** Renders reactive HTML using tagged template literals */
export function meldHtml(strings: TemplateStringsArray, ...values: any[]): DocumentFragment;

/** Component lifecycle: attached to DOM */
export function onMount(fn: () => void): void;
/** Component lifecycle: removed from DOM */
export function onDestroy(fn: () => void): void;

/** Dependency Injection: Provide value to descendants */
export function provide(key: string, value: any): void;
/** Dependency Injection: Inject value from ancestors */
export function inject<T>(key: string, defaultValue?: T): T;

/** Install a Meld plugin */
export function use(plugin: object, options?: object): void;

/** Meld Namespace Utilities */
export namespace meld {
  /** Inject global CSS into all Shadow Roots */
  function theme(css: string): void;
  /** Mark string as raw HTML (Security: Trusted only) */
  function raw(html: string): { __raw: string };
  /** Keyed list reconciliation for efficient array rendering */
  function list<T>(
    items: T[] | (() => T[]), 
    keyFn: (item: T) => string | number, 
    renderFn: (item: T, index: number) => DocumentFragment | Node | string
  ): () => DocumentFragment;
  /** Generate space-separated class string from object */
  function css(classes: Record<string, any>): string;
  /** Generate inline style string from object */
  function style(styles: Record<string, string | number>): string;
}

/** Toast Service API */
export const toast: {
  show: (msg: string, type?: string, duration?: number) => string;
  success: (msg: string) => string;
  error: (msg: string) => string;
  dismiss: (id: string) => void;
};

/** Built-in Plugin Interfaces */
export const MeldRouter: object;
export const MeldStore: object;
export const MeldQuery: object;
export const MeldPersist: object;
export const MeldPortal: object;
export const MeldSocket: object;
export const MeldA11y: object;
export const MeldAI: object;
export const MeldFederation: object;
export const MeldWasm: object;
export const MeldBroadcast: object;
export const MeldForms: object;
export const MeldTime: object;
export const MeldI18n: object;
export const MeldMotion: object;
export const MeldMarkdown: object;
export const MeldUpload: object;
export const MeldTerminal: object;
export const MeldHead: object;
export const MeldDiagnostics: object;
export const MeldVersioning: object;
export const MeldLogger: object;
export const MeldTestUtils: {
  render: (tag: string, props?: object) => {
    element: HTMLElement;
    shadowQuery: (sel: string) => HTMLElement | null;
    cleanup: () => void;
  }
};
