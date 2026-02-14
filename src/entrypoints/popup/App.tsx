import React from "react";
import { HashRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX } from "react/jsx-runtime";
import Popup from "./pages/Popup";

const queryClient = new QueryClient();

function App(): JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Popup />} />
                    <Route
                        path="settings"
                        element={
                            <div>
                                <h1>Settings</h1>
                                <p>Configure your extension settings here.</p>
                            </div>
                        }
                    />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    );
}

export default App;
