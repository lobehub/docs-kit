import path from 'node:path';

export const kitRoot = path.resolve(import.meta.dirname, '..');
export const playgroundRoot = path.resolve(kitRoot, 'playground');
export const fixturesRoot = path.resolve(kitRoot, 'tests/fixtures/site');
