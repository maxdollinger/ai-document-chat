"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addFilesToVectorStore } from "@/lib/actions/uploadAction";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

interface AddFilesButtonProps {
  vectorStoreId: string;
  onSuccess?: () => void;
}

export default function AddFilesButton({ vectorStoreId, onSuccess }: AddFilesButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("vectorStoreId", vectorStoreId);
    
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    startTransition(async () => {
      setMessage("Dateien werden hinzugefügt...");
      const result = await addFilesToVectorStore(formData);
      
      setMessage(result.message);
      
      if (result.status === "success") {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onSuccess?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFileSelect}
        disabled={isPending}
        className="w-full"
      >
        <DocumentPlusIcon className="h-4 w-4 mr-2" />
        {isPending ? "Wird hinzugefügt..." : "Dateien hinzufügen"}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.doc,.docx,.md"
      />
      
      {message && (
        <p className={`text-xs text-center ${
          message.includes("successfully") ? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
} 