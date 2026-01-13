import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ValidationResult } from '@/lib/publishValidation';

interface PublishExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validationResult: ValidationResult | null;
  isPublishing: boolean;
}

export function PublishExperienceModal({
  isOpen,
  onClose,
  onConfirm,
  validationResult,
  isPublishing,
}: PublishExperienceModalProps) {
  if (!validationResult) return null;

  const successCount = validationResult.errors.filter((e) => e.pass).length;
  const totalChecks = validationResult.errors.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {validationResult.valid ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Ready to Publish
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pre-publish Check
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {validationResult.valid
              ? 'Great job! Your experience meets all requirements and is ready to go live.'
              : `You need to complete ${totalChecks - successCount} more items before publishing.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {validationResult.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {error.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${error.pass ? 'text-foreground' : 'text-destructive font-medium'}`}
                >
                  {error.message}
                </span>
              </div>
              {error.pass && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 hover:bg-green-100 border-none"
                >
                  Pass
                </Badge>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between flex-row-reverse gap-2">
          {validationResult.valid ? (
            <Button
              onClick={onConfirm}
              disabled={isPublishing}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? 'Publishing...' : 'Publish Now'}
            </Button>
          ) : (
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full sm:w-auto ml-auto"
            >
              I'll fix these
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
