'use client';

import React from 'react';
import { T, mono } from './data';

interface Props {
  children: React.ReactNode;
  phaseName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 48, textAlign: 'center', maxWidth: 600, margin: '0 auto',
        }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.red}30`, borderRadius: 8,
            padding: 32,
          }}>
            <div style={{ ...mono, fontSize: 11, color: T.red, marginBottom: 12 }}>
              RENDERING ERROR{this.props.phaseName ? ` — ${this.props.phaseName}` : ''}
            </div>
            <div style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>
              Something went wrong rendering this phase.
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              style={{
                ...mono, fontSize: 12, padding: '8px 20px', background: T.accent,
                color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
