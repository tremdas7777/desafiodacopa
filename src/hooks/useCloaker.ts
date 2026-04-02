import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCloaker = () => {
  const [isBot, setIsBot] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCloaker = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cloaker-check');
        if (error) {
          console.warn('Cloaker check failed, showing real page:', error);
          setIsBot(false);
        } else {
          setIsBot(data?.isBot ?? false);
          if (data?.isBot) {
            console.log('Bot detected:', data.reason);
          }
        }
      } catch (err) {
        console.warn('Cloaker error, defaulting to real page:', err);
        setIsBot(false);
      } finally {
        setLoading(false);
      }
    };

    checkCloaker();
  }, []);

  return { isBot, loading };
};
