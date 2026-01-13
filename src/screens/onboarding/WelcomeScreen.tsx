/**
 * Welcome Screen (Onboarding Step 1/3)
 * Epic 4, Story 4.1: Create Onboarding Welcome Screen
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000)',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-12 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <h1 className="font-display text-6xl font-bold text-white">Pulau</h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 text-xl font-light text-white/90"
        >
          Build Your Bali Dream
        </motion.p>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6 text-sm font-medium text-white/60"
        >
          1 of 3
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-teal-600 text-lg font-semibold text-white hover:bg-teal-700"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
