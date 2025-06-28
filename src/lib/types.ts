export type Progress = {
  status:
    | "uploading"
    | "processing"
    | "creating_assistant"
    | "complete"
    | "error";
  details: string;
  assistantId?: string;
  threadId?: string;
}; 