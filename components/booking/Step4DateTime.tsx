"use client"

import React from "react"
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
]

interface Step4Props {
  selectedDate: string
  selectedTime: string
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
  onNext: () => void
  onBack: () => void
}

export function Step4DateTime({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack
}: Step4Props) {

  // Gerar datas para os próximos 7 dias
  const getNextDays = () => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const formatted = d.toISOString().split("T")[0]
      const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
      days.push({ dateStr: formatted, label })
    }
    return days
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert("Por favor, escolha uma data e um horário.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-red-500" /> Passo 4: Data e Horário
      </h3>

      {/* Seleção de Data */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400">Escolha o Dia:</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {getNextDays().map((d) => {
            const isSelected = selectedDate === d.dateStr
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => {
                  onSelectDate(d.dateStr)
                  onSelectTime("") // reseta horário ao trocar o dia
                }}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-red-600 border-red-500 text-white font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Seleção de Horário */}
      {selectedDate ? (
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-red-500" /> Escolha o Horário Disponível:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSelectTime(time)}
                  className={`py-2 rounded-md border text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white border-white text-zinc-950 font-bold"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic">Selecione um dia acima para visualizar os horários.</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2"
        >
          Revisar Agendamento <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}