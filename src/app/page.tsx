"use client";

import { useState, type ChangeEvent, type FormEvent, type DragEvent } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading...");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(files[i].name, files[i]);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      setFiles(null);
    }
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

        <section className="bg-card p-6 sm:p-8 rounded-lg shadow-md border w-full text-card-foreground">
          <h2 className="text-2xl font-semibold mb-4">
            Was diese App kann
          </h2>
          <p className="mb-6 text-muted-foreground">
            Text, Tabellen, Grafiken und Gliederungen werden so umgewandelt, dass
            das Sprachmodell diese gut verwenden kann.
          </p>

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
                <li>Erstellt bei Bedarf das passende Chart (Balken, Linie).</li>
                <li>Wählt selbst den sinnvollsten Typ.</li>
                <li>Diagramme sind in Folgefragen referenzierbar.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 w-full">
          <form
            onSubmit={handleSubmit}
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
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {files && files.length > 0 && (
              <div className="space-y-2 text-sm">
                <h3 className="font-medium">Ausgewählte Dateien:</h3>
                <ul className="list-disc list-inside bg-muted/50 p-4 rounded-md border text-muted-foreground space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !files || files.length === 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? "Uploading..." : "Dateien hochladen"}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </section>
      </div>
    </main>
  );
}
