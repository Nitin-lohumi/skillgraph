"use client";

import { Loader2, Inbox, AlertTriangle } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
      <Loader2 className="animate-spin mb-3" size={28} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Try adjusting your search.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
      <Inbox className="mb-3" size={28} />
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-red-400">
      <AlertTriangle className="mb-3" size={28} />
      <p className="text-sm font-medium">Unable to load data</p>
      <p className="text-xs mt-1 text-zinc-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          Try again
        </button>
      )}
    </div>
  );
}