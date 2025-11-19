"use client";

import { useSession } from "next-auth/react";

export default function MobilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Mobile Builds</h1>
        <p className="text-gray-600">Bitte logge dich ein.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mobile App Builds 📱</h1>
      <p className="text-gray-600 mb-6">
        Erstelle native Android und iOS Builds mit Capacitor.
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Build Setup</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">📋 Voraussetzungen</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Capacitor initialisiert (<code>npx cap init</code>)</li>
              <li>Android/iOS Platform hinzugefügt</li>
              <li>Java SDK installiert (Android)</li>
              <li>Xcode installiert (iOS, nur macOS)</li>
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">🤖 Android Build</h3>
            <p className="text-sm text-gray-600 mb-3">
              Erstellt eine APK-Datei für Android-Geräte
            </p>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Android Build starten
            </button>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">🍎 iOS Build</h3>
            <p className="text-sm text-gray-600 mb-3">
              Erstellt eine IPA-Datei für iOS-Geräte (erfordert macOS)
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              iOS Build starten
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Build History</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vergangene Builds werden in Supabase <code>builds</code> Tabelle gespeichert.
        </p>
        <div className="text-sm text-gray-500">
          Keine Builds vorhanden. Starte deinen ersten Build!
        </div>
      </div>
    </div>
  );
}
