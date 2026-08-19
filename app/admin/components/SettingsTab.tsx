"use client"

import { Settings } from "lucide-react"

interface SettingsTabProps {
  openTime: string
  setOpenTime: (v: string) => void
  closeTime: string
  setCloseTime: (v: string) => void
  lunchStart: string
  setLunchStart: (v: string) => void
  lunchEnd: string
  setLunchEnd: (v: string) => void
  handleSaveSettings: () => void
}

export function SettingsTab({
  openTime, setOpenTime,
  closeTime, setCloseTime,
  lunchStart, setLunchStart,
  lunchEnd, setLunchEnd,
  handleSaveSettings
}: SettingsTabProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Settings className="w-4 h-4 text-red-500" /> Horários de Funcionamento e Almoço
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] text-zinc-400">Abertura</label>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400">Fechamento</label>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400">Início Almoço</label>
          <input
            type="time"
            value={lunchStart}
            onChange={(e) => setLunchStart(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
        </div>
        <div>
          <label className="text-[11px] text-zinc-400">Fim Almoço</label>
          <input
            type="time"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
          />
        </div>
      </div>
      <button
        onClick={handleSaveSettings}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs transition-colors"
      >
        Salvar Horários
      </button>
    </div>
  )
}