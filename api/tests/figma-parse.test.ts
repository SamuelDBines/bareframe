import { describe, expect, it } from 'vitest';
import { parseFigmaDesignUrl } from '../src/figma/parse-url.js';

describe('parseFigmaDesignUrl', () => {
  it('parses design URLs with node id', () => {
    const parsed = parseFigmaDesignUrl(
      'https://www.figma.com/design/AbCdEf/My-File?node-id=1-2',
    );
    expect(parsed).toEqual({ fileKey: 'AbCdEf', nodeId: '1:2' });
  });

  it('parses legacy file URLs', () => {
    const parsed = parseFigmaDesignUrl('https://www.figma.com/file/XyZ99/Legacy');
    expect(parsed).toEqual({ fileKey: 'XyZ99', nodeId: undefined });
  });

  it('rejects non-Figma hosts', () => {
    expect(parseFigmaDesignUrl('https://example.com/design/x')).toBeNull();
  });
});
