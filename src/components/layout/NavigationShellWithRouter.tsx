import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Compass, Heart, UserCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CustomerNotificationBell } from '@/components/CustomerNotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationShellWithRouterProps {
  children: ReactNode;
  showNav?: boolean;
}

export function NavigationShellWithRouter({
  children,
  showNav = true,
}: NavigationShellWithRouterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabs = [
    { id: '/', label: 'Trip', icon: Map },
    { id: '/explore', label: 'Explore', icon: Compass },
    { id: '/saved', label: 'Saved', icon: Heart },
    { id: '/profile', label: 'Profile', icon: UserCircle },
  ];

  // Determine active tab based on pathname
  // Simple exact match or startsWith for nested routes
  const activeTab =
    tabs.find((tab) => {
      if (tab.id === '/')
        return (
          location.pathname === '/' || location.pathname.startsWith('/trip')
        );
      return location.pathname.startsWith(tab.id);
    })?.id || '';

  return (
    <div className="relative min-h-screen flex flex-col bg-background font-body">
      {/* Header / Brand */}
      <header className="sticky top-0 z-40 w-full glass border-b border-primary/10 px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          aria-label="Go to homepage"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Map
              className="w-5 h-5 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight text-primary">
            Pulau
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Bell - only show when logged in */}
          {user && <CustomerNotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/5 transition-colors"
            onClick={() => navigate('/profile')}
            aria-label="View Profile"
          >
            <UserCircle
              className="w-6 h-6 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </div>
      </header>

      {/* Main Content Area - Increased bottom padding for dual-bar visibility (Nav + Trip Bar) */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 pb-48 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
          aria-label="Main Navigation"
        >
          <div className="max-w-md mx-auto glass rounded-2xl shadow-2xl border border-primary/5 flex items-center justify-around h-20 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 p-2 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -inset-1 bg-primary/10 rounded-xl"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-transform group-hover:scale-110',
                      isActive && 'fill-current',
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Quick Add / Plan Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-accent/40 hover:scale-110 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
              aria-label="Start Planning"
            >
              <PlusCircle className="w-8 h-8" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
