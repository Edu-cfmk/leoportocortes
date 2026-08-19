"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, ShieldCheck, Code2, Mail, Calendar as CalendarIcon, Clock, CheckCircle2, User, Scissors } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"

interface Service {
  id: string
  name: string
  price: string
  duration: string
}

const SERVICES: Service[] = [
  { id: "corte", name: "Corte Masculino", price: "R$ 45", duration: "30 min" },
  { id: "barba", name: "Barba Completa", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Combo (Corte + Barba)", price: "R$ 70", duration: "60 min" },
]

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
]

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

  // Estados do formulário de agendamento
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [clientName, setClientName] = useState<string>("")
  const [clientPhone, setClientPhone] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCutIndex((prevIndex) => (prevIndex + 1) % cuts.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [cuts.length])

  // Gerar datas para os próximos 7 dias
  const getNextDays = () => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const formatted = d.toISOString().split("T")[0]
      const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
      days.push({ dateStr: formatted, label })
    }
    return days
  }

  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert("Por favor, preencha todos os campos do agendamento.")
      return
    }

    setIsSubmitted(true)
  }

  const scrollToBooking = () => {
    const el = document.getElementById("agendamento")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans tracking-tight antialiased pb-10">
      {/* Hero Header com Logo */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="mx-auto w-full max-w-[280px] h-28 rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center shadow-md">
            <img 
              src="/logo.jpg" 
              alt="Léo Porto Cortes Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Léo Porto Cortes</h1>
          <p className="text-sm text-zinc-400 flex items-center justify-center gap-1 font-medium">
            <MapPin className="w-4 h-4 text-zinc-400" /> Barbearia & Estilo
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" onClick={scrollToBooking} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
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
              <a href="https://www.instagram.com/leoportocortes?igsh=MWY5ZHFvbGF2NWQ1bg==" target="_blank" rel="noreferrer" className="flex-1">
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
              <p>Corte: R$ 45 — Barba: R$ 35</p>
              <p>Combo: R$ 70</p>
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
            alt={`Corte Léo Porto Cortes ${currentCutIndex + 1}`}
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

      {/* Sessão de Agendamento */}
      <section id="agendamento" className="max-w-xl mx-auto px-4 mt-12 space-y-6">
        <div className="text-left space-y-1 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-red-500" /> Agende seu Horário
          </h2>
          <p className="text-sm text-zinc-400">
            Escolha o serviço, a data e o horário de sua preferência.
          </p>
        </div>

        {isSubmitted ? (
          <Card className="bg-zinc-900 border-emerald-800/50 text-zinc-100 p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Agendamento Realizado com Sucesso!</h3>
            <p className="text-sm text-zinc-400">
              Obrigado, <strong className="text-white">{clientName}</strong>! Seu horário para <strong className="text-white">{selectedService?.name}</strong> no dia <strong className="text-white">{new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}</strong> às <strong className="text-white">{selectedTime}</strong> foi gravado.
            </p>
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSubmitted(false)
                  setSelectedService(null)
                  setSelectedDate("")
                  setSelectedTime("")
                  setClientName("")
                  setClientPhone("")
                }}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Fazer outro agendamento
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleBooking} className="space-y-6">
            {/* 1. Escolher Serviço */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                <span>1. Escolha o Serviço</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SERVICES.map((s) => {
                  const isSelected = selectedService?.id === s.id
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`cursor-pointer p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "bg-red-950/40 border-red-600 text-white shadow-md" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-zinc-400">{s.duration}</p>
                      </div>
                      <span className="font-bold text-sm text-red-500 mt-2">{s.price}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Selecionar Data */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-zinc-400" />
                <span>2. Selecione a Data</span>
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {getNextDays().map((d) => {
                  const isSelected = selectedDate === d.dateStr
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-red-600 border-red-500 text-white font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Selecionar Horário */}
            {selectedDate && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>3. Escolha o Horário</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-md border text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-zinc-100 border-white text-zinc-950 font-bold"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. Preencher Dados do Cliente */}
            {selectedTime && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>4. Seus Dados</span>
                </label>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-zinc-400 mb-1 block">Nome Completo</span>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={clientName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
                      required
                      className="w-full h-10 px-3 py-2 text-sm rounded-md bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 mb-1 block">Telefone / WhatsApp</span>
                    <input
                      type="tel"
                      placeholder="Ex: (19) 99999-9999"
                      value={clientPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientPhone(e.target.value)}
                      required
                      className="w-full h-10 px-3 py-2 text-sm rounded-md bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4 text-sm"
                >
                  Finalizar Agendamento
                </Button>
              </div>
            )}
          </form>
        )}
      </section>

      {/* Botão para Área ADM */}
      <div className="max-w-4xl mx-auto px-4 mt-12 flex justify-center">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Acessar Área ADM
          </Button>
        </Link>
      </div>

      {/* Rodapé Dividido */}
      <footer className="max-w-4xl mx-auto px-4 mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <p className="flex items-center justify-center md:justify-start gap-1.5">
            <Phone className="w-3.5 h-3.5 text-zinc-400" /> (19) 99139-9801
          </p>
          <p>© 2026 Léo Porto Cortes. Todos os direitos reservados.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 text-zinc-400 font-medium text-center md:text-right">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-blue-500" />
            <span>Desenvolvido por Eduardo</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <a 
              href="https://wa.me/5519971288325" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
              title="WhatsApp do Desenvolvedor: (19) 97128-8325"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
            </a>
            <a 
              href="mailto:adu.carvalho321@gmail.com" 
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
              title="E-mail do Desenvolvedor: adu.carvalho321@gmail.com"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}