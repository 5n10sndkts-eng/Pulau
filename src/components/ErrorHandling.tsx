import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Palmtree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumContainer } from '@/components/ui/premium-container';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sparkles, Compass } from 'lucide-react';

interface NetworkStatusProps {
  children: React.ReactNode;
}

export function NetworkStatusWrapper({ children }: NetworkStatusProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowBanner(false);
      toast.success('Connection restored', {
        icon: '🌴',
        className: 'bg-teal-50 text-teal-900 border-teal-200',
      });
    };

    const handleOffline = () => {
      setShowBanner(true);
      toast.error('No internet connection', {
        icon: '📴',
        className: 'bg-slate-900 text-white',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-slate-900/90 backdrop-blur-md text-white border-b border-white/10"
          >
            <div className="container mx-auto flex items-center justify-between py-2 px-4">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white/10 rounded-full">
                  <WifiOff className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium tracking-wide uppercase">
                  Connection Lost
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-3 w-3 animate-spin-slow" />
                Reconnect
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

interface SoldOutBadgeProps {
  spotsLeft: number;
}

export function SoldOutBadge({ spotsLeft }: SoldOutBadgeProps) {
  if (spotsLeft === 0) {
    return (
      <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
        Sold Out
      </div>
    );
  }

  if (spotsLeft <= 3) {
    return (
      <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        Only {spotsLeft} left
      </div>
    );
  }

  return null;
}

interface SoldOutOverlayProps {
  onWaitlist: () => void;
  onViewSimilar: () => void;
}

export function SoldOutOverlay({
  onWaitlist,
  onViewSimilar,
}: SoldOutOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
      <PremiumContainer variant="glass" className="max-w-xs space-y-4 p-8">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Palmtree className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900">Experience Full</h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            This journey is fully booked for your dates. We can notify you if a
            spot opens up.
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <Button
            onClick={onWaitlist}
            className="w-full bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-700/20"
          >
            Join Waitlist
          </Button>
          <Button
            onClick={onViewSimilar}
            variant="ghost"
            className="w-full text-xs text-slate-500 hover:text-teal-600"
          >
            View Similar
          </Button>
        </div>
      </PremiumContainer>
    </div>
  );
}

export function ErrorMessage({
  title = 'A Little Breeze in the Tropics',
  message = 'Something unexpected happened. Let’s get you back on track.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <PremiumContainer
          variant="glass"
          className="max-w-md space-y-6 p-10 text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center shadow-inner">
            <Palmtree className="h-8 w-8 text-teal-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="group relative w-full overflow-hidden bg-teal-600 hover:bg-teal-700 transition-all duration-300 px-8 py-6 rounded-xl shadow-xl shadow-teal-900/10"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">
                    Refresh View
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-2xl">
                    Bali Awaits
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This experience is currently fully booked. Would you like to
                    be notified if a spot becomes available for your dates?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Palmtree className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      We'll alert you via email and push notification.
                    </span>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      toast.success(
                        "You're on the list! We'll alert you if a spot opens up. 🌴",
                      )
                    }
                    className="bg-primary hover:bg-primary/90"
                  >
                    Keep Me Posted
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </PremiumContainer>
      </motion.div>
    </div>
  );
}
