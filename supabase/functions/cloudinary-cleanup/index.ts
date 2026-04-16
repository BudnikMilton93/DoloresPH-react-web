/* eslint-disable */
// deno-lint-ignore-file

// @ts-ignore — Deno runtime import (not resolved by Node TS server)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/* ------------------------------------------------------------------ */
/*  Cloudinary Admin API helpers                                       */
/* ------------------------------------------------------------------ */

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  format: string;
  created_at: string;
}

async function cloudinaryRequest(
  path: string,
  method = 'GET',
  params?: URLSearchParams,
): Promise<unknown> {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')!;
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY')!;
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')!;
  const auth = btoa(`${apiKey}:${apiSecret}`);

  let url = `https://api.cloudinary.com/v1_1/${cloudName}${path}`;
  if (params) url += `?${params.toString()}`;

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${text}`);
  }
  return res.json();
}

async function listAllResources(): Promise<CloudinaryResource[]> {
  const all: CloudinaryResource[] = [];

  for (const type of ['image', 'raw']) {
    let cursor: string | undefined;
    do {
      const p = new URLSearchParams({ max_results: '500' });
      if (cursor) p.set('next_cursor', cursor);

      const data = (await cloudinaryRequest(
        `/resources/${type}`,
        'GET',
        p,
      )) as {
        resources: CloudinaryResource[];
        next_cursor?: string;
      };

      all.push(...data.resources);
      cursor = data.next_cursor;
    } while (cursor);
  }

  return all;
}

/* ------------------------------------------------------------------ */
/*  Public-ID extraction from Cloudinary URLs                          */
/* ------------------------------------------------------------------ */

function extractPublicId(url: string): string | null {
  try {
    const m = new URL(url).pathname.match(/\/v\d{5,}\/(.+)$/);
    if (!m) return null;
    // Strip file extension (.jpg, .png, .webp, .svg …)
    return m[1].replace(/\.\w{2,5}$/, '');
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Supabase — collect every referenced Cloudinary public_id           */
/* ------------------------------------------------------------------ */

async function getReferencedIds(
  supabase: ReturnType<typeof createClient>,
): Promise<Set<string>> {
  const ids = new Set<string>();

  const addUrl = (u: string | null | undefined) => {
    if (!u) return;
    const id = extractPublicId(u);
    if (id) ids.add(id);
  };

  const [{ data: photos }, { data: testimonials }, { data: content }] =
    await Promise.all([
      supabase.from('photos').select('url, thumbnail_url'),
      supabase.from('testimonials').select('avatar_url'),
      supabase.from('site_content').select('value'),
    ]);

  for (const p of photos ?? []) {
    addUrl(p.url);
    addUrl(p.thumbnail_url);
  }
  for (const t of testimonials ?? []) {
    addUrl(t.avatar_url);
  }
  for (const c of content ?? []) {
    if (c.value?.includes('cloudinary')) addUrl(c.value);
  }

  return ids;
}

/* ------------------------------------------------------------------ */
/*  Edge-function handler                                              */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { action, publicIds } = (await req
      .json()
      .catch(() => ({ action: 'scan' }))) as {
      action: string;
      publicIds?: { id: string; resourceType: string }[];
    };

    /* ---------- SCAN ---------- */
    if (action === 'scan') {
      const [cloudResources, referencedIds] = await Promise.all([
        listAllResources(),
        getReferencedIds(supabase),
      ]);

      const orphans = cloudResources
        .filter((r) => !referencedIds.has(r.public_id))
        .map((r) => ({
          publicId: r.public_id,
          url: r.secure_url,
          resourceType: r.resource_type,
          bytes: r.bytes,
          format: r.format,
          createdAt: r.created_at,
        }));

      return new Response(
        JSON.stringify({
          totalCloud: cloudResources.length,
          totalReferenced: referencedIds.size,
          orphans,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    /* ---------- DELETE ---------- */
    if (action === 'delete' && publicIds?.length) {
      // Group by resource type (image vs raw)
      const byType: Record<string, string[]> = {};
      for (const { id, resourceType } of publicIds) {
        (byType[resourceType] ??= []).push(id);
      }

      let deleted = 0;
      let failed = 0;

      for (const [resType, ids] of Object.entries(byType)) {
        // Cloudinary allows max 100 IDs per request
        for (let i = 0; i < ids.length; i += 100) {
          const batch = ids.slice(i, i + 100);
          const p = new URLSearchParams();
          batch.forEach((id) => p.append('public_ids[]', id));

          try {
            await cloudinaryRequest(
              `/resources/${resType}/upload`,
              'DELETE',
              p,
            );
            deleted += batch.length;
          } catch {
            failed += batch.length;
          }
        }
      }

      return new Response(
        JSON.stringify({ deleted, failed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
