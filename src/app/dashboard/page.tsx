export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Willkommen Emil 👋</h1>
      <p className="text-gray-600 mb-10">
        Deine No-Code Entwickler-Schaltzentrale.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded">🚀 Projekte verwalten</div>
        <div className="p-6 bg-white shadow rounded">🧰 GitHub verbinden</div>
        <div className="p-6 bg-white shadow rounded">📦 Supabase Datenbank</div>
        <div className="p-6 bg-white shadow rounded">🌐 Vercel Deployments</div>
        <div className="p-6 bg-white shadow rounded">🤖 Traycer Tasks</div>
        <div className="p-6 bg-white shadow rounded">📱 Mobile App Builds</div>
      </div>
    </div>
  );
}
