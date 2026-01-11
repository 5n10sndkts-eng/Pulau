
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketPage } from './TicketPage'
import * as useOnlineStatusHook from '@/hooks/useOnlineStatus'

// Mock the hook
vi.mock('@/hooks/useOnlineStatus', () => ({
    useOnlineStatus: vi.fn()
}))

// Mock formatDistanceToNow to avoid timezone/flakiness issues
vi.mock('date-fns', () => ({
    formatDistanceToNow: () => '2 hours ago'
}))

const mockTicketData = {
    bookingId: 'booking-123',
    qrCodeUrl: 'data:image/png;base64,mock-qr-code',
    experienceName: 'Sunset Snorkeling',
    dateTime: '2026-06-15T10:00:00Z',
    guestCount: 2,
    meetingPoint: 'Harbor Point A',
    vendorName: 'Bali Aqua',
    vendorContact: '+62 812 3456 7890',
    bookingReference: 'PL-ABC12345',
    lastUpdated: Date.now()
}

describe('TicketPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        // Default to online
        vi.mocked(useOnlineStatusHook.useOnlineStatus).mockReturnValue(true)
    })

    it('should render ticket details correctly', () => {
        render(<TicketPage ticketData={mockTicketData} />)

        expect(screen.getByText('Sunset Snorkeling')).toBeInTheDocument()
        expect(screen.getByText('Bali Aqua')).toBeInTheDocument()
        expect(screen.getByText('PL-ABC12345')).toBeInTheDocument()
        expect(screen.getByText('Harbor Point A')).toBeInTheDocument()
        expect(screen.getByText('2 Guests')).toBeInTheDocument()
    })

    it('should show simplified loading state', () => {
        const { container } = render(<TicketPage loading={true} />)
        // Check for skeletons (simplified check for structure presence)
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0)
    })

    it('should show "Ticket not found" when no data provided', () => {
        render(<TicketPage ticketData={undefined} />)
        expect(screen.getByText('Ticket not found')).toBeInTheDocument()
    })

    it('should show offline banner when offline', () => {
        vi.mocked(useOnlineStatusHook.useOnlineStatus).mockReturnValue(false)
        render(<TicketPage ticketData={mockTicketData} />)

        expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()
    })

    it('should show refresh button only when online', () => {
        const onRefresh = vi.fn()

        // Online
        vi.mocked(useOnlineStatusHook.useOnlineStatus).mockReturnValue(true)
        const { rerender } = render(<TicketPage ticketData={mockTicketData} onRefresh={onRefresh} />)
        expect(screen.getByText('Refresh')).toBeInTheDocument()

        // Offline
        vi.mocked(useOnlineStatusHook.useOnlineStatus).mockReturnValue(false)
        rerender(<TicketPage ticketData={mockTicketData} onRefresh={onRefresh} />)
        expect(screen.queryByText('Refresh')).not.toBeInTheDocument()
    })

    it('should call onRefresh when refresh button clicked', () => {
        const onRefresh = vi.fn()
        render(<TicketPage ticketData={mockTicketData} onRefresh={onRefresh} />)

        fireEvent.click(screen.getByText('Refresh'))
        expect(onRefresh).toHaveBeenCalledTimes(1)
    })
})
