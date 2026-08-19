"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, ShieldCheck, Code2, Mail, CheckCircle2, Scissors } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"

import { BookingData } from "@/types/booking"
import { Step1UserData } from "@/components/booking/Step1UserData"
import { Step2Services } from "@/components/booking/Step2Services"
import { Step3Barbers } from "@/components/booking/Step3Barbers"
import { Step4DateTime } from "@/components/booking/Step4DateTime"
import { Step5Summary } from "@/components/booking/Step5Summary"
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
  const [step, setStep] = useState<number>(1)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  // Estado unificado do agendamento
  const [booking, setBooking] = useState<BookingData>({
    clientName: "",
    clientPhone: "",
    service: null,
    barber: null,
    date: "",
    time: "",
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCutIndex((prevIndex) => (prevIndex + 1) % cuts.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [cuts.length])

  const scrollToBooking = () => {
    const el = document.getElementById("agendamento")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setStep(1)
    setBooking({
      clientName: "",
      clientPhone: "",
      service: null,
      barber: null,
      date: "",
      time: "",
    })
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
        <div className="text-left space-y-1 border-b border-zinc-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-red-500" /> Agendar Horário
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Etapa {step} de 5</p>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-6 bg-red-600" : i < step ? "w-2 bg-zinc-600" : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {isSubmitted ? (
          <Card className="bg-zinc-900 border-emerald-800/50 text-zinc-100 p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Agendamento Realizado com Sucesso!</h3>
            <div className="text-sm text-zinc-300 bg-zinc-950/60 p-4 rounded-lg space-y-2 border border-zinc-800 text-left">
              <p><strong className="text-zinc-100">Cliente:</strong> {booking.clientName}</p>
              <p><strong className="text-zinc-100">Telefone:</strong> {booking.clientPhone}</p>
              <p><strong className="text-zinc-100">Serviço:</strong> {booking.service?.name} ({booking.service?.price})</p>
              <p><strong className="text-zinc-100">Barbeiro:</strong> {booking.barber?.name}</p>
              <p><strong className="text-zinc-100">Data:</strong> {booking.date ? new Date(booking.date + "T00:00:00").toLocaleDateString("pt-BR") : ""}</p>
              <p><strong className="text-zinc-100">Horário:</strong> {booking.time}</p>
            </div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Fazer outro agendamento
              </Button>
            </div>
          </Card>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
            {step === 1 && (
              <Step1UserData
                name={booking.clientName}
                phone={booking.clientPhone}
                onChangeName={(val) => setBooking((prev) => ({ ...prev, clientName: val }))}
                onChangePhone={(val) => setBooking((prev) => ({ ...prev, clientPhone: val }))}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2Services
                selectedService={booking.service}
                onSelectService={(val) => setBooking((prev) => ({ ...prev, service: val }))}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3Barbers
                selectedBarber={booking.barber}
                onSelectBarber={(val) => setBooking((prev) => ({ ...prev, barber: val }))}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4DateTime
                selectedDate={booking.date}
                selectedTime={booking.time}
                onSelectDate={(val) => setBooking((prev) => ({ ...prev, date: val }))}
                onSelectTime={(val) => setBooking((prev) => ({ ...prev, time: val }))}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <Step5Summary
                booking={booking}
                onFinish={() => setIsSubmitted(true)}
                onBack={() => setStep(4)}
              />
            )}
          </div>
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