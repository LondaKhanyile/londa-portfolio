"use client";

import Image from "next/image";
import { TV_CHANNELS } from "./types";

const projects = TV_CHANNELS.filter((ch) => ch.url);

export default function ProjectCards() {
  return (
    <div className="flex min-h-0 flex-col items-center gap-4">
      <p className="text-center text-sm text-neutral-400">
        Tap a project to open it.
      </p>
      <ul className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2" role="list">
        {projects.map((ch) => (
          <li key={ch.url}>
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-700/80 bg-neutral-900/50 shadow-sm transition hover:border-neutral-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
            >
              {ch.screenshot ? (
                <div className="relative aspect-video w-full bg-neutral-800">
                  <Image
                    src={ch.screenshot}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-neutral-800/80">
                  <span className="text-xs text-neutral-500">No preview</span>
                </div>
              )}
              <span className="px-3 py-2.5 text-sm font-medium text-neutral-200">
                {ch.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {/* Spacer so last card scrolls into view on all devices (e.g. Android P30 Lite) */}
      <div className="min-h-[16vh] w-full shrink-0 md:min-h-[10vh]" aria-hidden />
    </div>
  );
}
