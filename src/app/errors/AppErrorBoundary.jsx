import React from "react";

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-loader px-6 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="text-2xl font-semibold text-foreground">Halaman gagal dimuat</h1>
            <p className="text-sm text-muted-foreground">
              Terjadi kendala saat memuat halaman. Muat ulang halaman atau coba lagi beberapa saat lagi.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
