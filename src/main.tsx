import * as React from "react";
import * as ReactDOM from "react-dom/client";
import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import App from "./App";


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000
    }
  }
});



const rootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ToastContainer />
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
