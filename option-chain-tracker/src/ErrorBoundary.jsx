import React from 'react';

// Catches render-time crashes so the app shows a readable message instead of a blank
// white page. The error text is displayed so it can be reported and fixed quickly.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 640, margin: '60px auto', padding: '24px', fontFamily: 'monospace' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c', marginBottom: 12 }}>
            Something went wrong rendering this page.
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
            The app hit a runtime error. Try a hard refresh (Ctrl+Shift+R). If it persists, send this message:
          </div>
          <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, fontSize: 12, color: '#7f1d1d', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); location.reload(); }}
            style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
