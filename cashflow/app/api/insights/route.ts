import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, userMessage } = body as { prompt?: string; userMessage?: string };
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { text: '', skipped: true as const, reason: 'GEMINI_API_KEY тохируулаагүй байна.' },
        { status: 200 },
      );
    }

    let textPrompt = typeof prompt === 'string' ? prompt : '';
    if (typeof userMessage === 'string' && userMessage.trim()) {
      textPrompt =
        `Та CashFlow аппын санхүүгийн AI туслах. Доорх өгөгдөлд үндэслэн хэрэглэгчийн асуултад хариулна уу.\n` +
        `Хариултыг монгол хэлээр, 2–6 өгүүлбэр, тодорхой тоо баримт ашиглан бич. Markdown блок, JSON биш, зөвхөн энгийн текст.\n\n` +
        `--- Санхүүгийн өгөгдөл ---\n${textPrompt}\n\n--- Хэрэглэгчийн асуулт ---\n${userMessage.trim()}`;
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
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