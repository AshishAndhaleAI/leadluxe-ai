import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 font-display">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30 rounded-lg text-sm font-medium hover:bg-luxury-gold-500/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-800 text-gray-400 rounded-lg text-sm hover:text-white hover:border-gray-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
