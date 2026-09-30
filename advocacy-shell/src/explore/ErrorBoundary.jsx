import React from "react";
import { C, FONT } from "./styles/tokens";
import { useNavigate } from "react-router-dom";
import * as Icons from "./components/Icons";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Explore ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "50vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: 500,
        textAlign: "center",
      }}>
        <div style={{ color: C.red, marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
          <Icons.AlertTriangle size={48} />
        </div>
        <h2 style={{
          fontFamily: FONT.display,
          fontSize: "2rem",
          color: C.textBright,
          marginBottom: "1rem",
        }}>System Exception</h2>
        
        <p style={{
          fontFamily: FONT.body,
          color: C.muted,
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}>
          A component encountered an unexpected error while attempting to render. 
          The data visualization engine may have received malformed input.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => {
              onReset();
              navigate("/explore");
            }}
            style={{
              background: C.gold,
              color: C.bgDeep,
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: 24,
              fontFamily: FONT.condensed,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            Return to Index
          </button>
        </div>
      </div>
    </div>
  );
}
