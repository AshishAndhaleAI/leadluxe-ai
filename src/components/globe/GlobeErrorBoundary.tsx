// ============================================================
// LeadLuxe AI — Globe Error Boundary
// Catches Three.js / WebGL / Canvas rendering errors without
// crashing the rest of the application.
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class GlobeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Unknown WebGL error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[GlobeErrorBoundary] Caught:', error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-luxury-black/50 rounded-xl">
          <div className="text-center max-w-sm px-6">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Globe Render Error</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {this.state.errorMessage || 'The 3D globe could not be initialized. This may be due to WebGL compatibility or a temporary rendering issue.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-luxury-gold-500/20 text-luxury-gold-400 text-xs font-medium hover:bg-luxury-gold-500/30 transition-colors border border-luxury-gold-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Globe
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
