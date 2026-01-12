import { motion, AnimatePresence } from "framer-motion"
import { useTrip } from "@/contexts/TripContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ChevronUp, ShoppingBag, Wallet } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { TripCanvas } from "./TripCanvas"
import {
  getRemainingBudget,
  getBudgetStatus,
  getBudgetStatusColor,
  formatBudgetMessage,
} from "@/lib/budgetHelpers"

export function StickyTripBar() {
  const { trip, itemCount, removeFromTrip } = useTrip()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Get user's budget preference
  const budgetPref = user?.preferences?.budget
  const remaining = budgetPref ? getRemainingBudget(budgetPref, trip.total) : null
  const budgetStatus = budgetPref ? getBudgetStatus(budgetPref, trip.total) : null
  const budgetColor = budgetStatus ? getBudgetStatusColor(budgetStatus) : ''

  // Pulse effect on update
  useEffect(() => {
    if (itemCount > 0) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [trip.total, itemCount])

  if (itemCount === 0) return null

  const handleCheckout = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsOpen(false)
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: isHighlighted ? [1, 1.05, 1] : 1
          }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            scale: { duration: 0.3 }
          }}
          className="fixed bottom-0 left-0 right-0 z-[100] pb-safe pointer-events-none"
        >
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              {/* The actual interactive bar card */}
              <div
                className={`
                  text-left w-full
                  pointer-events-auto 
                  mx-auto max-w-md 
                  bg-background/80 backdrop-blur-md 
                  border-t border-x border-border shadow-2xl rounded-t-2xl 
                  flex items-center justify-between p-4 pb-4
                  transition-transform duration-200
                  ${isHighlighted ? 'scale-[1.02] ring-2 ring-primary/50' : 'scale-100'}
                  cursor-pointer
                  hover:bg-accent/50
                  focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
                `}
                role="button"
                tabIndex={0}
                aria-label={`View trip summary: ${itemCount} items for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.total)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary relative">
                    <ShoppingBag size={20} />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      Total <ChevronUp size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                    <span className="font-bold font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.total)}
                    </span>
                    {/* Budget Remaining (AC #1) */}
                    {budgetPref && remaining !== null && (
                      <span className={`text-[10px] font-medium flex items-center gap-1 ${budgetColor}`}>
                        <Wallet size={10} />
                        {formatBudgetMessage(budgetPref, trip.total)}
                      </span>
                    )}
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={handleCheckout}
                    size="sm"
                    className="font-bold shadow-md"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <TripCanvas
                trip={trip}
                onRemoveItem={removeFromTrip}
                onCheckout={handleCheckout}
              />
            </DrawerContent>
          </Drawer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

