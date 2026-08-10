import { supabase } from '../lib/supabase';

type AnalyticsEvent = {
  eventType: 'page_view' | 'admin_login';
  status?: 'success' | 'failed';
  routePath?: string;
  email?: string;
  source?: 'mock' | 'supabase';
};

async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const payload = {
    event_type: event.eventType,
    status: event.status ?? null,
    route_path: event.routePath ?? null,
    email: event.email ?? null,
    source: event.source ?? null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  };

  const { error } = await supabase.from('analytics_events').insert(payload);
  if (error) {
    // Keep analytics failures non-blocking for user interactions.
    console.warn('Analytics tracking failed:', error.message);
  }
}

export async function trackPageView(routePath: string): Promise<void> {
  await trackEvent({ eventType: 'page_view', routePath });
}

export async function trackAdminLogin(params: {
  email: string;
  status: 'success' | 'failed';
  source: 'mock' | 'supabase';
}): Promise<void> {
  await trackEvent({
    eventType: 'admin_login',
    email: params.email.trim().toLowerCase(),
    status: params.status,
    source: params.source,
  });
}