export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold mb-8">Emils Tool Fabrick</h2>

        <nav className="space-y-4">
          <a href="/dashboard" className="block text-gray-800 hover:text-black">
            Dashboard
          </a>
          <a href="/dashboard/projects" className="block text-gray-800 hover:text-black">
            Projekte
          </a>
          <a href="/dashboard/github" className="block text-gray-800 hover:text-black">
            GitHub
          </a>
          <a href="/dashboard/supabase" className="block text-gray-800 hover:text-black">
            Supabase
          </a>
          <a href="/dashboard/vercel" className="block text-gray-800 hover:text-black">
            Vercel
          </a>
          <a href="/dashboard/traycer" className="block text-gray-800 hover:text-black">
            Traycer
          </a>
          <a href="/dashboard/mobile" className="block text-gray-800 hover:text-black">
            Mobile Builds
          </a>
          <a href="/dashboard/assistant" className="block text-gray-800 hover:text-black">
            GPT-Assistent
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
