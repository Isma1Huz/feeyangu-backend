import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';

interface FlashProps {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

interface PageWithFlash {
  flash?: FlashProps;
}

/**
 * Reads Laravel flash messages shared via HandleInertiaRequests middleware
 * and displays them as toast notifications.
 */
const FlashMessages: React.FC = () => {
  const { flash } = usePage<any>().props;

  console.log('Flash messages:', flash); // Debug log to check flash content
  const { toast } = useToast();

  useEffect(() => {
    if (flash?.success) {
      toast({ title: flash.success });
    }
    if (flash?.error) {
      toast({ title: flash.error, variant: 'destructive' });
    }
    if (flash?.warning) {
      toast({ title: flash.warning, variant: 'destructive' });
    }
    if (flash?.info) {
      toast({ title: flash.info });
    }
  }, [flash]);

  return null;
};

export default FlashMessages;
