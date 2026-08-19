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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCutIndex((prevIndex) => (prevIndex + 1) % cuts.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [cuts.length])

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans tracking-tight antialiased pb-10">
      {/* Hero Header com Logo Retangular / Horizontal */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="mx-auto w-full max-w-[280px] h-28 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center shadow-md">
            <img 
              src="/logo.jpg" 
              alt="Léo Porto Cortês Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Léo Porto Cortês</h1>
          <p className="text-sm text-zinc-400 flex items-center justify-center gap-1 font-medium">
            <MapPin className="w-4 h-4 text-zinc-400" /> Barbearia & Estilo
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

      {/* Cartões de Informações */}
      <section className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-100 tracking-tight">Quem Somos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-normal">
              Profissionais especializados em cortes masculinos e estilos de barba. Ambiente aconchegante com atendimento personalizado.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-lg text-zinc-100 tracking-tight">Redes Sociais</h3>
            <p className="text-sm text-zinc-400 font-normal">Siga nosso perfil para ver cortes e inspiração.</p>
            <div className="flex gap-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex-1">
                <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2 text-xs font-semibold">
                  <FaInstagram className="w-4 h-4" /> Instagram
                </Button>
              </a>
              <a href="https://wa.me/5519991399801" target="_blank" rel="noreferrer" className="flex-1">
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold">
                  <FaWhatsapp className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-100 tracking-tight">Preço Médio</h3>
            <div className="text-sm text-zinc-400 space-y-1 font-normal">
              <p>Corte: R$ 45 — Barba: R$ 35 — Combo: R$ 70</p>
              <p>Pezinho / Sobrancelha: R$ 20</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Carrossel de Cortes */}
      <section className="max-w-md mx-auto px-4 mt-10 text-center space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">Nossos Cortes</h2>
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-lg">
          <img 
            src={cuts[currentCutIndex]} 
            alt={`Corte Léo Porto Cortês ${currentCutIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {cuts.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all ${idx === currentCutIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Agende seu horário */}
      <section className="max-w-md mx-auto px-4 mt-10 text-left space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">Agende seu horário</h2>
        <p className="text-sm text-zinc-400 leading-relaxed font-normal">
          Escolha o melhor horário para você. Preencha seu nome e telefone ao agendar.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-zinc-500 space-y-2 border-t border-zinc-800 pt-6">
        <p className="flex items-center justify-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-zinc-400" /> (19) 99139-9801
        </p>
        <p>© 2026 Léo Porto Cortês. Todos os direitos reservados.</p>
      </footer>
    </main>
  )
}