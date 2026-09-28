export type Listener<T extends any[] = []> = (...params: T) => void;

export function isSignal(value: unknown): value is Signal {
  return value instanceof Signal;
}

export class Signal<T extends any[] = []> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);

    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }

  emit(...params: T): this {
    if (this.listeners.size === 0) return this;

    const snapshot = Array.from(this.listeners);

    for (const listener of snapshot) {
      listener(...params);
    }

    return this;
  }

  clear(): this {
    this.listeners.clear();

    return this;
  }
}
