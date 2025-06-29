"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground">
      <div className="w-full max-w-5xl">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI Document Chat
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground">
            Willkommen! Wählen Sie eine Option aus, um zu starten.
          </p>
        </header>

        <section className="p-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/chat/new">Neuer Chat</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/chat/listing">Vorhandene Chats</Link>
          </Button>
        </section>

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
      </div>
    </main>
  );
}
