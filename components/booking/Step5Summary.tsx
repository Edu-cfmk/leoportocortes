"use client"

import React, { useState } from "react"
import { ArrowLeft, Check, Calendar, Clock, User, Scissors, DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingData } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface Step5Props {
  booking: BookingData
  onFinish: () => void
  onBack: () => void
}

export function Step5Summary({ booking, onFinish, onBack }: Step5Props) {
  const [loading, setLoading] = useState(false)

 // Função para calcular o preço total somando os serviços selecionados
  const calculateTotal = () => {
    let totalCents = 0;
    booking.services.forEach((s) => {
      if (s.price_in_cents) {
        totalCents += s.price_in_cents;
      } else if (typeof s.price === "number") {
        totalCents += s.price * 100;
      } else if (typeof s.price === "string") {
        const cleanPrice = s.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.');
        const num = parseFloat(cleanPrice);
        if (!isNaN(num)) totalCents += num * 100;
      }
    });
    return `R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}`;
  };

  const handleConfirmBooking = async () => {
    setLoading(true)
    try {
      // Exemplo de salvamento no Supabase (ajuste conforme a estrutura da sua tabela de agendamentos)
      const { error } = await supabase.from("appointments").insert([
        {
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          barber_id: booking.barber?.id,
          barber_name: booking.barber?.name,
          date: booking.date,
          time: booking.time,
          services: booking.services, // Salva o array de serviços
          total_price: calculateTotal(),
        }
      ])

      if (error) {
        console.error("Erro ao salvar agendamento:", error)
        alert("Erro ao realizar agendamento. Tente novamente.")
      } else {
        onFinish()
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      alert("Erro inesperado ao salvar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Check className="w-5 h-5 text-red-500" /> Passo 5: Resumo do Agendamento
      </h3>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
        {/* Cliente */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400">Cliente</p>
            <p className="font-semibold text-white">{booking.clientName}</p>
            <p className="text-xs text-zinc-400">{booking.clientPhone}</p>
          </div>
        </div>

        <hr className="border-zinc-800" />

        {/* Serviços */}
        <div className="flex items-start gap-3">
          <Scissors className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-zinc-400">Serviço(s) Escolhido(s)</p>
            <div className="space-y-1 mt-1">
              {booking.services.map((s, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-white font-medium">{s.name}</span>
                  <span className="text-red-400 font-semibold">{s.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-900 text-sm">
              <span className="font-bold text-zinc-300">Total</span>
              <span className="font-bold text-red-500 text-base">{calculateTotal()}</span>
            </div>
          </div>
        </div>

        <hr className="border-zinc-800" />

        {/* Barbeiro */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400">Barbeiro</p>
            <p className="font-semibold text-white">{booking.barber?.name || "Qualquer profissional"}</p>
          </div>
        </div>

        <hr className="border-zinc-800" />

        {/* Data e Hora */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400">Data e Horário</p>
            <p className="font-semibold text-white flex items-center gap-2 mt-0.5">
              <span>{booking.date ? new Date(booking.date + "T00:00:00").toLocaleDateString("pt-BR") : ""}</span>
              <span className="text-zinc-500">|</span>
              <span className="flex items-center gap-1 text-red-400">
                <Clock className="w-3.5 h-3.5" /> {booking.time}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={loading}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button 
          onClick={handleConfirmBooking}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Agendamento"}
        </Button>
      </div>
    </div>
  )
}