# 🏝️ Pulau - Premium Travel Experience Builder

A Bali vacation builder connecting travelers with authentic local tours, activities, and hospitality services through seamless digital booking.

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?logo=tailwindcss)

## ✨ Features

- **Trip Canvas Building** - Visual itinerary builder with calendar-style trip view
- **Experience Discovery** - Browse categorized local experiences with smart filtering
- **Detailed Experience Pages** - Rich multimedia pages with operator stories and reviews
- **Multi-Step Checkout** - Guided booking process with progress indication
- **Onboarding Preferences** - Quick preference capture for personalized recommendations
- **Booking History & Trip Management** - Comprehensive dashboard for all bookings
- **Vendor Portal** - Dashboard for local operators to manage experiences

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Radix UI, Framer Motion
- **Backend**: Supabase (Auth, Database, RLS)
- **State Management**: React Query (TanStack Query)
- **Testing**: Vitest, Playwright, React Testing Library
- **Icons**: Phosphor Icons, Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/5n10sndkts-eng/Pulau.git
cd Pulau

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## 📁 Project Structure

```
src/
├── components/       # UI components
│   ├── auth/         # Authentication components
│   ├── checkout/     # Checkout flow components
│   ├── common/       # Shared components
│   ├── layout/       # Layout components
│   ├── ui/           # Base UI components (Radix-based)
│   └── vendor/       # Vendor portal components
├── contexts/         # React contexts (Auth, etc.)
├── lib/              # Services and utilities
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── dataService.ts
│   ├── supabase.ts
│   ├── tripService.ts
│   └── vendorService.ts
├── screens/          # Screen-level components
└── hooks/            # Custom React hooks
```

## 🎨 Design System

Inspired by Bali's natural palette:
- **Primary**: Deep Teal `#0D7377` - tropical ocean waters
- **Accent**: Warm Coral `#FF6B6B` - sunset warmth
- **Golden**: Sand `#F4D03F` - highlights and ratings
- **Success**: Soft Green `#27AE60` - confirmations

Typography: Plus Jakarta Sans (display) + Inter (body)

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
