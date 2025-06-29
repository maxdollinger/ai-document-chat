import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { assistants as assistantsTable } from "@/lib/db/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    // 1. Fetch all persisted assistants
    const assistants = await db.select().from(assistantsTable);

    // 2. For every assistant, retrieve its files from the vector store
    const assistantsWithFiles = await Promise.all(
      assistants.map(async (a) => {
        let fileNames: string[] = [];
        try {
          const vsFiles = await openai.vectorStores.files.list(a.vectorStoreId);
          fileNames = await Promise.all(
            vsFiles.data.map(async (vf) => {
              try {
                const fileObj = await openai.files.retrieve(vf.id);
                // The SDK returns `filename` for file objects; fall back to ID just in case.
                return (fileObj as any).filename ?? fileObj.id;
              } catch {
                return vf.id;
              }
            })
          );
        } catch (err) {
          // If vector store no longer exists or API call fails, leave files empty.
          console.error(`Failed to list files for vector store ${a.vectorStoreId}`, err);
        }

        return {
          assistantId: a.assistantId,
          vectorStoreId: a.vectorStoreId,
          threadId: a.threadId,
          name: a.name,
          files: fileNames,
        };
      })
    );

    return NextResponse.json(assistantsWithFiles);
  } catch (error) {
    console.error("Failed to fetch assistants:", error);
    return NextResponse.json({ error: "Failed to fetch assistants" }, { status: 500 });
  }
} 