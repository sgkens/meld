export type MeldState<T> = T;

export interface MeldHtml {
  (strings: TemplateStringsArray, ...values: any[]): DocumentFragment;
}

export interface MeldOptions {
  emit: (event: string, detail?: any) => void;
  [key: string]: any;
}

export function defineMeld(
  tagName: string, 
  setupFn: (el: HTMLElement, context: MeldOptions) => DocumentFragment | void
): void;

export function meldState<T extends object>(initial: T): MeldState<T>;

export function computed<T>(getter: () => T): () => T;

export function meldHtml(strings: TemplateStringsArray, ...values: any[]): DocumentFragment;

export function onMount(fn: () => void): void;
export function onDestroy(fn: () => void): void;

export function provide(key: string, value: any): void;
export function inject<T>(key: string, defaultValue?: T): T;

export function use(plugin: object, options?: object): void;

export namespace meld {
  function theme(css: string): void;
  function raw(html: string): { __raw: string };
  function list<T>(
    items: T[] | (() => T[]), 
    keyFn: (item: T) => string | number, 
    renderFn: (item: T, index: number) => DocumentFragment | Node | string
  ): () => DocumentFragment;
  function css(classes: Record<string, any>): string;
  function style(styles: Record<string, string | number>): string;
}
