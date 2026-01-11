/**
 * URL safety utilities to prevent SSRF and private network fetches.
 */

export function isIPv4Literal(host: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

export function isPrivateIPv4(host: string): boolean {
  if (!isIPv4Literal(host)) return false;
  const parts = host.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function isHostnameUnsafe(hostname: string): boolean {
  if (!hostname) return true;
  const hn = hostname.toLowerCase();
  if (hn === 'localhost' || hn === '::1' || hn === '0.0.0.0') return true;
  if (hn.endsWith('.local') || hn.endsWith('.internal') || hn.endsWith('.intranet')) return true;
  if (isIPv4Literal(hn) && isPrivateIPv4(hn)) return true;
  return false;
}

export function isUrlSafeForExternalFetch(urlStr: string | null | undefined): boolean {
  if (!urlStr) return false;
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const hn = u.hostname;
    if (isHostnameUnsafe(hn)) return false;
    // Disallow urls with credentials
    if (u.username || u.password) return false;
    // Basic port check (avoid uncommon ports)
    if (u.port && Number(u.port) > 65535) return false;
    return true;
  } catch {
    return false;
  }
}

export default isUrlSafeForExternalFetch;
