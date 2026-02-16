"use client";

import { Component, type ReactNode } from "react";
import { TV_CHANNELS } from "./types";

type Props = { children: ReactNode };

type State = { hasError: boolean };

export default class TVErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const projects = TV_CHANNELS.filter((ch) => ch.url);
      return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 px-4 py-6 text-center">
          <p className="text-sm text-neutral-400">
            The TV view isn&apos;t supported on this device. Here are the projects:
          </p>
          <ul className="flex flex-col gap-2" role="list">
            {projects.map((ch) => (
              <li key={ch.url}>
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-neutral-300 underline decoration-neutral-500 underline-offset-2 transition hover:text-neutral-100 hover:decoration-neutral-400"
                >
                  {ch.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return this.props.children;
  }
}
