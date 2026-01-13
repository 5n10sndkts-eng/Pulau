import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  PlusCircle,
  Heart,
  UserCircle,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Screen } from '@/lib/types';

interface NavigationShellProps {
  children: ReactNode;
  currentScreen: Screen;
  onTabChange: (tab: 'home' | 'explore' | 'saved' | 'profile') => void;
  showNav: boolean;
}

export function NavigationShell({
  children,
  currentScreen,
  onTabChange,
  showNav,
}: NavigationShellProps) {
  const tabs = [
    { id: 'home', label: 'Trip', icon: Map },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background font-body">
      {/* Header / Brand */}
      <header className="sticky top-0 z-40 w-full glass border-b border-primary/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Map className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight text-primary">
            Pulau
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-primary/5 transition-colors">
            <UserCircle className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 pb-24 top-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.type}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
          <div className="max-w-md mx-auto glass rounded-2xl shadow-2xl border border-primary/5 flex items-center justify-around h-20 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentScreen.type === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 p-2 transition-all group',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
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
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Quick Add Button In Nav Center if needed, but keeping it simple for now */}
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-accent/40 hover:scale-110 transition-all active:scale-90"
            >
              <PlusCircle className="w-8 h-8" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
