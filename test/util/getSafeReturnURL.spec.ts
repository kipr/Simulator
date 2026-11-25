import { getSafeReturnURL } from '../../src/util/getSafeReturnURL';

const origin = 'https://kipr.example';

describe('getSafeReturnURL', () => {
    test.each([
        '/',
        '/scene/abc',
        '/challenge/xyz?x=1',
        '/scene/abc?tab=code#editor',
    ])('returns the full same-origin URL for %s', (from) => {
        expect(getSafeReturnURL(from, origin)).toBe(`${origin}${from}`);
    });

    test('keeps the origin when the parsed pathname begins with two slashes', () => {
        const from = `${origin}//scene/abc`;

        expect(getSafeReturnURL(from, origin)).toBe(from);
    });

    test.each([
        { label: 'missing value', from: undefined },
        { label: 'empty value', from: '' },
        { label: 'whitespace-only value', from: '   ' },
        { label: 'array value', from: ['/scene/abc'] },
        { label: 'object value', from: { path: '/scene/abc' } },
        { label: 'malformed URL', from: 'https://[' },
        { label: 'different hostname', from: 'https://other.example/scene/abc' },
        { label: 'different port', from: 'https://kipr.example:8443/scene/abc' },
        { label: 'different scheme', from: 'http://kipr.example/scene/abc' },
        { label: 'external URL starting with two slashes', from: '//other.example' },
        { label: 'external URL starting with slash and backslash', from: '/\\other.example' },
        { label: 'JavaScript URL', from: 'javascript:void(0)' },
        { label: 'embedded credentials', from: 'https://user:pass@kipr.example/' },
    ])('falls back to / for $label', ({ from }) => {
        expect(getSafeReturnURL(from, origin)).toBe('/');
    });
});