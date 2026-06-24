"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LogsFilterClient({ users }: { users: { id: string, name: string | null }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUser = searchParams.get("user") || "";

  return (
    <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
      <label className="font-bold text-sm text-muted-foreground">Filtrar por Usuario:</label>
      <select 
        value={selectedUser}
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            router.push(`/admin/logs?user=${val}`);
          } else {
            router.push(`/admin/logs`);
          }
        }}
        className="bg-black border border-border rounded p-2 text-white outline-none focus:border-primary"
      >
        <option value="">Todos los Usuarios</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.name || "Sin nombre"}</option>
        ))}
      </select>
    </div>
  );
}
