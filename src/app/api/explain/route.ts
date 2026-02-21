import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { EXPLAIN_CONCEPTS_PROMPT } from "@/lib/prompts";
import { NextResponse } from "next/server";

const anthropic = createAnthropic({
  baseURL: process.env.ANTHROPIC_BASE_URL,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, concepts } = await request.json();

    if (
      !text ||
      !concepts ||
      !Array.isArray(concepts) ||
      concepts.length === 0
    ) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    if (concepts.length > 20) {
      return NextResponse.json(
        { error: "概念数量过多，请减少到 20 个以内" },
        { status: 400 }
      );
    }

    const prompt = EXPLAIN_CONCEPTS_PROMPT.replace("{text}", text).replace(
      "{concepts}",
      concepts.join("、")
    );

    const { text: result } = await generateText({
      model: anthropic("glm-4.7"),
      prompt,
      maxOutputTokens: 2048,
      abortSignal: AbortSignal.timeout(60000),
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
    console.error("Explain API error:", err);
    return NextResponse.json(
      { error: "服务异常，请稍后重试" },
      { status: 500 }
    );
  }
}
