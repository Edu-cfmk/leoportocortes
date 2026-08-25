"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Edit2 } from "lucide-react";

export function BarbersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Barbeiro");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Pega o usuário logado da sessão do admin
  const sessionData = typeof window !== "undefined" ? localStorage.getItem("admin_session") : null;
  const session = sessionData ? JSON.parse(sessionData) : null;
  
  // Verifica se quem está logado é VOCÊ (o desenvolvedor principal)
  // Altere "EduardoDev" para exatamente o nome de usuário que você usa para logar
  const isSupremeDev = session?.role === "DEV" || session?.username === "EduardoDev";
  
  // Outros cargos administrativos (como ADM do Léo) têm acesso aos botões, mas não são o DEV supremo
  const hasFullAccess = session?.role === "ADM" || session?.role === "DEV";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("admin_users").select("*").order("username");
    if (!error) setUsers(data || []);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFullAccess) {
      alert("Você não tem permissão para esta ação.");
      return;
    }

    setLoading(true);

    const payload: any = {
      username,
      role,
    };

    if (password) {
      payload.password = password;
    }

    if (editingId) {
      const { error } = await supabase
        .from("admin_users")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        alert("Erro ao atualizar: " + error.message);
      } else {
        alert("Acesso atualizado com sucesso!");
        setEditingId(null);
      }
    } else {
      payload.id = crypto.randomUUID();
      
      const { error } = await supabase.from("admin_users").insert([payload]);

      if (error) {
        alert("Erro ao criar usuário: " + error.message);
      } else {
        alert("Usuário e acesso criados com sucesso!");
      }
    }

    setUsername("");
    setPassword("");
    setRole("Barbeiro");
    setLoading(false);
    fetchUsers();
  };

  const handleEdit = (user: any) => {
    if (!hasFullAccess) {
      alert("Você não tem permissão para editar usuários.");
      return;
    }
    setEditingId(user.id);
    setUsername(user.username || "");
    setPassword(""); 
    setRole(user.role || "Barbeiro");
  };

  const handleDeleteUser = async (id: string, userRole: string) => {
    if (!hasFullAccess) {
      alert("Você não tem permissão para excluir usuários.");
      return;
    }

    if (userRole === "DEV") {
      alert("Não é possível excluir o usuário de desenvolvimento.");
      return;
    }

    if (confirm("Tem certeza que deseja excluir o acesso deste usuário?")) {
      const { error } = await supabase.from("admin_users").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchUsers();
      }
    }
  };

  // FILTRAGEM RESTRITA:
  // Se quem estiver logado for VOCÊ (isSupremeDev), você vê tudo.
  // Se for QUALQUER OUTRA PESSOA (mesmo o Léo que é ADM, Barbeiro, Recepcionista, etc.), 
  // o sistema esconde permanentemente o seu usuário (cargo DEV ou nome EduardoDev).
  const filteredUsers = users.filter((user) => {
    if (isSupremeDev) return true;

    const nameLower = user.username.toLowerCase();
    const roleUpper = user.role.toUpperCase();

    // Esconde o seu usuário supremo de qualquer outra visão
    if (roleUpper === "DEV" || nameLower.includes("eduardodev")) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {hasFullAccess ? (
        <form onSubmit={handleSaveUser} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            {editingId ? "Editar Acesso do Colaborador" : "Criar Novo Acesso (Colaborador / ADM)"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400">Nome de Usuário (Login)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder="Ex: gabriel"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder={editingId ? "Deixe em branco para manter" : "********"}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Cargo / Função (Texto livre)</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm mt-1"
                placeholder="Ex: Barbeiro"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setUsername(""); setPassword(""); }}
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
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Acesso"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-zinc-400 text-xs">
          Modo de visualização. Apenas administradores podem gerenciar acessos.
        </div>
      )}

      {/* Lista de Usuários do Painel */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Usuários com Acesso ao Painel
        </h3>
        
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-lg">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  {user.username}
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">
                    {user.role}
                  </span>
                </h4>
              </div>
              
              {hasFullAccess && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(user)} 
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors flex items-center gap-1 text-xs px-3"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  {user.role !== "DEV" && (
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.role)} 
                      className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-900 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}