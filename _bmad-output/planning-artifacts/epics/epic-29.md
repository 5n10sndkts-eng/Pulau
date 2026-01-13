## Epic 29: Vendor Analytics & Payout Dashboard

**Goal**: Provide vendors with comprehensive analytics and real-time payout visibility.

**Stories**:

### 29-1: Create Vendor Revenue Dashboard

- Display total revenue, pending payouts, and completed payouts
- Show revenue trends over time (daily/weekly/monthly)
- Filter by experience and date range
- AC: Revenue chart with selectable time periods

### 29-2: Build Experience Performance Metrics

- Display booking count, conversion rate, and average rating per experience
- Show slot utilization percentage
- Identify top-performing experiences
- AC: Performance table with sortable columns

### 29-3: Implement Payout History Table

- Display all Stripe Connect payouts with status
- Show transfer amounts, fees, and net amounts
- Link to Stripe dashboard for details
- AC: Paginated payout history with export capability

### 29-4: Create Booking Funnel Analytics

- Track views → add-to-cart → checkout → confirmation
- Show conversion rates at each step
- Identify drop-off points
- AC: Funnel visualization with percentage drop-offs

### 29-5: Add Real-Time Revenue Notifications

- Notify vendor when booking confirmed
- Show daily/weekly revenue summaries
- Push notification support (browser notifications)
- AC: Toast notifications for new bookings

**Dependencies**: Epic 22 (Stripe Connect), Epic 27 (Vendor Operations)

---
