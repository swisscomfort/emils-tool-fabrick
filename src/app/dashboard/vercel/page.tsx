"use client";

import { useSession } from "next-auth/react";

export default function VercelPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Vercel Integration</h1>
        <p className="text-gray-600">Bitte logge dich ein.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vercel Deployments 🚀</h1>
      <p className="text-gray-600 mb-6">
        Verwalte deine Vercel Deployments und ENV-Variablen.
      </p>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Deploy Project</h3>
            <p className="text-sm text-gray-600 mb-3">
              Deployed ein Projekt direkt von GitHub auf Vercel
            </p>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Deploy starten
            </button>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">ENV Variables</h3>
            <p className="text-sm text-gray-600 mb-3">
              Synchronisiere Environment Variables mit Vercel
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              ENV Sync
            </button>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Projects List</h3>
            <p className="text-sm text-gray-600 mb-3">
              Zeige alle Vercel Projekte an
            </p>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              Projekte laden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
