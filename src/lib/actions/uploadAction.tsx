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
}> {
  try {
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return { status: "error", message: "No files were uploaded." };
    }

    // 1. Create a vector store and upload files
    const vectorStore = await openai.vectorStores.create({
      name: `File Search Vector Store - ${new Date().toISOString()}`,
    });

    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files,
    });

    // 2. Create an assistant linked to the vector store
    const assistant = await openai.beta.assistants.create({
      name: `Document QA Assistant - ${new Date().toISOString()}`,
      instructions:
        "You are a helpful assistant that answers questions about the uploaded documents. Only use information found in the documents. If the answer is not in the documents, say you don't know.",
      model: "gpt-4o-mini",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] },
      },
    });

    return {
      status: "success",
      assistantId: assistant.id,
      message: "Assistant created and ready to chat.",
    };
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Upload failed: ${errorMessage}` };
  }
}

// Optional cleanup of resources (not used directly here)
async function cleanupResources(vectorStoreId: string) {
  try {
    console.log("Cleaning up resources...");
    const files = await openai.vectorStores.files.list(vectorStoreId);
    for (const file of files.data) {
      await openai.vectorStores.files.delete(file.id, {
        vector_store_id: vectorStoreId,
      });
    }

    await openai.vectorStores.delete(vectorStoreId);

    console.log("Cleanup complete.");
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
} 