import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';

export class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SectionErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    hapticLight();
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <WidgetError 
          fallbackTitle={this.props.fallbackTitle}
          fallbackMessage={this.props.fallbackMessage}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

export function WidgetError({ fallbackTitle, fallbackMessage, onRetry, className }) {
  return (
    <div className={cn(
      "w-full bg-edu-surface border border-red-500/20 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-3">
        <AlertOctagon size={24} className="text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-edu-text mb-1">
        {fallbackTitle || "Xatolik yuz berdi"}
      </h3>
      <p className="text-[11px] text-edu-muted font-medium mb-4 max-w-[200px] leading-relaxed">
        {fallbackMessage || "Ushbu qismni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring."}
      </p>
      <button
        onClick={() => {
          hapticLight();
          if (onRetry) onRetry();
        }}
        className="flex items-center gap-2 bg-edu-bg border border-edu-border hover:bg-edu-border/30 text-edu-text px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
      >
        <RefreshCw size={14} /> Qayta urinish
      </button>
    </div>
  );
}
