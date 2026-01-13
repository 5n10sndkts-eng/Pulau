import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner', () => {
  it('should be hidden when online', () => {
    const { container } = render(<OfflineBanner isOnline={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should be visible when offline', () => {
    render(<OfflineBanner isOnline={false} />);
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing cached ticket data/i)).toBeInTheDocument();
  });
});
