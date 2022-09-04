export default <T extends { type: unknown }>(type: T['type']) => (params: Omit<T, 'type'>): T => ({
  type,
  ...params,
}) as unknown as T;