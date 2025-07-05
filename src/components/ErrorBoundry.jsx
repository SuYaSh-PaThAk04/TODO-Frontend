import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 Drag-and-drop error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Full error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      alert('⚠️ Drag-and-drop failed. Please refresh or try again.');
      return null;  // Or return some fallback UI here if you want
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
