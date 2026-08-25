"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";

export function PermissionsTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para edição inline do nome do cargo
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [tempRoleName, setTempRoleName] = useState("");

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    const { data, error } = await supabase.from("role_permissions").select("*");
    if (!error && data) {
      // Oculta o cargo DEV completamente da matriz
      const filteredRoles = data.filter((r: any) => r.role_name !== "DEV");
      setRoles(filteredRoles);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setLoading(true);
    const formattedRole = newRoleName.trim();

    const { error } = await supabase.from("role_permissions").insert([
      {
        role_name: formattedRole,
        can_manage_services: false,
        can_manage_barbers: false,
        can_manage_schedule: false,
        can_manage_schedules: false,
        can_manage_reports: false,
      },
    ]);

    if (error) {
      alert("Erro ao criar cargo: " + error.message);
    } else {
      setNewRoleName("");
      fetchRolesAndPermissions();
    }
    setLoading(false);
  };

  const handleTogglePermission = async (roleName: string, field: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("role_permissions")
      .update({ [field]: !currentValue })
      .eq("role_name", roleName);

    if (error) {
      alert("Erro ao atualizar permissão: " + error.message);
    } else {
      fetchRolesAndPermissions();
    }
  };

  const handleUpdateRoleName = async (oldName: string) => {
    if (!tempRoleName.trim() || tempRoleName === oldName) {
      setEditingRoleName(null);
      return;
    }

    const newName = tempRoleName.trim();
    const { error } = await supabase
      .from("role_permissions")
      .update({ role_name: newName })
      .eq("role_name", oldName);

    if (error) {
      alert("Erro ao renomear cargo: " + error.message);
    } else {
      setEditingRoleName(null);
      fetchRolesAndPermissions();
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (roleName === "ADM" || roleName === "Barbeiro") {
      alert("Este cargo padrão do sistema não pode ser excluído.");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o cargo ${roleName}?`)) {
      const { error } = await supabase.from("role_permissions").delete().eq("role_name", roleName);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchRolesAndPermissions();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário para Adicionar Novo Cargo */}
      <form onSubmit={handleAddRole} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Adicionar Novo Cargo
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Nome do cargo (Ex: Recepcionista, Gerente)"
            className="flex-1 bg-black border border-zinc-800 rounded-lg p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Adicionar Cargo
          </button>
        </div>
      </form>

      {/* Matriz de Permissões Responsiva */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Matriz de Permissões por Cargo
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Gerencie o acesso e renomeie funções do painel administrativo.
          </p>
        </div>

        {/* Versão Compacta/Cards para Celular */}
        <div className="space-y-4 sm:hidden">
          {roles.map((r) => (
            <div key={r.id || r.role_name} className="bg-black/60 border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                {editingRoleName === r.role_name ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempRoleName}
                      onChange={(e) => setTempRoleName(e.target.value)}
                      className="bg-black border border-zinc-700 px-2 py-1 rounded text-xs text-white w-28 focus:outline-none focus:border-red-600"
                    />
                    <button
                      onClick={() => handleUpdateRoleName(r.role_name)}
                      className="p-1 bg-green-950 text-green-400 rounded hover:bg-green-900"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingRoleName(null)}
                      className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-950 text-red-400 border border-red-800 px-2.5 py-1 rounded text-xs font-bold">
                      {r.role_name}
                    </span>
                    {r.role_name !== "ADM" && r.role_name !== "Barbeiro" && (
                      <button
                        onClick={() => {
                          setEditingRoleName(r.role_name);
                          setTempRoleName(r.role_name);
                        }}
                        className="text-zinc-500 hover:text-white"
                        title="Editar nome"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {r.role_name !== "ADM" && r.role_name !== "Barbeiro" ? (
                  <button
                    onClick={() => handleDeleteRole(r.role_name)}
                    className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-600 italic">Padrão</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-400">Serviços</span>
                  <input
                    type="checkbox"
                    checked={r.can_manage_services}
                    onChange={() => handleTogglePermission(r.role_name, "can_manage_services", r.can_manage_services)}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-400">Colaboradores</span>
                  <input
                    type="checkbox"
                    checked={r.can_manage_barbers}
                    onChange={() => handleTogglePermission(r.role_name, "can_manage_barbers", r.can_manage_barbers)}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-400">Horários</span>
                  <input
                    type="checkbox"
                    checked={r.can_manage_schedules || r.can_manage_schedule}
                    onChange={() => handleTogglePermission(r.role_name, "can_manage_schedules", r.can_manage_schedules || r.can_manage_schedule)}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-400">Relatórios</span>
                  <input
                    type="checkbox"
                    checked={r.can_manage_reports}
                    onChange={() => handleTogglePermission(r.role_name, "can_manage_reports", r.can_manage_reports)}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Versão Tabela Desktop */}
        <div className="hidden sm:block w-full overflow-x-auto pb-2">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase">
                <th className="p-3">Cargo</th>
                <th className="p-3 text-center">Serviços</th>
                <th className="p-3 text-center">Colaboradores</th>
                <th className="p-3 text-center">Horários</th>
                <th className="p-3 text-center">Relatórios</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {roles.map((r) => (
                <tr key={r.id || r.role_name} className="hover:bg-black/40 transition-colors">
                  <td className="p-3 font-bold text-white whitespace-nowrap">
                    {editingRoleName === r.role_name ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempRoleName}
                          onChange={(e) => setTempRoleName(e.target.value)}
                          className="bg-black border border-zinc-700 px-2 py-1 rounded text-xs text-white w-28 focus:outline-none focus:border-red-600"
                        />
                        <button
                          onClick={() => handleUpdateRoleName(r.role_name)}
                          className="p-1 bg-green-950 text-green-400 rounded hover:bg-green-900"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingRoleName(null)}
                          className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-1 rounded text-[11px]">
                          {r.role_name}
                        </span>
                        {r.role_name !== "ADM" && r.role_name !== "Barbeiro" && (
                          <button
                            onClick={() => {
                              setEditingRoleName(r.role_name);
                              setTempRoleName(r.role_name);
                            }}
                            className="text-zinc-500 hover:text-white"
                            title="Editar nome"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.can_manage_services}
                      onChange={() => handleTogglePermission(r.role_name, "can_manage_services", r.can_manage_services)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.can_manage_barbers}
                      onChange={() => handleTogglePermission(r.role_name, "can_manage_barbers", r.can_manage_barbers)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.can_manage_schedules || r.can_manage_schedule}
                      onChange={() => handleTogglePermission(r.role_name, "can_manage_schedules", r.can_manage_schedules || r.can_manage_schedule)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={r.can_manage_reports}
                      onChange={() => handleTogglePermission(r.role_name, "can_manage_reports", r.can_manage_reports)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    {r.role_name !== "ADM" && r.role_name !== "Barbeiro" ? (
                      <button
                        onClick={() => handleDeleteRole(r.role_name)}
                        className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic">Padrão</span>
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