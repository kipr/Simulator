export default <T extends { type: unknown }>(type: T['type']) => (params: Omit<T, 'type'>): T => ({
  ...params,
  type,
}) as unknown as T;