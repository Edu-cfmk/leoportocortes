"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Trash2, Plus, Edit2, X } from "lucide-react";

export function BarbersTab() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Funcionário");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const { data } = await supabase.from("barbers").select("*").order("name");
    setBarbers(data || []);
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Preencha o nome do colaborador.");

    setLoading(true);

    if (editingId) {
      // Atualizar colaborador existente
      const { error } = await supabase
        .from("barbers")
        .update({ name, role })
        .eq("id", editingId);

      if (error) {
        alert("Erro ao atualizar colaborador: " + error.message);
      } else {
        alert("Colaborador atualizado com sucesso!");
        handleCancelEdit();
        fetchBarbers();
      }
    } else {
      // Inserir novo colaborador
      const { error } = await supabase.from("barbers").insert([
        {
          id: crypto.randomUUID(),
          name,
          role
        }
      ]);

      if (error) {
        alert("Erro ao cadastrar colaborador: " + error.message);
      } else {
        setName("");
        setRole("Funcionário");
        fetchBarbers();
        alert("Colaborador cadastrado com sucesso!");
      }
    }
    setLoading(false);
  };

  const handleEdit = (barber: any) => {
    setEditingId(barber.id);
    setName(barber.name);
    setRole(barber.role || "Funcionário");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setRole("Funcionário");
  };

  const handleDeleteBarber = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este colaborador?")) {
      const { error } = await supabase.from("barbers").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchBarbers();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />{" "}
          {editingId ? "Editar Colaborador" : "Gerenciar Colaboradores / Barbeiros"}
        </h2>

        <form onSubmit={handleSaveBarber} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Colaborador (ex: Léo Porto)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="Funcionário">Funcionário</option>
              <option value="ADM">ADM (Administrador)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors flex-1"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Adicionar Colaborador"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Colaboradores Cadastrados
        </h3>

        {barbers.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Nenhum colaborador cadastrado no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-lg"
              >
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {barber.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        barber.role === "ADM"
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {barber.role || "Funcionário"}
                    </span>
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(barber)}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 text-xs px-3"
                    title="Editar Colaborador"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBarber(barber.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    title="Excluir Colaborador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}