export const getSafeReturnURL = (from: unknown, origin: string): string => {
  if (typeof from !== 'string' || from.trim() === '') {
    return '/';
  }

  try {
    const url = new URL(from, origin);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';

    if (!isHttp || url.origin !== origin || url.username || url.password) {
      return '/';
    }

    return url.href;
  } catch {
    return '/';
  }
};