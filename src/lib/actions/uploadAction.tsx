"use server";

import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { assistants } from "@/lib/db/schema";

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
  // Track created resource IDs so we can clean them up if anything fails
  let vectorStoreId: string | null = null;
  let assistantId: string | null = null;
  let threadId: string | null = null;

  try {
    const files = formData.getAll("files") as File[];
    const assistantNameRaw = (formData.get("assistantName") as string | null) ?? "";
    const assistantName = assistantNameRaw.trim() || `Document QA Assistant - ${new Date().toISOString()}`;
    if (files.length === 0) {
      return { status: "error", message: "No files were uploaded." };
    }

    // 1. Create a vector store and upload files
    const vectorStore = await openai.vectorStores.create({
      name: `File Search Vector Store - ${new Date().toISOString()}`,
    });
    vectorStoreId = vectorStore.id;

    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files,
    });

    // 2. Create an assistant linked to the vector store
    const assistant = await openai.beta.assistants.create({
      name: assistantName,
      instructions:
        `You are a helpful assistant that answers questions about the uploaded documents.
        Only use information found in the documents. If the answer is not in the documents, say you don't know.
        
        For regular responses, format your answers using Markdown syntax with:
        - **Bold text** for emphasis
        - *Italic text* for subtle emphasis
        - ## Headers for sections
        - ### Subheaders for subsections
        - - Bullet points for lists
        - 1. Numbered lists when order matters
        - \`code\` for inline code or technical terms
        - \`\`\`language blocks for code snippets
        - > Blockquotes for important notes
        - Tables when presenting structured data
        
        If the user asks for a diagram, respond with valid Mermaid syntax for an xychart-beta bar or line diagram.
        Here is an example:
          xychart-beta title "Sales Revenue" x-axis ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
          y-axis "Revenue (in $)" 4000 --> 11000
          bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
          line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
        Do NOT wrap diagram responses in backticks or add any explanation.`,
      model: "gpt-4o-mini",
      temperature: 0.1,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] },
      },
    });
    assistantId = assistant.id;

    // 3. Create an initial thread for this assistant
    const thread = await openai.beta.threads.create();
    threadId = thread.id;

    // 4. Persist metadata in the database
    await db.insert(assistants).values({
      assistantId: assistant.id,
      vectorStoreId: vectorStore.id,
      threadId: thread.id,
      name: assistantName,
    }).run();

    return {
      status: "success",
      assistantId: assistant.id,
      threadId: thread.id,
      message: "Assistant created and ready to chat.",
    };
  } catch (error) {
    console.error("Upload error:", error);

    // Attempt to clean up any resources that were created before the failure
    await cleanupResources({ vectorStoreId, assistantId, threadId });

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Upload failed: ${errorMessage}` };
  }
}

export async function addFilesToVectorStore(
  formData: FormData,
): Promise<{
  status: "success" | "error";
  message: string;
}> {
  try {
    const files = formData.getAll("files") as File[];
    const vectorStoreId = formData.get("vectorStoreId") as string;

    if (!vectorStoreId) {
      return { status: "error", message: "Vector Store ID is required." };
    }

    if (files.length === 0) {
      return { status: "error", message: "No files were selected." };
    }

    // Upload files to existing vector store
    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
      files,
    });

    return {
      status: "success",
      message: `${files.length} file(s) successfully added to the assistant.`,
    };
  } catch (error) {
    console.error("Add files error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { status: "error", message: `Failed to add files: ${errorMessage}` };
  }
}

// Update cleanupResources to accept multiple optional resource IDs
async function cleanupResources({
  vectorStoreId,
  assistantId,
  threadId,
}: {
  vectorStoreId: string | null;
  assistantId: string | null;
  threadId: string | null;
}) {
  try {
    console.log("Cleaning up resources...");

    // Delete thread if created
    if (threadId) {
      try {
        await openai.beta.threads.delete(threadId);
      } catch (threadErr) {
        console.warn("Failed to delete thread:", threadErr);
      }
    }

    // Delete assistant if created
    if (assistantId) {
      try {
        await openai.beta.assistants.delete(assistantId);
      } catch (assistantErr) {
        console.warn("Failed to delete assistant:", assistantErr);
      }
    }

    // Delete vector store and its files if created
    if (vectorStoreId) {
      try {
        const files = await openai.vectorStores.files.list(vectorStoreId);
        for (const file of files.data) {
          await openai.vectorStores.files.delete(file.id, {
            vector_store_id: vectorStoreId,
          });
        }
        await openai.vectorStores.delete(vectorStoreId);
      } catch (vectorErr) {
        console.warn("Failed to delete vector store:", vectorErr);
      }
    }

    console.log("Cleanup complete.");
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
} 