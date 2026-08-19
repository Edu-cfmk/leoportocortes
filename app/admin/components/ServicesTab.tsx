"use client"

import { Plus, Trash2 } from "lucide-react"

interface ServicesTabProps {
  services: any[]
  newServiceName: string
  setNewServiceName: (v: string) => void
  newServicePrice: string
  setNewServicePrice: (v: string) => void
  handleAddService: () => void
  handleDeleteService: (id: string) => void
}

export function ServicesTab({
  services,
  newServiceName, setNewServiceName,
  newServicePrice, setNewServicePrice,
  handleAddService, handleDeleteService
}: ServicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-red-500" /> Adicionar Novo Serviço
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nome do Serviço"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Preço (ex: R$ 45,00)"
            value={newServicePrice}
            onChange={(e) => setNewServicePrice(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
          <button
            onClick={handleAddService}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-xs transition-colors"
          >
            Cadastrar Serviço
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {(services || []).map((s) => (
          <div key={s.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white">{s.name}</p>
              <p className="text-xs text-zinc-400">{s.price}</p>
            </div>
            <button onClick={() => handleDeleteService(s.id)} className="text-zinc-500 hover:text-red-500 p-1 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}