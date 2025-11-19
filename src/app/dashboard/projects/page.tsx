"use client";

import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Platzhalter: später GitHub API
    setProjects([
      { name: "emils-tool-fabrick", description: "Die Schaltzentrale" },
      { name: "kinklinkapp", description: "Dating App" },
      { name: "forensic-scanner", description: "Forensic Tools" }
    ]);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Projekte</h1>

      <div className="space-y-4">
        {projects.map((p, i) => (
          <div key={i} className="p-4 bg-white shadow rounded flex justify-between">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-gray-600 text-sm">{p.description}</div>
            </div>

            <div className="flex space-x-3">
              <button className="px-3 py-1 bg-blue-500 text-white rounded">
                Öffnen
              </button>
              <button className="px-3 py-1 bg-green-500 text-white rounded">
                Deploy
              </button>
              <button className="px-3 py-1 bg-purple-500 text-white rounded">
                Mobile Build
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
