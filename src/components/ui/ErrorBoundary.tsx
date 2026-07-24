// ============================================================
// TerraNexus AI — Error Boundary
// Catches rendering errors and shows a premium error state
// instead of a blank white screen
// ============================================================

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="premium-card p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {this.props.fallbackMessage || 'An unexpected error occurred while rendering this section.'}
            </p>
            {this.state.error && (
              <p className="text-[10px] text-gray-600 font-mono mb-6 p-2 rounded bg-gray-900/50 border border-gray-800 max-h-20 overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-luxury-gold-500/20 border border-luxury-gold-500/30 rounded-lg text-xs font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
