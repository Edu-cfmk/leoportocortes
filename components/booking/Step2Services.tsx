"use client"

import React, { useEffect, useState } from "react"
import { Scissors, ArrowLeft, ArrowRight, Loader2, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Service } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface Step2Props {
  selectedServices: Service[]
  onSelectServices: (services: Service[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Services({ selectedServices, onSelectServices, onNext, onBack }: Step2Props) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase.from("services").select("*")
        if (error) {
          console.error("Erro ao buscar serviços:", error)
        } else if (data) {
          setServices(data)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Alterna a seleção de um serviço (adiciona ou remove do array)
  const toggleService = (s: any, formattedPrice: string) => {
    const serviceObj: Service = {
      id: s.id,
      name: s.name,
      price: formattedPrice,
      duration: s.duration || ""
    }

    const exists = selectedServices.some((item) => item.id === s.id)
    if (exists) {
      onSelectServices(selectedServices.filter((item) => item.id !== s.id))
    } else {
      onSelectServices([...selectedServices, serviceObj])
    }
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      alert("Por favor, selecione pelo menos um serviço.")
      return
    }
    onNext()
  }

  // Converte o valor em centavos (ex: 5000) para formato em Reais (R$ 50,00)
  const formatPriceInCents = (cents: any) => {
    const numCents = Number(cents)
    if (isNaN(numCents) || numCents === 0) return "R$ 0,00"
    const reais = numCents / 100
    return `R$ ${reais.toFixed(2).replace(".", ",")}`
  }

  // Separa os serviços por categoria (se não tiver categoria, joga para cortes como padrão)
  const cortes = services.filter(
    (s) => s.category === "corte" || !s.category
  )
  const adicionais = services.filter(
    (s) => s.category === "adicional"
  )

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Scissors className="w-5 h-5 text-red-500" /> Passo 2: Escolha os Serviços
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">Nenhum serviço cadastrado.</p>
      ) : (
        <div className="space-y-6">
          {/* SEÇÃO 1: CORTES */}
          {cortes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Cortes
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {cortes.map((s) => {
                  const isSelected = selectedServices.some((item) => item.id === s.id)
                  const formattedPrice = formatPriceInCents(s.price_in_cents)

                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s, formattedPrice)}
                      className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                        isSelected 
                          ? "bg-red-950/50 border-red-600 text-white shadow-md" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-base">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-zinc-400">{s.description}</p>
                        )}
                        {s.duration && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-red-500" /> {s.duration}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-red-500 whitespace-nowrap">
                          {formattedPrice}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SEÇÃO 2: SERVIÇOS ADICIONAIS */}
          {adicionais.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Serviços Adicionais
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {adicionais.map((s) => {
                  const isSelected = selectedServices.some((item) => item.id === s.id)
                  const formattedPrice = formatPriceInCents(s.price_in_cents)

                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleService(s, formattedPrice)}
                      className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                        isSelected 
                          ? "bg-red-950/50 border-red-600 text-white shadow-md" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-base">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-zinc-400">{s.description}</p>
                        )}
                        {s.duration && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-red-500" /> {s.duration}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-red-500 whitespace-nowrap">
                          {formattedPrice}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
          Avançar para Barbeiro ({selectedServices.length} selecionado{selectedServices.length === 1 ? '' : 's'}) <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}