import {describe, expect, it} from '@jest/globals';
import {formatPlaceholder} from './format';

describe('formatPlaceholder', () => {
  it('returns the input unchanged', () => {
    expect(formatPlaceholder('hello')).toBe('hello');
  });
});
