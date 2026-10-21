import OpenAI from "openai";
import { buildUsherInstructions } from "@/data/chatbot";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 12;
const MAX_LENGTH = 500;

const instructions = buildUsherInstructions();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: ChatMessage[] } | null;

  const messages = (body?.messages ?? [])
    .filter((message) =>
      (message.role === "user" || message.role === "assistant")
      && typeof message.content === "string"
      && message.content.trim() !== "")
    .slice(-MAX_HISTORY)
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_LENGTH) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  }

  // Vercel에 붙여넣을 때 섞여 들어가는 공백·따옴표를 제거한다.
  const apiKey = process.env.OPENAI_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const stream = await openai.responses.create({
      model: "gpt-5",
      // 안내 답변은 깊은 추론이 필요 없으므로 생각 단계를 최소로 줄여 첫 글자가 빨리 나오게 한다.
      reasoning: { effort: "minimal" },
      text: { verbosity: "low" },
      instructions,
      input: messages,
      stream: true,
    });

    // 답변을 다 기다리지 않고 만들어지는 대로 글자를 바로 보낸다.
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
        } catch (error) {
          console.error("[api/chat] OpenAI stream failed", error instanceof Error ? error.message : error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    // Vercel 런타임 로그에서 원인을 확인할 수 있도록 상태 코드와 메시지만 남긴다. (키는 남기지 않음)
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    console.error("[api/chat] OpenAI request failed", status, error instanceof Error ? error.message : error);
    return Response.json({ error: "Failed to create an AI response.", status }, { status: 500 });
  }
}
