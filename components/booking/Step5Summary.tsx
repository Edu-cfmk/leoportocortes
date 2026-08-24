"use client";

import { useState } from "react";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingData } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Step5Props {
  booking: BookingData;
  onFinish: () => void;
  onBack: () => void;
}

export function Step5Summary({ booking, onFinish, onBack }: Step5Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const serviceDuration = booking.service?.duration;

      if (!serviceDuration) {
        alert(
          "Não foi possível identificar a duração do serviço. Volte e selecione o serviço novamente."
        );
        return;
      }

      if (!booking.barber?.name) {
        alert(
          "Não foi possível identificar o profissional. Volte e selecione o profissional novamente."
        );
        return;
      }

      if (!booking.date || !booking.time) {
        alert("Selecione a data e o horário antes de confirmar.");
        return;
      }

      const { error } = await supabase.from("bookings").insert([
        {
          client_name: booking.clientName,
          client_phone: booking.clientPhone,
          service_name: booking.service?.name,
          service_price: booking.service?.price,
          service_duration: serviceDuration,
          barber_name: booking.barber.name,
          booking_date: booking.date,
          booking_time: booking.time,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        alert("Ocorreu um erro ao salvar o agendamento. Tente novamente.");
        return;
      }

      onFinish();
    } catch (err) {
      console.error("Erro inesperado ao processar agendamento:", err);
      alert("Erro inesperado ao processar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-500 font-semibold">
        <Check className="w-5 h-5" />
        <h2 className="text-lg text-white">Passo 5: Revisão do Agendamento</h2>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-sm text-zinc-300">
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Cliente:</span>
          <span className="font-medium text-white">{booking.clientName}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Telefone:</span>
          <span className="font-medium text-white">{booking.clientPhone}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Serviço:</span>
          <span className="font-medium text-white">{booking.service?.name}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Valor:</span>
          <span className="font-medium text-white">R$ {booking.service?.price}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Profissional:</span>
          <span className="font-medium text-white">{booking.barber?.name}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-900 pb-2">
          <span className="text-zinc-500">Data:</span>
          <span className="font-medium text-white">
            {booking.date ? new Date(`${booking.date}T00:00:00`).toLocaleDateString("pt-BR") : ""}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Horário:</span>
          <span className="font-medium text-red-400">{booking.time}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Confirmar Agendamento"
          )}
        </Button>
      </div>
    </div>
  );
}