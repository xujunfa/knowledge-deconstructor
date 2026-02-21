import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { EXTRACT_CONCEPTS_PROMPT } from "@/lib/prompts";
import { NextResponse } from "next/server";

const anthropic = createAnthropic({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "请输入文本" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "文本过长，请限制在 5000 字以内" },
        { status: 400 }
      );
    }

    const { text: result } = await generateText({
      model: anthropic("glm-4.7"),
      prompt: EXTRACT_CONCEPTS_PROMPT + text,
      maxOutputTokens: 1024,
      abortSignal: AbortSignal.timeout(30000),
    });

    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 返回格式异常，请重试" },
        { status: 500 }
      );
    }

    const concepts: string[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ concepts });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "请求超时，请重试" }, { status: 504 });
    }
    console.error("Extract API error:", err);
    return NextResponse.json(
      { error: "服务异常，请稍后重试" },
      { status: 500 }
    );
  }
}
