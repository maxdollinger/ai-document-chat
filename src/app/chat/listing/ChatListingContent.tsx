"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddFilesButton from "@/components/AddFilesButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteAssistant } from "@/lib/actions/deleteAction";

interface AssistantWithFiles {
  assistantId: string;
  vectorStoreId: string;
  threadId: string;
  name: string;
  files: string[];
}

export default function ChatListingContent() {
  const [assistants, setAssistants] = useState<AssistantWithFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchAssistants = async () => {
    try {
      const response = await fetch("/api/assistants");
      if (response.ok) {
        const data = await response.json();
        setAssistants(data);
      }
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assistantId: string, assistantName: string) => {
    if (!confirm(`Are you sure you want to delete "${assistantName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(assistantId));
    
    try {
      const result = await deleteAssistant(assistantId);
      
      if (result.status === "success") {
        // Remove from local state
        setAssistants(prev => prev.filter(a => a.assistantId !== assistantId));
        alert("Chat deleted successfully!");
      } else {
        alert(`Failed to delete chat: ${result.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the chat.");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(assistantId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground">
        <div>Loading assistants...</div>
      </main>
    );
  }

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
          {assistants.map((assistant) => (
            <Card key={assistant.assistantId} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex-1 mr-2">
                    {assistant.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(assistant.assistantId, assistant.name)}
                    disabled={deletingIds.has(assistant.assistantId)}
                    className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    aria-label={`Delete ${assistant.name}`}
                  >
                    {deletingIds.has(assistant.assistantId) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {assistant.files.length ? (
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {assistant.files.map((fname) => (
                        <li key={fname} className="break-words">{fname}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Dateien gefunden</p>
                )}
              </CardContent>

              <div className="p-4 pt-0 mt-auto space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/chat?assistantId=${assistant.assistantId}&threadId=${assistant.threadId}&name=${encodeURIComponent(assistant.name)}`}>
                    Öffnen
                  </Link>
                </Button>
                
                <AddFilesButton 
                  vectorStoreId={assistant.vectorStoreId}
                  onSuccess={fetchAssistants}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
} 