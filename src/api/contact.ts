import { supabase } from '../lib/supabase';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail(form: ContactForm): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-contact-email', {
    body: form,
  });

  if (error) throw new Error(error.message ?? 'Error al enviar el mensaje.');
  if (data?.error) throw new Error(data.error);
}
