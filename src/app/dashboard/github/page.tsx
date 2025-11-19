"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function GithubPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">GitHub verbinden</h1>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Mit GitHub einloggen
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Verbunden als:</h1>
      <p className="mb-6">{session.user?.name}</p>

      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
