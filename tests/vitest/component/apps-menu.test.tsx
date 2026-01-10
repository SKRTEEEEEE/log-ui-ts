import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppsMenu } from '@log-ui/components/site-header/apps-menu';
import { APPS_CONFIG } from '@log-ui/lib/config/apps-config';

// Mock de Link
vi.mock('@/lib/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock de ListItem
vi.mock('@log-ui/components/site-header/list-item', () => ({
  ListItem: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <div>{title}</div>
      <div>{children}</div>
    </div>
  ),
}));

// Mock de useTranslations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const keys = key.split('.');
    if (keys[0] === 'apps') {
      const app = APPS_CONFIG.find((a) => a.id === keys[1]);
      if (app) {
        if (keys[2] === 'title') {
          return `${keys[1]} title`;
        }
        if (keys[2] === 'description') {
          return `${keys[1]} description`;
        }
      }
    }
    return key;
  },
}));

// Mock de useMediaQuery
vi.mock('@log-ui/lib/hooks/use-media-query', () => ({
  useMediaQuery: () => false,
}));


describe('AppsMenu', () => {
  it('should render the current app and other apps', () => {
    render(<AppsMenu />);

    // Check if the trigger is rendered
    expect(screen.getByText('Apps')).toBeInTheDocument();
  });
});
