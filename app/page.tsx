"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"

export default function Home() {
  const cuts = [
    "/cuts/corte1.jpg",
    "/cuts/corte2.jpg",
    "/cuts/corte3.jpg",
    "/cuts/corte4.jpg",
    "/cuts/corte5.jpg",
    "/cuts/corte6.jpg",
    "/cuts/corte7.jpg",
    "/cuts/corte8.jpg",
    "/cuts/corte9.jpg",
  ]

  const [currentCutIndex, setCurrentCutIndex] = useState(0)

  // Carrossel trocando automaticamente a cada 2 segundos (2000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCutIndex((prevIndex) => (prevIndex + 1) % cuts.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [cuts.length])

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-10">
      {/* 1. Hero Header com Logo do Léo */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500 bg-white flex items-center justify-center p-1 shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Léo Porto Cortês Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Léo Porto Cortês</h1>
          <p className="text-sm text-zinc-400 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4 text-amber-500" /> Barbearia & Estilo
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              Agendar Agora
            </Button>
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Baixar App (Android)
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Seção de Cartões de Info */}
      <section className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cartão Quem Somos */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-200">Quem Somos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Profissionais especializados em cortes masculinos e estilos de barba. Ambiente aconchegante com atendimento personalizado.
            </p>
          </CardContent>
        </Card>

        {/* Cartão Redes Sociais com Ícones Oficiais */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-lg text-zinc-200">Redes Sociais</h3>
            <p className="text-sm text-zinc-400">Siga nosso perfil para ver cortes e inspiração.</p>
            <div className="flex gap-2">
              <a 
                href="https://www.instagram.com/leoportocortes?igsh=MWY5ZHFvbGF2NWQ1bg==" 
                target="_blank" 
                rel="noreferrer"
                className="flex-1"
              >
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 text-xs font-semibold">
                  <FaInstagram className="w-4 h-4" /> Instagram
                </Button>
              </a>
              <a 
                href="https://wa.me/5519991399801" 
                target="_blank" 
                rel="noreferrer"
                className="flex-1"
              >
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-xs font-semibold">
                  <FaWhatsapp className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Cartão Preço Médio */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-200">Preço Médio</h3>
            <div className="text-sm text-zinc-400 space-y-1">
              <p>Corte: R$ 45 — Barba: R$ 35 — Combo: R$ 70</p>
              <p>Pezinho / Sobrancelha: R$ 20</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Carrossel Automático de Cortes */}
      <section className="max-w-md mx-auto px-4 mt-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">Nossos Cortes</h2>
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-zinc-800 bg-zinc-900 shadow-xl">
          <img 
            src={cuts[currentCutIndex]} 
            alt={`Corte ${currentCutIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
          />
          {/* Indicador de posição das fotos */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {cuts.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all ${idx === currentCutIndex ? 'bg-amber-500 w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Seção Agende seu horário */}
      <section className="max-w-md mx-auto px-4 mt-10 text-left space-y-2">
        <h2 className="text-xl font-bold text-zinc-100">Agende seu horário</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Escolha o melhor horário para você. Preencha seu nome e telefone ao agendar.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-zinc-600 space-y-2 border-t border-zinc-800 pt-6">
        <p className="flex items-center justify-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-amber-600" /> (19) 99139-9801
        </p>
        <p>© 2026 Léo Porto Cortes. Todos os direitos reservados.</p>
      </footer>
    </main>
  )
}