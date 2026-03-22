import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { text: '', skipped: true as const, reason: 'GEMINI_API_KEY тохируулаагүй байна.' },
        { status: 200 },
      );
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
      },
    );

    if (!res.ok) {
      let err: unknown;
      try {
        err = await res.json();
      } catch {
        err = { message: await res.text() };
      }
      if (res.status === 429) {
        const delay =
          (err as { error?: { details?: { retryDelay?: string }[] } })?.error?.details?.find(
            (d) => 'retryDelay' in d && d.retryDelay,
          )?.retryDelay ?? '60s';
        return NextResponse.json(
          { error: `Хүсэлтийн лимит дууссан. ${delay}-ийн дараа дахин оролдоно уу.` },
          { status: 429 },
        );
      }
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}