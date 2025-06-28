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
  vectorStoreId?: string;
}> {
  try {
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return { status: "error", message: "No files were uploaded." };
    }

    const vectorStore = await openai.vectorStores.create({
      name: `File Search Vector Store - ${new Date().toISOString()}`,
    });

    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, { files });

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: "Welchen netto umsatz gab es 2020/21?",
      tools: [{
          type: "file_search",
          vector_store_ids: [vectorStore.id],
      }],
  });;

    console.log(response.output);

    return {
      status: "success",
      vectorStoreId: vectorStore.id,
      message: "vector store created",
    };
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Upload failed: ${errorMessage}` };
  }
}

async function cleanupResources(vectorStoreId: string) {
  try {
    console.log("Cleaning up resources...");
    const files = await openai.vectorStores.files.list(vectorStoreId);
    for (const file of files.data) {
      await openai.vectorStores.files.delete(file.id, {vector_store_id: vectorStoreId});
    }

    await openai.vectorStores.delete(vectorStoreId);

    console.log("Cleanup complete.");
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
    // Don't re-throw, as the primary operation might have succeeded.
  }
} 