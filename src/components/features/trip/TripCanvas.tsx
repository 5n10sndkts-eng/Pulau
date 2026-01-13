import { Trip, TripItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatPrice, getExperienceById, formatDateRange } from '@/lib/helpers';
import { Trash2, Calendar, MapPin, X } from 'lucide-react';

interface TripCanvasProps {
  trip: Trip;
  onRemoveItem: (experienceId: string) => void;
  onCheckout: () => void;
}

export function TripCanvas({
  trip,
  onRemoveItem,
  onCheckout,
}: TripCanvasProps) {
  const getItemDetails = (item: TripItem) => {
    const exp = getExperienceById(item.experienceId);
    return {
      title: exp?.title || 'Unknown Experience',
      image: exp?.images[0],
      location: exp?.destination,
      category: exp?.category,
    };
  };

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md">
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <DrawerTitle className="text-xl font-display font-bold">
            Your Trip
          </DrawerTitle>
          <Badge variant="secondary" className="font-mono">
            {formatPrice(trip.total)}
          </Badge>
        </div>
        <DrawerDescription>
          {trip.items.length} {trip.items.length === 1 ? 'item' : 'items'} •{' '}
          {formatDateRange(trip.startDate, trip.endDate)}
        </DrawerDescription>
      </DrawerHeader>

      <ScrollArea className="h-[50vh] px-4">
        {trip.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <p>Your trip is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trip.items.map((item, index) => {
              const details = getItemDetails(item);
              return (
                <div
                  key={`${item.experienceId}-${index}`}
                  className="flex gap-3 bg-card border rounded-lg p-3 relative group"
                >
                  {details.image && (
                    <img
                      src={details.image}
                      alt={details.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {details.title}
                      </h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <MapPin size={10} />
                        <span className="truncate">{details.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 font-normal"
                        >
                          {item.guests} {item.guests === 1 ? 'Guest' : 'Guests'}
                        </Badge>
                        {item.date && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveItem(item.experienceId)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t mt-auto bg-background">
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(trip.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-sm font-medium">
          <span className="text-muted-foreground">Service Fee</span>
          <span>{formatPrice(trip.serviceFee)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center mb-6 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(trip.total)}</span>
        </div>

        <DrawerFooter className="px-0 pt-0 pb-safe">
          <Button
            size="lg"
            className="w-full font-bold text-md"
            onClick={onCheckout}
            disabled={trip.items.length === 0}
          >
            Proceed to Checkout
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </div>
  );
}
