import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error in Component Tree:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4 dir-rtl text-right">
          <div className="max-w-md w-full bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 text-error flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-headline-md font-bold text-on-surface">
              تنبيه: حدث خطأ غير متوقع في الواجهة
            </h1>

            <p className="text-body-md text-on-surface-variant leading-relaxed">
              تم الإمساك بالاستثناء تلقائياً وتأمينه لتفادي انهيار الصفحة. يمكنك إعادة التحميل أو العودة للرئيسية.
            </p>

            {this.state.error && (
              <div className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl p-3 text-xs font-mono text-error/80 overflow-x-auto text-left" dir="ltr">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-2xl text-body-md font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة التحميل</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="bg-surface-container-high text-on-surface-variant hover:text-on-surface py-3 px-4 rounded-2xl text-body-md font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/30"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
