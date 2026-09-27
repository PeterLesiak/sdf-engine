export type Enum<T> = T[keyof T];

export type Branded<T, Key extends string> = T & { __brand: Key };

export type Radians = Branded<number, 'radians'>;
export type Degrees = Branded<number, 'degress'>;

export type Seconds = Branded<number, 'seconds'>;
