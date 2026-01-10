import { describe, it, expect } from 'vitest';
import * as en from '@log-ui/i18n/en/common.json';
import * as es from '@log-ui/i18n/es/common.json';
import * as ca from '@log-ui/i18n/ca/common.json';
import * as de from '@log-ui/i18n/de/common.json';

// Helper function to get all keys from a nested object
const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
  return Object.keys(obj).reduce((acc: string[], key: string) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      acc.push(...getKeys(obj[key] as Record<string, unknown>, pre + key));
    } else {
      acc.push(pre + key);
    }
    return acc;
  }, []);
};

describe('i18n', () => {
  it('should have the same keys in all languages', () => {
    const enKeys = getKeys(en);
    const esKeys = getKeys(es);
    const caKeys = getKeys(ca);
    const deKeys = getKeys(de);

    expect(enKeys.sort()).toEqual(esKeys.sort());
    expect(enKeys.sort()).toEqual(caKeys.sort());
    expect(enKeys.sort()).toEqual(deKeys.sort());
  });
});
