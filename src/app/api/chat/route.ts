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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      instructions,
      input: messages,
    });

    return Response.json({ answer: response.output_text });
  } catch {
    return Response.json({ error: "Failed to create an AI response." }, { status: 500 });
  }
}
