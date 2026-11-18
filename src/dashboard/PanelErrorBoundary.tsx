// COW-37 keeps a throwing panel from taking down the whole dashboard.
import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorPanel } from "./states";

interface Props {
  children: ReactNode;
  /** Changing this key clears a previous panel error. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Dashboard panel failed", error, info.componentStack);
  }

  componentDidUpdate(previous: Props): void {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorPanel message={this.state.error.message} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
