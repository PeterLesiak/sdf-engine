import { isSignal } from './signal';

export function isDictionary(value: unknown): value is Record<any, any> {
  return value !== null && typeof value === 'object';
}

export function observeStore<T extends Record<string, any>>(
  store: T,
  onChange: () => void,
): T {
  for (const key in store) {
    const value = store[key];

    if (isDictionary(value) && isSignal(value.change)) {
      value.change.subscribe(onChange);
    }
  }

  return new Proxy(store, {
    get(target, property, receiver) {
      return Reflect.get(target, property, receiver);
    },

    set(target, property, newValue, receiver) {
      const oldValue = Reflect.get(target, property, receiver) as unknown;
      const success = Reflect.set(target, property, newValue, receiver);

      if (success && oldValue !== newValue) {
        if (typeof newValue === 'number') {
          onChange();
        }

        if (isDictionary(newValue) && isSignal(newValue.change)) {
          if (isDictionary(oldValue) && isSignal(oldValue.change)) {
            oldValue.change.unsubscribe(onChange);
          }

          newValue.change.subscribe(onChange);

          onChange();
        }
      }

      return success;
    },
  });
}
