import safeFetchUrlChecked from '../safe-fetch-url';

jest.mock('../safe-fetch', () => {
  return jest.fn(() => Promise.resolve({ text: async () => 'ok' } as any));
});

describe('safe-fetch-url', () => {
  test('allows safe urls and delegates to safeFetch', async () => {
    const res = await safeFetchUrlChecked('https://example.com/');
    const text = await res.text();
    expect(text).toBe('ok');
  });

  test('blocks private urls', async () => {
    await expect(safeFetchUrlChecked('http://127.0.0.1/')).rejects.toThrow('Unsafe URL');
  });
});
