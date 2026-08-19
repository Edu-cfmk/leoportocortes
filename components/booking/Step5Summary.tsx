"use client"

import React from "react"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Service, Barber, BookingData } from "@/types/booking"

interface Step5Props {
  booking: BookingData
  onFinish: () => void
  onBack: () => void
}

export function Step5Summary({ booking, onFinish, onBack }: Step5Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFinish()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-red-500" /> Passo 5: Confirmação
      </h3>

      <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2 text-sm">
        <p className="flex justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-zinc-400">Cliente:</span>
          <span className="font-semibold text-white">{booking.clientName}</span>
        </p>
        <p className="flex justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-zinc-400">Telefone:</span>
          <span className="font-semibold text-white">{booking.clientPhone}</span>
        </p>
        <p className="flex justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-zinc-400">Serviço:</span>
          <span className="font-semibold text-white">{booking.service?.name} ({booking.service?.price})</span>
        </p>
        <p className="flex justify-between border-b border-zinc-800 pb-1.5">
          <span className="text-zinc-400">Barbeiro:</span>
          <span className="font-semibold text-white">{booking.barber?.name}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-zinc-400">Data e Horário:</span>
          <span className="font-semibold text-white">
            {booking.date ? new Date(booking.date + "T00:00:00").toLocaleDateString("pt-BR") : ""} às {booking.time}
          </span>
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          type="button"
          variant="outline" 
          onClick={onBack}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-sm"
        >
          Finalizar Agendamento
        </Button>
      </div>
    </form>
  )
}