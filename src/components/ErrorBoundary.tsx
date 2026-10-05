import { Component, type ReactNode } from 'react';

/** If anything breaks, show a calm screen instead of a blank page. Progress is already saved. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Mathosaur error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="screen center-col">
        <div className="banner-emoji">🦖💫</div>
        <h1>Oops! Dino tripped.</h1>
        <p className="lead">Don’t worry – your stars are safe. Let’s go back home and try again.</p>
        <button
          type="button"
          className="btn btn-primary btn-big"
          onClick={() => {
            window.location.hash = '#/';
            window.location.reload();
          }}
        >
          🏠 Home
        </button>
      </div>
    );
  }
}
