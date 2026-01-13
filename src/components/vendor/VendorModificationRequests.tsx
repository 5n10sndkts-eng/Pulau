/**
 * Vendor Modification Requests Component
 * Story: 31-5 - Build Vendor Approval Workflow
 * Epic: 31 - Booking Modifications & Rescheduling
 *
 * Displays pending and historical modification requests for vendor review.
 * Vendors can approve or reject requests with optional notes.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Check,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
  getVendorPendingModifications,
  getVendorModifications,
  approveModification,
  rejectModification,
  executeModification,
  formatPriceDifference,
  BookingModification,
  ModificationStatus,
  ModificationType,
} from '@/lib/modificationService';

// ============================================================================
// TYPES
// ============================================================================

interface VendorModificationRequestsProps {
  vendorId: string;
  onBack?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusBadge(status: ModificationStatus) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Approved
        </Badge>
      );
    case 'executed':
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Completed
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Rejected
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-600 border-gray-200"
        >
          Cancelled
        </Badge>
      );
    case 'expired':
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-500 border-gray-200"
        >
          Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeLabel(type: ModificationType): string {
  switch (type) {
    case 'reschedule':
      return 'Date/Time Change';
    case 'guest_change':
      return 'Guest Count Change';
    case 'combined':
      return 'Date & Guest Change';
    default:
      return type;
  }
}

function getTypeIcon(type: ModificationType) {
  switch (type) {
    case 'reschedule':
      return <Calendar className="w-4 h-4" />;
    case 'guest_change':
      return <Users className="w-4 h-4" />;
    case 'combined':
      return <RefreshCw className="w-4 h-4" />;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VendorModificationRequests({
  vendorId,
  onBack,
}: VendorModificationRequestsProps) {
  // State
  const [pendingRequests, setPendingRequests] = useState<BookingModification[]>(
    [],
  );
  const [allRequests, setAllRequests] = useState<BookingModification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Modal state
  const [selectedRequest, setSelectedRequest] =
    useState<BookingModification | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(
    null,
  );
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load data
  useEffect(() => {
    loadRequests();
  }, [vendorId]);

  async function loadRequests() {
    setLoading(true);
    setError(null);

    try {
      const [pending, all] = await Promise.all([
        getVendorPendingModifications(vendorId),
        getVendorModifications(vendorId),
      ]);

      setPendingRequests(pending);
      setAllRequests(all);
    } catch (err) {
      setError('Failed to load modification requests');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  function openApproveModal(request: BookingModification) {
    setSelectedRequest(request);
    setModalAction('approve');
    setNotes('');
  }

  function openRejectModal(request: BookingModification) {
    setSelectedRequest(request);
    setModalAction('reject');
    setNotes('');
  }

  function closeModal() {
    setSelectedRequest(null);
    setModalAction(null);
    setNotes('');
  }

  async function handleApprove() {
    if (!selectedRequest) return;

    setProcessing(true);

    try {
      // First approve the request
      const approveResult = await approveModification(
        selectedRequest.id,
        notes || undefined,
      );

      if (!approveResult.success) {
        setError(approveResult.error || 'Failed to approve request');
        return;
      }

      // Then execute it (update trip item, handle slots, etc.)
      const executeResult = await executeModification(selectedRequest.id);

      if (!executeResult.success) {
        // Approved but not executed - show warning
        setError(
          `Request approved but execution failed: ${executeResult.error}`,
        );
      }

      // Refresh the list
      await loadRequests();
      closeModal();
    } catch (err) {
      setError('An error occurred while processing the request');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedRequest || !notes.trim()) return;

    setProcessing(true);

    try {
      const result = await rejectModification(selectedRequest.id, notes);

      if (!result.success) {
        setError(result.error || 'Failed to reject request');
        return;
      }

      await loadRequests();
      closeModal();
    } catch (err) {
      setError('An error occurred while processing the request');
    } finally {
      setProcessing(false);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">
                Modification Requests
              </h1>
              <p className="text-white/80 mt-1">
                {pendingRequests.length} pending{' '}
                {pendingRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadRequests}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Bell className="w-4 h-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-amber-100 text-amber-700"
                >
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  All caught up!
                </h3>
                <p className="text-muted-foreground">
                  No pending modification requests at this time.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {pendingRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ModificationRequestCard
                        request={request}
                        onApprove={() => openApproveModal(request)}
                        onReject={() => openRejectModal(request)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : allRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No modification requests yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {allRequests.map((request) => (
                  <ModificationRequestRow key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve/Reject Modal */}
      <Dialog open={!!modalAction} onOpenChange={() => closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {modalAction === 'approve'
                ? 'Confirm that you want to approve this modification request.'
                : 'Please provide a reason for rejecting this request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* Request Summary */}
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedRequest.modification_type)}
                  <span className="font-medium">
                    {getTypeLabel(selectedRequest.modification_type)}
                  </span>
                </div>

                {selectedRequest.modification_type === 'reschedule' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">From:</span>
                      <p className="font-medium">
                        {selectedRequest.original_date} at{' '}
                        {selectedRequest.original_time}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To:</span>
                      <p className="font-medium">
                        {selectedRequest.requested_date} at{' '}
                        {selectedRequest.requested_time}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.modification_type === 'guest_change' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">From:</span>
                      <p className="font-medium">
                        {selectedRequest.original_guests} guests
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To:</span>
                      <p className="font-medium">
                        {selectedRequest.requested_guests} guests
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.price_difference !== 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      Price change:{' '}
                    </span>
                    <span
                      className={`font-medium ${
                        (selectedRequest.price_difference ?? 0) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPriceDifference(
                        selectedRequest.price_difference ?? 0,
                      )}
                    </span>
                  </div>
                )}

                {selectedRequest.customer_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      Customer note:{' '}
                    </span>
                    <p className="text-sm mt-1">
                      {selectedRequest.customer_notes}
                    </p>
                  </div>
                )}
              </Card>

              {/* Notes Input */}
              <div>
                <Label htmlFor="vendor-notes">
                  {modalAction === 'approve'
                    ? 'Notes (optional)'
                    : 'Rejection reason (required)'}
                </Label>
                <Textarea
                  id="vendor-notes"
                  placeholder={
                    modalAction === 'approve'
                      ? 'Add any notes for the customer...'
                      : 'Please explain why you are rejecting this request...'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={processing}
            >
              Cancel
            </Button>
            {modalAction === 'approve' ? (
              <Button onClick={handleApprove} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approve & Execute
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !notes.trim()}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ModificationRequestCard({
  request,
  onApprove,
  onReject,
}: {
  request: BookingModification;
  onApprove: () => void;
  onReject: () => void;
}) {
  const expiresIn = formatDistanceToNow(parseISO(request.expires_at), {
    addSuffix: true,
  });
  const createdAgo = formatDistanceToNow(parseISO(request.created_at), {
    addSuffix: true,
  });

  return (
    <Card className="p-6 border-l-4 border-l-amber-400">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Type & Status */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-primary">
              {getTypeIcon(request.modification_type)}
              <span className="font-semibold">
                {getTypeLabel(request.modification_type)}
              </span>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Change Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {request.modification_type === 'reschedule' && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">
                    {request.original_date} at {request.original_time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium text-primary">
                    {request.requested_date} at {request.requested_time}
                  </span>
                </div>
              </>
            )}

            {request.modification_type === 'guest_change' && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">
                    {request.original_guests} guests
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium text-primary">
                    {request.requested_guests} guests
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Price Difference */}
          {request.price_difference !== 0 && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Price change:</span>
              <span
                className={`font-semibold ${
                  (request.price_difference ?? 0) > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatPriceDifference(request.price_difference ?? 0)}
              </span>
            </div>
          )}

          {/* Customer Notes */}
          {request.customer_notes && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm mb-3">
              <span className="text-muted-foreground">Customer note: </span>
              {request.customer_notes}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Requested {createdAgo}</span>
            <span className="text-amber-600">Expires {expiresIn}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onApprove} size="sm" className="gap-1">
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ModificationRequestRow({ request }: { request: BookingModification }) {
  const createdAgo = formatDistanceToNow(parseISO(request.created_at), {
    addSuffix: true,
  });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground">
            {getTypeIcon(request.modification_type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {getTypeLabel(request.modification_type)}
              </span>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {request.modification_type === 'reschedule' && (
                <>
                  {request.original_date} → {request.requested_date}
                </>
              )}
              {request.modification_type === 'guest_change' && (
                <>
                  {request.original_guests} → {request.requested_guests} guests
                </>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{createdAgo}</p>
          {request.price_difference !== 0 && (
            <p
              className={`text-sm font-medium ${
                (request.price_difference ?? 0) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatPriceDifference(request.price_difference ?? 0)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default VendorModificationRequests;
