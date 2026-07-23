import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Globe ErrorBoundary] Caught WebGL/render error:', error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-luxury-black/50 rounded-xl">
          <div className="text-center max-w-md px-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Globe Render Error</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              The 3D globe encountered a WebGL error. This usually happens when the browser's
              graphics context is lost or unavailable. Try refreshing or using a different browser.
            </p>
            {this.state.error && (
              <p className="text-[9px] text-gray-600 mb-4 font-mono">
                {this.state.error.message?.slice(0, 120)}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-luxury-gold-500/20 border border-luxury-gold-500/30 rounded-lg text-xs font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-colors"
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
