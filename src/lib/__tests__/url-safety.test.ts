import { isUrlSafeForExternalFetch, isHostnameUnsafe } from '../url-safety';

describe('url-safety', () => {
  test('blocks localhost and private ips', () => {
    expect(isUrlSafeForExternalFetch('http://localhost/test')).toBe(false);
    expect(isUrlSafeForExternalFetch('http://127.0.0.1/')).toBe(false);
    expect(isUrlSafeForExternalFetch('http://10.0.0.5/')).toBe(false);
    expect(isUrlSafeForExternalFetch('http://192.168.0.1/')).toBe(false);
  });

  test('allows public urls', () => {
    expect(isUrlSafeForExternalFetch('https://example.com/path')).toBe(true);
    expect(isUrlSafeForExternalFetch('http://sub.domain.com/')).toBe(true);
  });

  test('rejects non-http(s) protocols and invalid urls', () => {
    expect(isUrlSafeForExternalFetch('ftp://example.com')).toBe(false);
    expect(isUrlSafeForExternalFetch('not-a-url')).toBe(false);
  });

  test('isHostnameUnsafe helper', () => {
    expect(isHostnameUnsafe('localhost')).toBe(true);
    expect(isHostnameUnsafe('example.local')).toBe(true);
    expect(isHostnameUnsafe('my.internal')).toBe(true);
    expect(isHostnameUnsafe('example.com')).toBe(false);
  });
});
