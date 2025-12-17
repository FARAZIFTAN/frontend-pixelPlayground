import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F] p-4">
          <Card className="w-full max-w-md bg-[#0F0F0F]/90 backdrop-blur-xl border border-[#C62828]/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-[#C62828]" />
                <CardTitle className="text-white">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-sm text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-300">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-black/30 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-[#E53935]"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="flex-1 border-[#C62828]/30 text-white hover:bg-white/5"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
