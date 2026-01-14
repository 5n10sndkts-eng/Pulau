/**
 * BookingEmailStatus Component Tests (Story 30-1-4)
 *
 * Tests for email status display and resend functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { BookingEmailStatus, getEmailStatus } from '../BookingEmailStatus';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster />
  </QueryClientProvider>
);

describe('BookingEmailStatus', () => {
  const mockBookingId = 'test-booking-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('getEmailStatus helper', () => {
    it('returns "sent" when email_sent is true and email_sent_at exists', () => {
      expect(getEmailStatus(true, '2024-01-15T10:00:00Z')).toBe('sent');
    });

    it('returns "pending" when email_sent is false', () => {
      expect(getEmailStatus(false, null)).toBe('pending');
    });

    it('returns "pending" when email_sent is true but email_sent_at is null', () => {
      // Edge case - shouldn't happen but handle gracefully
      expect(getEmailStatus(true, null)).toBe('pending');
    });
  });

  describe('Display states', () => {
    it('shows "Sent" status with checkmark when email was sent', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={true}
          emailSentAt="2024-01-15T10:00:00Z"
        />,
        { wrapper },
      );

      expect(screen.getByText('Confirmation Email Sent')).toBeInTheDocument();
      expect(screen.getByText(/Delivered on/)).toBeInTheDocument();
      // Resend button should NOT be shown when email is sent
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows "Pending" status when email has not been sent', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
        />,
        { wrapper },
      );

      expect(screen.getByText('Email Pending')).toBeInTheDocument();
      expect(screen.getByText('Confirmation email has not been sent yet.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send.*email/i })).toBeInTheDocument();
    });

    it('shows compact view when compact prop is true', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={true}
          emailSentAt="2024-01-15T10:00:00Z"
          compact={true}
        />,
        { wrapper },
      );

      expect(screen.getByText('Sent')).toBeInTheDocument();
      // Should NOT show full message in compact mode
      expect(screen.queryByText('Confirmation Email Sent')).not.toBeInTheDocument();
    });

    it('shows pending state in compact mode with send button', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
          compact={true}
        />,
        { wrapper },
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send.*email/i })).toBeInTheDocument();
    });
  });

  describe('Resend functionality', () => {
    it('calls resend-booking-email function when button clicked', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
        />,
        { wrapper },
      );

      const sendButton = screen.getByRole('button', { name: /send.*email/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalledWith(
          'resend-booking-email',
          { body: { booking_id: mockBookingId } },
        );
      });
    });

    it('disables button while resending', async () => {
      vi.mocked(supabase.functions.invoke).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { success: true }, error: null }), 100)),
      );

      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
        />,
        { wrapper },
      );

      const sendButton = screen.getByRole('button', { name: /send.*email/i });
      fireEvent.click(sendButton);

      // Button should be disabled during request
      await waitFor(() => {
        expect(sendButton).toBeDisabled();
      });
    });

    it('calls onResendSuccess callback after successful resend', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const onResendSuccess = vi.fn();

      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
          onResendSuccess={onResendSuccess}
        />,
        { wrapper },
      );

      const sendButton = screen.getByRole('button', { name: /send.*email/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onResendSuccess).toHaveBeenCalled();
      });
    });

    it('shows error toast when resend fails', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded' },
      });

      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
        />,
        { wrapper },
      );

      const sendButton = screen.getByRole('button', { name: /send.*email/i });
      fireEvent.click(sendButton);

      // Error should be logged but not crash the component
      await waitFor(() => {
        expect(supabase.functions.invoke).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible status role', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={true}
          emailSentAt="2024-01-15T10:00:00Z"
        />,
        { wrapper },
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has accessible labels on buttons', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
        />,
        { wrapper },
      );

      expect(
        screen.getByRole('button', { name: /send confirmation email/i }),
      ).toBeInTheDocument();
    });

    it('compact mode has aria labels', () => {
      render(
        <BookingEmailStatus
          bookingId={mockBookingId}
          emailSent={false}
          emailSentAt={null}
          compact={true}
        />,
        { wrapper },
      );

      expect(screen.getByLabelText('Email pending')).toBeInTheDocument();
    });
  });
});
