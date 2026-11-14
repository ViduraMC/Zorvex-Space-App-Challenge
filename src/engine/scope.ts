/**
 * A Scope owns everything a page or a mini-game creates (DOM, listeners, timers, per-frame
 * callbacks) so that Skip, Next and Home can tear it down in one call with nothing left behind.
 *
 * Rule for async code inside a scope: await through `scope.wait()` / `scope.sleep()`.
 * After dispose those promises never settle, so abandoned code simply stops running.
 */
type FrameFn = (dt: number, time: number) => void;
const frames = new Set<FrameFn>();

/** Called once per rendered frame by the player. */
export function runFrames(dt: number, time: number): void {
  for (const fn of [...frames]) fn(dt, time);
}

export class Scope {
  alive = true;
  #cleanups: (() => void)[] = [];

  /** Register a cleanup; runs immediately if the scope is already gone. */
  add(cleanup: () => void): void {
    if (this.alive) this.#cleanups.push(cleanup);
    else cleanup();
  }

  dispose(): void {
    if (!this.alive) return;
    this.alive = false;
    for (const fn of this.#cleanups.reverse()) fn();
    this.#cleanups = [];
  }

  child(): Scope {
    const c = new Scope();
    this.add(() => c.dispose());
    return c;
  }

  /** Resolves with the promise's value only while this scope is alive. */
  wait<T>(p: Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve) => {
      void Promise.resolve(p).then((v) => {
        if (this.alive) resolve(v);
      });
    });
  }

  sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => this.alive && resolve(), ms);
      this.add(() => clearTimeout(id));
    });
  }

  listen<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K | string,
    fn: (e: HTMLElementEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, fn as EventListener, opts);
    this.add(() => target.removeEventListener(type, fn as EventListener, opts));
  }

  /** Run a callback every frame until the scope ends. */
  frame(fn: FrameFn): void {
    frames.add(fn);
    this.add(() => frames.delete(fn));
  }

  /** Create an element that is removed when the scope ends. */
  el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    parent: HTMLElement,
    text?: string,
  ): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    e.className = className;
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    this.add(() => e.remove());
    return e;
  }
}
