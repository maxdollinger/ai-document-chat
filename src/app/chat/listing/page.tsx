import { Suspense } from "react";
import ChatListingContent from "./ChatListingContent";

export default function ChatListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatListingContent />
    </Suspense>
  );
} 