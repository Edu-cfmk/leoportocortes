"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step4Props {
  selectedDate: string
  selectedTime: string
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
  onNext: () => void
  onBack: () => void
}

const AVAILABLE_TIMES = [
  "09:00", "09:45", "10:30", "11:15", 
  "13:30", "14:15", "15:00", "15:45", 
  "16:30", "17:15", "18:00", "18:45"
]

export function Step4DateTime({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}: Step4Props) {
  // Define a data mínima como o dia de hoje (formato YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-500 font-semibold">
        <CalendarIcon className="w-5 h-5" />
        <h2 className="text-lg text-white">Passo 4: Data e Horário</h2>
      </div>

      <div className="space-y-4">
        {/* Seletor de Data Visual */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-300">Escolha a Data:</label>
          <div className="relative">
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-red-600 transition-colors cursor-pointer scheme-dark"
            />
          </div>
        </div>

        {/* Grade de Horários */}
        {selectedDate ? (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              Horários disponíveis para {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}:
            </label>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {AVAILABLE_TIMES.map((time) => {
                const isSelected = selectedTime === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      isSelected
                        ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-900/30"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
            Selecione uma data acima para visualizar os horários disponíveis.
          </p>
        )}
      </div>

      {/* Botões de Navegação */}
      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
        >
          Revisar Agendamento <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}