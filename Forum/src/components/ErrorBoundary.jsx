import React from 'react';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: 'var(--bg-base, #0d0d1a)' }}>
            
          {/* Background glowing effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl w-full flex flex-col items-center justify-center text-center fade-in">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
              <div className="relative h-28 w-28 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10"
                   style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)' }}>
                <ServerCrash className="w-14 h-14 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight"
                style={{ color: 'var(--text-primary, #fff)' }}>
              Nhiễu loạn Không gian
            </h1>
            
            <p className="text-lg mb-8 max-w-md mx-auto leading-relaxed"
               style={{ color: 'var(--text-secondary, #94a3b8)' }}>
              Hệ thống của ForumHub vừa gặp sự cố gián đoạn bất ngờ. Hãy thử tải lại trang hoặc quay về Bảng tin.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Tải lại trang</span>
              </button>
              
              <button 
                onClick={() => window.location.href = '/user'} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all border hover:-translate-y-0.5"
                style={{ 
                    background: 'var(--bg-card, #1e1e2f)', 
                    borderColor: 'var(--border-color, #334155)',
                    color: 'var(--text-primary, #fff)'
                }}
              >
                <Home className="w-5 h-5 text-primary-500" />
                <span>Về Bảng tin</span>
              </button>
            </div>

            {/* Error details for developers */}
            {import.meta.env.DEV && (
              <div className="mt-12 w-full text-left">
                <button 
                  className="text-xs font-semibold text-red-400 opacity-60 hover:opacity-100 flex items-center gap-1 mx-auto mb-2 transition-opacity"
                  onClick={() => {
                    const el = document.getElementById('error-details');
                    el?.classList.toggle('hidden');
                  }}
                >
                  <ServerCrash className="w-3 h-3" /> Chi tiết lỗi (Chỉ hiển thị trên MT Dev)
                </button>

                <div id="error-details" className="hidden mt-4">
                  <pre className="p-4 rounded-xl text-xs overflow-auto max-h-60"
                       style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <code className="text-red-400 font-bold block mb-2">{this.state.error?.toString()}</code>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
