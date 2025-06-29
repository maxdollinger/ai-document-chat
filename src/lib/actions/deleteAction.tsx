"use server";

import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { assistants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function deleteAssistant(
  assistantId: string
): Promise<{
  status: "success" | "error";
  message: string;
}> {
  try {
    // First, get the assistant data from the database
    const assistantRecord = await db
      .select()
      .from(assistants)
      .where(eq(assistants.assistantId, assistantId))
      .get();

    if (!assistantRecord) {
      return { status: "error", message: "Assistant not found in database." };
    }

    const { vectorStoreId, threadId } = assistantRecord;

    // Delete resources from OpenAI in order: files, vector store, assistant, thread
    try {
      // Delete all files from vector store first
      const files = await openai.vectorStores.files.list(vectorStoreId);
      for (const file of files.data) {
        try {
          await openai.files.delete(file.id);
        } catch (fileErr) {
          console.warn(`Failed to delete file ${file.id}:`, fileErr);
        }
      }

      // Delete vector store
      await openai.vectorStores.delete(vectorStoreId);
    } catch (vectorErr) {
      console.warn("Failed to delete vector store:", vectorErr);
    }

    try {
      // Delete assistant
      await openai.beta.assistants.delete(assistantId);
    } catch (assistantErr) {
      console.warn("Failed to delete assistant:", assistantErr);
    }

    try {
      // Delete thread
      await openai.beta.threads.delete(threadId);
    } catch (threadErr) {
      console.warn("Failed to delete thread:", threadErr);
    }

    // Remove from database
    await db
      .delete(assistants)
      .where(eq(assistants.assistantId, assistantId))
      .run();

    return {
      status: "success",
      message: "Assistant and all associated resources deleted successfully.",
    };
  } catch (error) {
    console.error("Delete assistant error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Failed to delete assistant: ${errorMessage}` };
  }
} 