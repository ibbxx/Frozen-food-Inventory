import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AppErrorBoundary } from "./app/errors/AppErrorBoundary";
import { AppProviders } from "./app/providers";
import { router } from "./app/router";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <AppErrorBoundary>
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </AppProviders>
  </React.StrictMode>,
);
