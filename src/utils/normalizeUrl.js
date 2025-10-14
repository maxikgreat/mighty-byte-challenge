export function normalizeUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    new URL(url);
    return url;
  }
  const normalizedUrl = `http://${url}`;
  new URL(normalizedUrl);
  return normalizedUrl;
}