"use client"

import React, { useEffect, useState } from "react"
import { Scissors, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Service } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface Step2Props {
  selectedService: Service | null
  onSelectService: (service: Service) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Services({ selectedService, onSelectService, onNext, onBack }: Step2Props) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase.from("services").select("*")
        if (error) {
          console.error("Erro ao buscar serviços:", error)
        } else if (data) {
          const formattedServices: Service[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: typeof item.price === "number" ? `R$ ${item.price}` : item.price,
            duration: "", // Removido o tempo
          }))
          setServices(formattedServices)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">Nenhum serviço cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {services.map((s) => {
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
                </div>
                <span className="font-bold text-base text-red-500">{s.price}</span>
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
          Avançar para Barbeiro <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}