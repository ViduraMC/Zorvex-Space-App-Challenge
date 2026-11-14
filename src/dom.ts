/** Create an element with a class, optional text and optional parent. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
  parent?: HTMLElement,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  parent?.appendChild(node);
  return node;
}

/** A button that runs a handler. */
export function button(className: string, text: string, onClick: (event: MouseEvent) => void, parent?: HTMLElement): HTMLButtonElement {
  const b = el('button', className, text, parent);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

/** A link styled as a button (hash routes and external sources). */
export function link(className: string, text: string, href: string, parent?: HTMLElement): HTMLAnchorElement {
  const a = el('a', className, text, parent);
  a.href = href;
  if (/^https?:/.test(href)) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text before placing it inside markup built as a string (SVG patches). */
export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
