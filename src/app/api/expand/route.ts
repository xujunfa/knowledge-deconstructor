import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { EXPAND_CONCEPT_PROMPT } from "@/lib/prompts";
import { NextResponse } from "next/server";

const anthropic = createAnthropic({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, concept, existingExplanation } = await request.json();

    if (!text || !concept) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const prompt = EXPAND_CONCEPT_PROMPT.replace("{text}", text)
      .replace("{concept}", concept)
      .replace("{existingExplanation}", existingExplanation || "无");

    const { text: result } = await generateText({
      model: anthropic("glm-4.7"),
      prompt,
      maxOutputTokens: 2048,
      abortSignal: AbortSignal.timeout(30000),
    });

    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 返回格式异常，请重试" },
        { status: 500 }
      );
    }

    const explanations = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ explanations });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "请求超时，请重试" }, { status: 504 });
    }
    console.error("Expand API error:", err);
    return NextResponse.json(
      { error: "服务异常，请稍后重试" },
      { status: 500 }
    );
  }
}
