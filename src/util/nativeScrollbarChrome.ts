/**
 * Native scrollbar appearance used across classroom / leaderboard scroll regions
 * (see ClassroomTeacherView `ClassroomCardScrollContainer`, Leaderboard, etc.).
 */
export const nativeScrollbarChrome = {
  scrollbarWidth: 'thin' as const,
  scrollbarColor: 'rgba(121,121,121,0.6) transparent',
  WebkitOverflowScrolling: 'touch' as const,
  '::-webkit-scrollbar': {
    width: '14px',
    height: '14px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(121,121,121,0.4)',
    borderRadius: '8px',
  },
  '::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(121,121,121,0.7)',
  },
};
