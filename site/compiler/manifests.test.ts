import { getPrerenderPaths } from './manifests';

it('adds both frozen and canonical standalone demo paths to prerender inputs', () => {
  const paths = getPrerenderPaths();

  expect(paths).toContain('/~demos/src-base-ui-button-demo-demos');
  expect(paths).toContain('/~demos/src-button-demos-index');
  expect(paths).toContain('/~demos/button, variant-demo-demos');
  expect(paths).not.toContain('/~demos/button%2C%20variant-demo-demos');
  expect(paths).toContain('/~demos/src-button-demos-variant');
  expect(new Set(paths).size).toBe(paths.length);
});

it('prerenders a real not-found document for the root 404 artifact', () => {
  expect(getPrerenderPaths()).toContain('/404');
});

it('prerenders the generated agent documents', () => {
  const paths = getPrerenderPaths();

  expect(paths).toContain('/llms.txt');
  expect(paths).toContain('/skills.md');
});
