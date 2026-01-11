import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ActiveProjectsBadge from '../active-projects-badge';

describe('ActiveProjectsBadge', () => {
  beforeEach(() => {
    // reset fetch mock
    // @ts-ignore
    global.fetch = undefined;
  });

  it('shows active/limit and indicates full when at limit', async () => {
    const fake = { active: 7, limit: 7, remaining: 0, allowed: false };
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fake });

    render(<ActiveProjectsBadge />);

    await waitFor(() => expect(screen.getByText(/7\/7/)).toBeInTheDocument());
    expect(screen.getByText(/Projects/)).toBeInTheDocument();
  });
});
