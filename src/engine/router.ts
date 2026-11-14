/** Hash routes: #home, #ep-<id>, #story-<id>, #shelf, #about. A page mounts into the app root and may return a cleanup. */
export type Page = (root: HTMLElement, param: string) => void | (() => void);

export interface Routes {
  home: Page;
  ep: Page;
  story: Page;
  shelf: Page;
  about: Page;
}

export function go(hash: string): void {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

export function startRouter(root: HTMLElement, routes: Routes): void {
  let cleanup: void | (() => void);

  const render = (): void => {
    const hash = location.hash.replace(/^#/, '') || 'home';
    if (cleanup) cleanup();
    root.replaceChildren();
    window.scrollTo(0, 0);
    if (hash.startsWith('ep-')) cleanup = routes.ep(root, hash.slice(3));
    else if (hash.startsWith('story-')) cleanup = routes.story(root, hash.slice(6));
    else if (hash === 'shelf') cleanup = routes.shelf(root, '');
    else if (hash === 'about') cleanup = routes.about(root, '');
    else cleanup = routes.home(root, '');
  };

  window.addEventListener('hashchange', render);
  render();
}
