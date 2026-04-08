import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck } from 'lucide-react';

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

// `signature_secret` is REQUIRED by Swagger for the approve
// variant of POST /applications/:id/sign. It's the super admin's
// personal signing passphrase — treated as a password input here.

const schema = z.object({
  signature_secret: z
    .string()
    .min(4, 'Signature secret must be at least 4 characters')
    .max(128, 'Signature secret is too long'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (signature_secret: string) => void;
  isPending?: boolean;
}

export function SignDocumentModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { signature_secret: '' },
  });

  useEffect(() => {
    if (open) reset({ signature_secret: '' });
  }, [open, reset]);

  const onSubmit = (values: Record<string, unknown>) => {
    const data = values as FormValues;
    onConfirm(data.signature_secret);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Sign Document
          </DialogTitle>
          <DialogDescription>
            Enter your signature secret to digitally sign and approve this
            application. Watering tasks will be auto-created on success.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signature_secret">Signature Secret</Label>
            <Input
              id="signature_secret"
              type="password"
              autoComplete="off"
              autoFocus
              placeholder="••••••••"
              {...register('signature_secret')}
            />
            {errors.signature_secret && (
              <p className="text-xs text-destructive">
                {errors.signature_secret.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign &amp; Approve
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
