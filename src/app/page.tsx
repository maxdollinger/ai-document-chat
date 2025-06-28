"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useState,
  type ChangeEvent,
  type DragEvent,
  useRef,
  useTransition,
} from "react";
import { uploadFiles } from "@/lib/actions/uploadAction";
import { useRouter } from "next/navigation";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setMessage("");
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setMessage("");
    }
  };

  const handleSubmit = (formData: FormData) => {
    if (!files || files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    startTransition(async () => {
      setMessage("Uploading and processing files...");
      const result = await uploadFiles(formData);

      if (result.status === "success") {
        setMessage(result.message);
        router.push(
          `/chat?assistantId=${result.assistantId}`,
        );
      } else {
        setMessage(result.message);
      }

      setFiles(null);
      formRef.current?.reset();
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-background text-foreground">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI Document Chat
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground">
            Laden Sie Ihre Dokumente hoch und beginnen Sie zu chatten.
          </p>
        </header>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Was diese App kann</CardTitle>
            <CardDescription>
              Text, Tabellen, Grafiken und Gliederungen werden so umgewandelt,
              dass das Sprachmodell diese gut verwenden kann.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Chat</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>KI antwortet kontextbezogen mit Quellenangabe.</li>
                  <li>
                    Erkennt automatisch, wenn ein Vergleich oder eine Analyse
                    gewünscht ist, die grafisch dargestellt werden sollte.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Diagramme</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Erstellt bei Bedarf das passende Chart (Balken, Linie).
                  </li>
                  <li>Wählt selbst den sinnvollsten Typ.</li>
                  <li>Diagramme sind in Folgefragen referenzierbar.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="mt-12 w-full">
          <form
            ref={formRef}
            action={handleSubmit}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col gap-6"
          >
            <div
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <label
                htmlFor="file-upload"
                className="absolute inset-0 cursor-pointer"
              />
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Dateien hierher ziehen oder klicken, um sie auszuwählen
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Unterstützt mehrere Dateien
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Maximale Gesamtgröße: 15MB
                </p>
              </div>
              <input
                id="file-upload"
                name="files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {files && files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ausgewählte Dateien</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {Array.from(files).map((file, index) => (
                      <li key={index}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              disabled={isPending || !files || files.length === 0}
            >
              {isPending ? "Erstelle Assistent..." : "Dateien hochladen"}
            </Button>
          </form>
          {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </section>
      </div>
    </main>
  );
}
