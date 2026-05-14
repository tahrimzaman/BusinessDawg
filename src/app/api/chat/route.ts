// POST /api/chat — streaming chatbot endpoint backed by Groq's OpenAI-compatible API.
// Provider locked to Groq + Llama 3.3 70B Versatile per CLAUDE.md §3 Gate #1
// (originally specced as llama-3.1-70b-versatile, which Groq deprecated; 3.3 is its
// production successor in the same family).

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { SITE, SYSTEMS, FOUNDER, BUILT } from '@/lib/copy';

export const runtime = 'nodejs';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(1500),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

function buildSystemPrompt(): string {
  const systemsBlock = SYSTEMS.map(
    (s) => `- ${s.name} (${s.shortName}): ${s.tagline} — ${s.description}`,
  ).join('\n');
  const builtBlock = BUILT.map(
    (b) => `- ${b.name}: ${b.tagline} Metrics: ${b.metrics.join(' / ')}.`,
  ).join('\n');
  const founderBlock = FOUNDER.bio.join(' ');

  return [
    `You are the BusinessDawg — the in-house AI for ${SITE.name}, a Gen Z–native business growth studio.`,
    `Tagline: "${SITE.tagline}".`,
    ``,
    `# Voice (non-negotiable)`,
    `- Confident, conversational, Gen Z–fluent. Wit, not jokes.`,
    `- Short sentences. Punchy. No filler.`,
    `- Make assertions, not hedges. ("We build systems." not "We aim to provide solutions.")`,
    `- Banned words: synergy, leverage, solutions, cutting-edge, world-class, robust, scalable, "passionate about", "in today's world".`,
    `- Embrace: build, ship, system, machine, growth, real, fast, alive.`,
    ``,
    `# What BusinessDawg sells (the Systems Stack)`,
    systemsBlock,
    ``,
    `# Founder`,
    `${FOUNDER.name}. ${founderBlock}`,
    ``,
    `# Built case studies`,
    builtBlock,
    `(There is no other client portfolio yet. Only Shadai exists as a built case study. Never invent client work.)`,
    ``,
    `# Hard guardrails`,
    `- NEVER quote dollar prices or specific package amounts. All pricing is gated. Route every pricing question to "Book a Call" via the Book a Call button on every page.`,
    `- Redirect contractual, legal, or scope-of-work questions to "Book a Call". Don't make commitments on behalf of the studio.`,
    `- Never invent client work, testimonials, or case studies. Only Shadai is real.`,
    `- If a user asks about something outside BusinessDawg, briefly redirect back to what BD builds.`,
    ``,
    `# Booking + contact`,
    `- Book a call: the Book a Call button (Cal.com) on every page.`,
    `- WhatsApp + email also work — point users to the contact section.`,
    ``,
    `Stay short. 1–4 sentences unless the user asks for depth.`,
  ].join('\n');
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'chat not configured' }, { status: 503 });
  }

  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const ip = clientIp(req);
  const limit = rateLimit(`chat:${ip}`, { max: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid messages' }, { status: 400 });
  }

  // Strip any client-provided system messages — we control the system prompt.
  const history = parsed.data.messages.filter((m) => m.role !== 'system');
  const messages = [{ role: 'system' as const, content: buildSystemPrompt() }, ...history];

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  let groqRes: Response;
  try {
    groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.6,
        max_tokens: 800,
      }),
    });
  } catch (err) {
    console.error('[/api/chat] fetch error', err);
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
  }

  if (!groqRes.ok || !groqRes.body) {
    const text = await groqRes.text().catch(() => '');
    console.error('[/api/chat] upstream', groqRes.status, text.slice(0, 500));
    return NextResponse.json({ error: 'upstream error', status: groqRes.status }, { status: 502 });
  }

  // Transform Groq SSE -> plain text chunks the client can append directly.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = groqRes.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Groq sends SSE lines: `data: {...}\n\n`
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Ignore malformed chunks.
            }
          }
        }
      } catch (err) {
        console.error('[/api/chat] stream error', err);
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
