import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { message, assistantId, threadId: existingThreadId } = await req.json();

    if (!assistantId) {
      return NextResponse.json(
        { error: "assistantId is required" },
        { status: 400 }
      );
    }

    // Create a thread if none exists
    const threadId =
      existingThreadId ?? (await openai.beta.threads.create()).id;

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run the assistant and poll for completion
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    if (run.status !== "completed") {
      return NextResponse.json(
        { error: `Run failed with status: ${run.status}` },
        { status: 500 }
      );
    }

    // Retrieve messages and find the assistant's latest reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantReply = messages.data
      .filter((m) => m.run_id === run.id && m.role === "assistant")
      .pop();

    if (!assistantReply || assistantReply.content[0].type !== "text") {
      return NextResponse.json(
        { error: "No assistant response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: assistantReply.content[0].text.value,
      threadId,
    });
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