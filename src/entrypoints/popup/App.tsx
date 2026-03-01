import React from "react";
import { HashRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX } from "react/jsx-runtime";
import Popup from "./pages/Popup";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function App(): JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Popup />} />
                    <Route path="settings" element={<Settings />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    );
}

export default App;
