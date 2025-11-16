import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.jsx";
import "./index.css";
import "antd/dist/reset.css";
import ReactQueryProvider from "../src/features/public/hooks/ReactQueryProvider.jsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ReactQueryProvider>
      <App />
      <Toaster position="top-right" richColors />
    </ReactQueryProvider>
  </React.StrictMode>
);
