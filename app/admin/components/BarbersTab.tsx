"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Users, Trash2, Plus } from "lucide-react"

export function BarbersTab() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [name, setName] = useState("")
  const [role, setRole] = useState("Barbeiro")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBarbers()
  }, [])

  const fetchBarbers = async () => {
    const { data } = await supabase.from("barbers").select("*").order("name")
    setBarbers(data || [])
  }

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return alert("Digite o nome do colaborador.")

    setLoading(true)
    const { error } = await supabase.from("barbers").insert([
      {
        id: crypto.randomUUID(),
        name,
        role
      }
    ])

    if (error) {
      alert("Erro ao cadastrar colaborador: " + error.message)
    } else {
      setName("")
      setRole("Barbeiro")
      fetchBarbers()
    }
    setLoading(false)
  }

  const handleDeleteBarber = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este colaborador?")) {
      const { error } = await supabase.from("barbers").delete().eq("id", id)
      if (error) {
        alert("Erro ao excluir: " + error.message)
      } else {
        fetchBarbers()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" /> Gerenciar Colaboradores / Barbeiros
        </h2>
        
        <form onSubmit={handleAddBarber} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do Colaborador (ex: Léo Porto)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
          <input
            type="text"
            placeholder="Cargo (ex: Barbeiro Master)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> {loading ? "Cadastrando..." : "Adicionar Colaborador"}
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Colaboradores Cadastrados</h3>
        
        {barbers.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhum colaborador cadastrado no momento.</p>
        ) : (
          <div className="space-y-3">
            {barbers.map((barber) => (
              <div key={barber.id} className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-lg">
                <div>
                  <h4 className="font-bold text-white text-sm">{barber.name}</h4>
                  <p className="text-xs text-red-500 font-semibold">{barber.role}</p>
                </div>
                <button
                  onClick={() => handleDeleteBarber(barber.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}