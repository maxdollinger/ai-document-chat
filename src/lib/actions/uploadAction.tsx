"use server";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function uploadFiles(
  formData: FormData,
): Promise<{
  status: "success" | "error";
  message: string;
  assistantId?: string;
  threadId?: string;
}> {
  try {
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return { status: "error", message: "No files were uploaded." };
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => openai.files.create({ file, purpose: "assistants" })),
    );

    const vectorStore = await openai.vectorStores.create({
      name: `File Search Vector Store - ${new Date().toISOString()}`,
      file_ids: uploadedFiles.map((file) => file.id),
    });

    // It can take a few seconds for the vector store to be ready.
    // We'll poll the status until it's "completed".
    await new Promise<void>((resolve, reject) => {
      const poll = setInterval(async () => {
        try {
          const status = await openai.vectorStores.retrieve(vectorStore.id);
          if (status.status === "completed") {
            clearInterval(poll);
            resolve();
          }
        } catch (error) {
          clearInterval(poll);
          reject(error);
        }
      }, 5000);
    });

    const assistant = await openai.beta.assistants.create({
      name: "AI Document Chat",
      instructions: "You are a helpful assistant that can answer questions about documents.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });

    const thread = await openai.beta.threads.create();

    return {
      status: "success",
      message: "Assistant created successfully!",
      assistantId: assistant.id,
      threadId: thread.id,
    };
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Upload failed: ${errorMessage}` };
  }
} 