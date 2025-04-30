
export function GetBrowserLang(): string {
  console.log(navigator.language);
  switch (navigator.language) {
    case 'ja': return 'ja-JP';
    default: return 'en-US';
  }
}
