"use client"

import React, { useEffect, useState } from "react"
import { User, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Barber } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface Step3Props {
  selectedBarber: Barber | null
  onSelectBarber: (barber: Barber) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Barbers({ selectedBarber, onSelectBarber, onNext, onBack }: Step3Props) {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const { data, error } = await supabase.from("barbers").select("*")
        if (error) {
          console.error("Erro ao buscar barbeiros:", error)
        } else if (data) {
          const fetchedBarbers: Barber[] = data.map((item: any) => {
            // Se o cargo for ADM/Admin, força para "Barbeiro" na visão do cliente
            let role = item.role || "Barbeiro"
            if (role.toLowerCase() === "adm" || role.toLowerCase() === "admin") {
              role = "Barbeiro"
            }

            return {
              id: item.id,
              name: item.name,
              role: role,
            }
          })

          setBarbers(fetchedBarbers)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBarbers()
  }, [])

  const handleContinue = () => {
    if (!selectedBarber) {
      alert("Por favor, selecione um barbeiro.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <User className="w-5 h-5 text-red-500" /> Passo 3: Escolha o Barbeiro
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : barbers.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">Nenhum barbeiro cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {barbers.map((b) => {
            const isSelected = selectedBarber?.id === b.id
            return (
              <div
                key={b.id}
                onClick={() => onSelectBarber(b)}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between ${
                  isSelected 
                    ? "bg-red-950/50 border-red-600 text-white shadow-md" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div>
                  <p className="font-semibold text-base">{b.name}</p>
                  <p className="text-xs text-zinc-400">{b.role}</p>
                </div>
              </div>
            )
          })}
        </div>
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
          Avançar para Data e Horário <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}