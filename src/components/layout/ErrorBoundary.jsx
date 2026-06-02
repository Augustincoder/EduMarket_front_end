import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-edu-bg p-4 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-edu-text mb-2">Nimadir xato ketdi</h1>
          <p className="text-sm text-edu-muted max-w-sm mb-8 leading-relaxed">
            Kechirasiz, ilovada kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang.
          </p>
          <Button 
            onClick={this.handleReload} 
            variant="primary" 
            size="lg" 
            icon={<RefreshCcw size={18} />}
          >
            Sahifani yangilash
          </Button>
        </div>
      );
    }

    return this.props.children; 
  }
}
