/**
 * Represents a type that omits specific properties from another type in a distributive manner.
 * @template T - The original type.
 * @template K - The keys of the properties to be omitted from the original type.
 */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;