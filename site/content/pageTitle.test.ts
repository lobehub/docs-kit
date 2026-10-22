import { formatPageTitle } from './pageTitle';

it('appends the site title to a page title', () => {
  expect(formatPageTitle('Button', 'Lobe UI')).toBe('Button - Lobe UI');
  expect(formatPageTitle('LobeHub UI Kit', 'Lobe UI')).toBe('LobeHub UI Kit - Lobe UI');
});

it('shows the site title once when the page is titled after the site', () => {
  expect(formatPageTitle('Streamdown', 'Streamdown')).toBe('Streamdown');
  expect(formatPageTitle(' Lobe Docs Kit ', 'Lobe Docs Kit')).toBe('Lobe Docs Kit');
});
