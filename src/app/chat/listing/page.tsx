import Link from "next/link";
import { OpenAI } from "openai";

import { db } from "@/lib/db";
import { assistants as assistantsTable } from "@/lib/db/schema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AssistantWithFiles {
  assistantId: string;
  vectorStoreId: string;
  threadId: string;
  name: string;
  files: string[];
}

export default async function ChatListingPage() {
  // 1. Fetch all persisted assistants
  const assistants = await db.select().from(assistantsTable);

  // Early-return UI if none exist
  if (!assistants.length) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground gap-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Keine vorhandenen Chats
        </h1>
        <Button asChild>
          <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </main>
    );
  }

  // 2. For every assistant, retrieve its files from the vector store
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const assistantsWithFiles: AssistantWithFiles[] = await Promise.all(
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
      } satisfies AssistantWithFiles;
    })
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Vorhandene Chats
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Unten finden Sie alle bisher erstellten Dokumenten-Chats.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assistantsWithFiles.map((assistant) => (
            <Card key={assistant.assistantId} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {assistant.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {assistant.files.length ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {assistant.files.map((fname) => (
                      <li key={fname}>{fname}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Dateien gefunden</p>
                )}
              </CardContent>

              <div className="p-4 pt-0 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/chat?assistantId=${assistant.assistantId}&threadId=${assistant.threadId}`}>
                    Öffnen
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/">Zurück zur Startseite</Link>
          </Button>
        </div>
      </div>
    </main>
  );
} 