"use client";

import type { JournalEntry } from "@/data/journalEntries";

type JournalPageProps = {
  entry: JournalEntry;
  pageNumber: number;
  buildFor?: boolean;
};

export default function JournalPage({ entry, pageNumber, buildFor = false }: JournalPageProps) {
  return (
    <div className="booklet-page flex h-full flex-col p-5 sm:p-6 md:p-7">
      <p className="mb-1 text-[10px] font-medium tracking-widest text-neutral-500">
        Page {pageNumber}
      </p>
      <h3 className="mb-2 font-semibold text-neutral-300">{entry.title}</h3>
      <p className="mb-3 text-xs italic leading-relaxed text-neutral-500">{entry.blurb}</p>
      <div
        className="notepad-scroll relative min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-2 text-sm leading-relaxed text-neutral-400"
        style={{
          animation: buildFor ? "build-item-in 400ms ease-out both" : "none",
          animationDelay: buildFor ? "100ms" : undefined,
        }}
      >
        {entry.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
