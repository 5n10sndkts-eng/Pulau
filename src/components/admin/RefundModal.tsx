/**
 * Refund Modal Component
 * Story: 28.2 - Create Refund Processing Interface
 *
 * Modal for processing refunds from the admin dashboard.
 * Supports full and partial refunds with validation.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    reference: string;
    totalPaid: number; // Amount in cents
    currency?: string;
  };
  onRefundComplete?: () => void;
}

type RefundType = 'full' | 'partial';

interface RefundRequest {
  bookingId: string;
  amount?: number;
  reason?: string;
}

async function processRefund(
  request: RefundRequest,
): Promise<{ success: boolean; refundedAmount?: number; error?: string }> {
  const { data, error } = await supabase.functions.invoke('process-refund', {
    body: request,
  });

  if (error) {
    throw new Error(error.message || 'Failed to process refund');
  }

  return data;
}

export function RefundModal({
  isOpen,
  onClose,
  booking,
  onRefundComplete,
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currency = booking.currency || 'USD';
  const maxRefundAmount = booking.totalPaid / 100; // Convert cents to dollars

  // Calculate refund amount based on type
  const refundAmount =
    refundType === 'full' ? maxRefundAmount : parseFloat(partialAmount) || 0;

  const refundAmountCents = Math.round(refundAmount * 100);

  // Validation
  const isValidAmount =
    refundType === 'full' ||
    (refundAmount > 0 && refundAmount <= maxRefundAmount);
  const isValidReason = reason.trim().length >= 10;
  const canSubmit = isValidAmount && isValidReason;

  const mutation = useMutation({
    mutationFn: processRefund,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Refund of $${(data.refundedAmount! / 100).toFixed(2)} processed successfully`,
        );
        onRefundComplete?.();
        handleClose();
      } else {
        toast.error(data.error || 'Refund failed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund');
    },
  });

  const handleClose = () => {
    setRefundType('full');
    setPartialAmount('');
    setReason('');
    setShowConfirmation(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Process refund
    mutation.mutate({
      bookingId: booking.id,
      amount: refundType === 'partial' ? refundAmountCents : undefined,
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Booking Reference:{' '}
            <span className="font-mono font-medium">{booking.reference}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Original Amount */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              Original Payment
            </span>
            <span className="font-semibold">
              ${maxRefundAmount.toFixed(2)} {currency}
            </span>
          </div>

          {/* Refund Type Selection */}
          <div className="space-y-3">
            <Label>Refund Type</Label>
            <RadioGroup
              value={refundType}
              onValueChange={(v) => {
                setRefundType(v as RefundType);
                setShowConfirmation(false);
              }}
              disabled={mutation.isPending}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="font-normal cursor-pointer">
                  Full Refund (${maxRefundAmount.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="font-normal cursor-pointer">
                  Partial Refund
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Partial Amount Input */}
          {refundType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxRefundAmount}
                  value={partialAmount}
                  onChange={(e) => {
                    setPartialAmount(e.target.value);
                    setShowConfirmation(false);
                  }}
                  placeholder={`Max: ${maxRefundAmount.toFixed(2)}`}
                  className="pl-10"
                  disabled={mutation.isPending}
                />
              </div>
              {partialAmount && !isValidAmount && (
                <p className="text-sm text-red-500">
                  Amount must be between $0.01 and ${maxRefundAmount.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Refund Reason (required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setShowConfirmation(false);
              }}
              placeholder="Enter the reason for this refund (minimum 10 characters)..."
              rows={3}
              disabled={mutation.isPending}
            />
            {reason.length > 0 && !isValidReason && (
              <p className="text-sm text-red-500">
                Reason must be at least 10 characters
              </p>
            )}
          </div>

          {/* Confirmation Alert */}
          {showConfirmation && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are about to refund{' '}
                <strong>${refundAmount.toFixed(2)}</strong> to the customer.
                This action cannot be undone. Click "Confirm Refund" to proceed.
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {mutation.isSuccess && mutation.data?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Refund processed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error?.message || 'Failed to process refund'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
            variant={showConfirmation ? 'destructive' : 'default'}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : showConfirmation ? (
              'Confirm Refund'
            ) : (
              'Review Refund'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
