import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { message, vectorStoreId, previousResponseId } = await req.json();

    console.log(message, vectorStoreId, previousResponseId);

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "vectorStoreId is required" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: message,
      previous_response_id: previousResponseId,
      tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
    });

    const responseText = (response.output as any[])
      .filter(
        (o) =>
          o.type === "message" &&
          o.role === "assistant"
      ).flatMap((o) => o.content.flatMap((c: any) => c.annotations));

    console.log(responseText);

    if (responseText) {
      return NextResponse.json({
        response: response.output_text,
        responseId: response.id,
      });
    } else {
      return NextResponse.json(
        { error: "No text response from assistant" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
} 