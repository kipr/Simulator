/**
 * construct is a helper to allow you to create a redux message constructor with the type field specified.
 */
export default <T extends { type: unknown }>(type: T['type']) => (params: Omit<T, 'type'>): T => ({
  ...params,
  type,
}) as unknown as T;