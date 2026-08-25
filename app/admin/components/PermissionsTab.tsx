"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Check, Save } from "lucide-react";

export function PermissionsTab() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  // Pega a sessão atual
  const sessionData = typeof window !== "undefined" ? localStorage.getItem("admin_session") : null;
  const session = sessionData ? JSON.parse(sessionData) : null;
  const hasFullAccess = session?.role === "ADM" || session?.role === "DEV";

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const { data, error } = await supabase.from("role_permissions").select("*").order("role_name");
    if (!error && data) {
      // Filtra para esconder o cargo DEV completamente da lista
      const filtered = data.filter((p: any) => p.role_name !== "DEV");
      setPermissions(filtered);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    // Impede criar cargo com nome DEV por segurança
    if (newRoleName.trim().toUpperCase() === "DEV") {
      alert("Nome de cargo reservado.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("role_permissions").insert([
      {
        role_name: newRoleName.trim(),
        can_manage_services: false,
        can_manage_barbers: false,
        can_manage_schedule: true,
        can_manage_settings: false,
      }
    ]);

    if (error) {
      alert("Erro ao criar cargo (talvez já exista): " + error.message);
    } else {
      setNewRoleName("");
      fetchPermissions();
    }
    setLoading(false);
  };

  const handleTogglePermission = async (id: string, field: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("role_permissions")
      .update({ [field]: !currentValue })
      .eq("id", id);

    if (!error) {
      fetchPermissions();
    } else {
      alert("Erro ao atualizar permissão: " + error.message);
    }
  };

  const handleDeleteRole = async (id: string, roleName: string) => {
    if (roleName === "ADM") {
      alert("Não é possível excluir o cargo principal do sistema.");
      return;
    }

    if (confirm(`Deseja excluir o cargo ${roleName}?`)) {
      const { error } = await supabase.from("role_permissions").delete().eq("id", id);
      if (!error) fetchPermissions();
    }
  };

  if (!hasFullAccess) {
    return <div className="text-zinc-400 text-xs p-4">Acesso restrito a administradores.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Criar novo cargo */}
      <form onSubmit={handleAddRole} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" /> Adicionar Novo Cargo
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            required
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Nome do cargo (Ex: Recepcionista, Gerente)"
            className="flex-1 bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Adicionar Cargo
          </button>
        </div>
      </form>

      {/* Tabela de Permissões */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Matriz de Permissões por Cargo
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase">
              <tr>
                <th className="p-3">Cargo</th>
                <th className="p-3 text-center">Gerenciar Serviços</th>
                <th className="p-3 text-center">Gerenciar Colaboradores</th>
                <th className="p-3 text-center">Gerenciar Agendamentos</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-950/50">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px]">
                      {p.role_name}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.can_manage_services}
                      onChange={() => handleTogglePermission(p.id, "can_manage_services", p.can_manage_services)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.can_manage_barbers}
                      onChange={() => handleTogglePermission(p.id, "can_manage_barbers", p.can_manage_barbers)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.can_manage_schedule}
                      onChange={() => handleTogglePermission(p.id, "can_manage_schedule", p.can_manage_schedule)}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    {p.role_name !== "ADM" && (
                      <button
                        onClick={() => handleDeleteRole(p.id, p.role_name)}
                        className="text-zinc-500 hover:text-red-500 font-bold"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}