"use client"

import React from "react"
import { Scissors, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Service, Barber, BookingData } from "@/types/booking"

const SERVICES: Service[] = [
  { id: "corte", name: "Corte Masculino", price: "R$ 45", duration: "30 min" },
  { id: "barba", name: "Barba Completa", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Combo (Corte + Barba)", price: "R$ 70", duration: "60 min" },
]

interface Step2Props {
  selectedService: Service | null
  onSelectService: (service: Service) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Services({ selectedService, onSelectService, onNext, onBack }: Step2Props) {
  const handleContinue = () => {
    if (!selectedService) {
      alert("Por favor, selecione um serviço.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Scissors className="w-5 h-5 text-red-500" /> Passo 2: Escolha o Serviço
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {SERVICES.map((s) => {
          const isSelected = selectedService?.id === s.id
          return (
            <div
              key={s.id}
              onClick={() => onSelectService(s)}
              className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between ${
                isSelected 
                  ? "bg-red-950/50 border-red-600 text-white shadow-md" 
                  : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <div>
                <p className="font-semibold text-base">{s.name}</p>
                <p className="text-xs text-zinc-400">{s.duration}</p>
              </div>
              <span className="font-bold text-base text-red-500">{s.price}</span>
            </div>
          )
        })}
      </div>

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
          Avançar para Barbeiro <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}