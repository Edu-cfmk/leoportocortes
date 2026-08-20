"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Edit2, Plus, X, User } from "lucide-react";

export function BarbersTab() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Barbeiro");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Pega o usuário logado da sessão do admin
  const sessionData = typeof window !== "undefined" ? localStorage.getItem("admin_session") : null;
  const session = sessionData ? JSON.parse(sessionData) : null;
  const isOwner = session?.role === "OWNER"; // Apenas o dono pode gerenciar totalmente

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const { data, error } = await supabase.from("barbers").select("*").order("name");
    if (!error) setBarbers(data || []);
  };

  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      alert("Apenas o proprietário pode cadastrar ou editar colaboradores.");
      return;
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("barbers")
        .update({ name, username, role })
        .eq("id", editingId);

      if (error) {
        alert("Erro ao atualizar: " + error.message);
      } else {
        alert("Colaborador atualizado com sucesso!");
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from("barbers").insert([
        {
          id: crypto.randomUUID(),
          name,
          username,
          password,
          role,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        alert("Erro ao cadastrar: " + error.message);
      } else {
        alert("Colaborador cadastrado com sucesso!");
      }
    }

    setName("");
    setUsername("");
    setPassword("");
    setRole("Barbeiro");
    setLoading(false);
    fetchBarbers();
  };

  const handleEdit = (barber: any) => {
    if (!isOwner) {
      alert("Você não tem permissão para editar colaboradores.");
      return;
    }
    setEditingId(barber.id);
    setName(barber.name || "");
    setUsername(barber.username || "");
    setRole(barber.role || "Barbeiro");
  };

  const handleDeleteBarber = async (id: string) => {
    if (!isOwner) {
      alert("Você não tem permissão para excluir colaboradores.");
      return;
    }

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
      {/* Formulário de cadastro/edição (Visível apenas para o OWNER) */}
      {isOwner ? (
        <form onSubmit={handleSaveBarber} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            {editingId ? "Editar Colaborador" : "Novo Colaborador"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Cargo / Função</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder="Ex: Barbeiro"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Usuário de Acesso</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder="usuario.login"
              />
            </div>
            {!editingId && (
              <div>
                <label className="text-xs text-zinc-400">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                  placeholder="********"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setName(""); setUsername(""); }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Colaborador"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-zinc-400 text-xs">
          Modo de visualização: Apenas o proprietário (Léo Porto) pode adicionar ou gerenciar colaboradores.
        </div>
      )}

      {/* Lista de Colaboradores */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Colaboradores Cadastrados
        </h3>
        
        <div className="space-y-3">
          {barbers.map((barber) => (
            <div key={barber.id} className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-lg">
              <div>
                <h4 className="font-bold text-white text-sm">{barber.name}</h4>
                <p className="text-xs text-zinc-500">Cargo: {barber.role} {barber.username ? `• User: ${barber.username}` : ""}</p>
              </div>
              
              {/* Botões de Ação condicionados apenas ao dono */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(barber)} 
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBarber(barber.id)} 
                    className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-900 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}