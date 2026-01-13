import { useNetworkSync } from '@/hooks/useNetworkSync';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBanner() {
  const { isOnline } = useNetworkSync();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-2 text-center text-sm font-semibold flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          You are currently in offline mode.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
