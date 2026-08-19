"use client"

import React from "react"
import { User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Step1Props {
  name: string
  phone: string
  onChangeName: (val: string) => void
  onChangePhone: (val: string) => void
  onNext: () => void
}

export function Step1UserData({ name, phone, onChangeName, onChangePhone, onNext }: Step1Props) {
  const handleContinue = () => {
    if (!name.trim() || !phone.trim()) {
      alert("Por favor, preencha seu nome e telefone para continuar.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <User className="w-5 h-5 text-red-500" /> Passo 1: Seus Dados
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Nome Completo</label>
          <input
            type="text"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className="w-full h-11 px-3 py-2 text-sm rounded-md bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Telefone / WhatsApp</label>
          <input
            type="tel"
            placeholder="Ex: (19) 99999-9999"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            className="w-full h-11 px-3 py-2 text-sm rounded-md bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      <Button 
        onClick={handleContinue}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4 text-sm flex items-center justify-center gap-2"
      >
        Avançar para Serviços <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}