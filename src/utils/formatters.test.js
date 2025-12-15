import { describe, it, expect } from 'vitest';
import { sanitizeDecimal, sanitizeActivo, sanitizeNombre, getUniqueActivos } from './formatters';

describe('formatters', () => {
  it('sanitizeDecimal allows decimals and trims to max decimals', () => {
    expect(sanitizeDecimal('123.456789', 4)).toBe('123.4567');
    expect(sanitizeDecimal('1,234.56', 2)).toBe('1234.56');
    expect(sanitizeDecimal('abc123.45def', 2)).toBe('123.45');
  });

  it('sanitizeActivo returns uppercase letters limited to 10 chars', () => {
    expect(sanitizeActivo('btc')).toBe('BTC');
    expect(sanitizeActivo('b!t@c#o$i^n')).toBe('BITCOIN');
  });

  it('sanitizeNombre returns uppercase and strips invalid chars', () => {
    expect(sanitizeNombre('Bitcoin 123')).toBe('BITCOIN');
  });

  it('getUniqueActivos computes unique uppercase activos, optionally filtering by usuarioId', () => {
    const txs = [
      { activo: 'btc', usuarioId: 'u1' },
      { activo: 'BTC', usuarioId: 'u1' },
      { activo: 'eth', usuarioId: 'u2' },
      { activo: 'xrp', usuarioId: 'u1' },
    ];

    expect(getUniqueActivos(txs)).toEqual(['BTC', 'ETH', 'XRP']);
    expect(getUniqueActivos(txs, 'u1')).toEqual(['BTC', 'XRP']);
    expect(getUniqueActivos(txs, 'u2')).toEqual(['ETH']);
  });
});
