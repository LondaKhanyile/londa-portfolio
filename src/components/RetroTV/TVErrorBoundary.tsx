"use client";

import { Component, type ReactNode } from "react";
import ProjectCards from "./ProjectCards";

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
      return (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center">
          <p className="px-4 pt-4 text-center text-sm text-neutral-400">
            The TV view isn&apos;t supported on this device.
          </p>
          <ProjectCards />
        </div>
      );
    }
    return this.props.children;
  }
}
