"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Project {
  id: number;
  name: string;
  description: string;
  html_url: string;
  owner: { login: string };
  updated_at: string;
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [buildingId, setBuildingId] = useState<number | null>(null);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/github/repos");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Fehler beim Laden der Projekte:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (project: Project) => {
    setDeployingId(project.id);
    
    try {
      const response = await fetch("/api/vercel/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.name,
          gitSource: {
            type: "github",
            ref: "main",
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert(`Deployment fehlgeschlagen: ${data.error}`);
      } else {
        alert(`✅ Deployment gestartet!\nURL: ${data.url || "wird generiert..."}`);
      }
    } catch {
      alert("❌ Deployment fehlgeschlagen");
    } finally {
      setDeployingId(null);
    }
  };

  const handleMobileBuild = async (project: Project, platform: "android" | "ios") => {
    setBuildingId(project.id);
    
    try {
      const response = await fetch("/api/mobile/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.name,
          platform,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert(`Build fehlgeschlagen: ${data.error}`);
      } else {
        alert(`✅ ${platform} Build gestartet!\nBuild ID: ${data.buildId}`);
      }
    } catch {
      alert("❌ Mobile Build fehlgeschlagen");
    } finally {
      setBuildingId(null);
    }
  };

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Projekte</h1>
        <p className="text-gray-600">Bitte logge dich ein, um deine Projekte zu sehen.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Projekte</h1>
        <p className="text-gray-600">Lade Projekte...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projekte ({projects.length})</h1>
        <button
          onClick={fetchProjects}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          🔄 Aktualisieren
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Noch keine Projekte vorhanden.</p>
          <p className="text-sm text-gray-500">
            Nutze den GPT-Assistenten, um neue Projekte zu erstellen!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 bg-white shadow rounded flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-lg">{project.name}</div>
                <div className="text-gray-600 text-sm mb-2">
                  {project.description || "Keine Beschreibung"}
                </div>
                <div className="text-xs text-gray-500">
                  Owner: {project.owner.login} • 
                  Aktualisiert: {new Date(project.updated_at).toLocaleDateString("de-DE")}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600"
                >
                  📂 GitHub öffnen
                </a>
                
                <button
                  onClick={() => handleDeploy(project)}
                  disabled={deployingId === project.id}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  {deployingId === project.id ? "⏳ Deploying..." : "🚀 Deploy"}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMobileBuild(project, "android")}
                    disabled={buildingId === project.id}
                    className="flex-1 px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300"
                  >
                    🤖 Android
                  </button>
                  <button
                    onClick={() => handleMobileBuild(project, "ios")}
                    disabled={buildingId === project.id}
                    className="flex-1 px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300"
                  >
                    🍎 iOS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
