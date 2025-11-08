import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { StatusBar } from "./StatusBar";
import type { TransportState } from "~/types/audio";
import { mockTransportState } from "~/lib/mockData";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [transport, setTransport] = useState<TransportState>(mockTransportState);

  const updateTransport = (updates: Partial<TransportState>) => {
    setTransport((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar transport={transport} onTransportChange={updateTransport} />
        <main className="flex-1 overflow-auto">{children}</main>
        <StatusBar />
      </div>
    </div>
  );
}
