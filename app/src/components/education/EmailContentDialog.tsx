import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Mail, Send } from 'lucide-react';

import apiClient from '../../api/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface EmailContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  defaultSubject: string;
  defaultContent: string;
  emailType: string;
  sourcePage: string;
  onSent?: (message: string) => void;
}

export default function EmailContentDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultSubject,
  defaultContent,
  emailType,
  sourcePage,
  onSent,
}: EmailContentDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState(defaultContent);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!open) {
      return;
    }

    setRecipientEmail('');
    setSubject(defaultSubject);
    setContent(defaultContent);
    setStatusMessage(null);
  }, [open, defaultSubject, defaultContent]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setStatusMessage(null);

    try {
      const response = await apiClient.sendEducationEmail({
        recipient_email: recipientEmail.trim(),
        subject: subject.trim(),
        content: content.trim(),
        email_type: emailType,
        source_page: sourcePage,
      });

      const message = response?.detail || 'Email sent successfully.';
      setStatusTone('success');
      setStatusMessage(message);
      onSent?.(message);
      onOpenChange(false);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setStatusTone('error');
      setStatusMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-kaleo-border bg-kaleo-surface text-kaleo-text shadow-[0_36px_80px_-48px_rgba(0,0,0,0.88)]">
        <DialogHeader className="text-left">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-kaleo-primary/12 text-kaleo-primary">
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle className="font-serif text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-kaleo-muted">{description}</DialogDescription>
        </DialogHeader>

        {statusMessage ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              statusTone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {statusMessage}
          </div>
        ) : null}

        <form onSubmit={handleSend} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient email</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="student@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-56 resize-none"
              placeholder="Email content"
              required
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-kaleo-border bg-kaleo-elevated px-4 py-2 text-sm font-medium text-kaleo-text transition hover:border-kaleo-primary/35 hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8B5CF6,#FF6B6B)] px-4 py-2 text-sm font-medium text-kaleo-text transition hover:shadow-[0_16px_28px_-16px_rgba(139,92,246,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{isSending ? 'Sending...' : 'Send email'}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as { response?: { data?: { detail?: string } } };
    return response.response?.data?.detail || 'Email could not be sent right now.';
  }

  return 'Email could not be sent right now.';
}
