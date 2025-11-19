"use client";

import { useSession } from "next-auth/react";

export default function TraycerPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Traycer Workflows</h1>
        <p className="text-gray-600">Bitte logge dich ein.</p>
      </div>
    );
  }

  const executeWorkflow = async (taskName: string) => {
    try {
      const response = await fetch("/api/traycer/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName,
          params: {
            project_name: "test-app",
            project_description: "Test Application",
          },
          projectId: "example-id",
        }),
      });

      const data = await response.json();
      alert(`✅ Workflow ausgeführt!\n${JSON.stringify(data, null, 2)}`);
    } catch {
      alert("❌ Workflow fehlgeschlagen");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Traycer Workflows 🤖</h1>
      <p className="text-gray-600 mb-6">
        Automatisierte Multi-Step-Workflows für Generate → Build → Deploy
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Verfügbare Tasks</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">🚀 create-full-app</h3>
            <p className="text-sm text-gray-600 mb-3">
              Erstellt komplette App: GitHub Repo + Vercel Deploy + Supabase Log
            </p>
            <button
              onClick={() => executeWorkflow("create-full-app")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Task ausführen
            </button>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">🌐 deploy-existing</h3>
            <p className="text-sm text-gray-600 mb-3">
              Deployed ein existierendes Projekt auf Vercel
            </p>
            <button
              onClick={() => executeWorkflow("deploy-existing")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Task ausführen
            </button>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">📱 build-mobile</h3>
            <p className="text-sm text-gray-600 mb-3">
              Erstellt Mobile Build (Android/iOS)
            </p>
            <button
              onClick={() => executeWorkflow("build-mobile")}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Task ausführen
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Workflow Status</h2>
        <p className="text-sm text-gray-600">
          Logs und Status werden in Supabase <code>actions</code> Tabelle gespeichert.
        </p>
      </div>
    </div>
  );
}
