import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key missing' }), { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!res.ok) {
    const err = await res.json();
    if (res.status === 429) {
        const delay = err?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay ?? '60s';
        return new Response(
        JSON.stringify({ error: `Хүсэлтийн лимит дууссан. ${delay}-ийн дараа дахин оролдоно уу.` }),
        { status: 429 }
        );
    }
    return new Response(JSON.stringify({ error: err }), { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}