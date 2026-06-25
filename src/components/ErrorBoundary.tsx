import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-stone-100 text-center">
            <h2 className="text-2xl font-bold text-stone-900 mb-4">抱歉，發生了一些錯誤</h2>
            <p className="text-stone-500 mb-6">
              應用程式遇到預期之外的問題。請嘗試重新整理頁面。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              重新整理
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-red-50 text-red-600 text-xs text-left overflow-auto rounded-lg max-h-40">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
