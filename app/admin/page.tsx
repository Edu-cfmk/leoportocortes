"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Scissors, LogOut, Home, Calendar, Wrench, Users, Clock } from "lucide-react"

import { AdminLogin } from "./components/AdminLogin"
import { BookingsTab } from "./components/BookingsTab"
import { ServicesTab } from "./components/ServicesTab"
import { SettingsTab } from "./components/SettingsTab"

export default function AdminPage() {
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Aba Ativa
  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "settings">("bookings")

  // Agendamentos
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")

  // Serviços
  const [services, setServices] = useState<any[]>([])
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")

  // Horários / Configurações
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("19:00")
  const [lunchStart, setLunchStart] = useState("12:00")
  const [lunchEnd, setLunchEnd] = useState("13:00")

  useEffect(() => {
    const local = localStorage.getItem("admin_session")
    if (local) {
      try { setSession(JSON.parse(local)) } catch (e) { localStorage.removeItem("admin_session") }
    }
  }, [])

  useEffect(() => {
    if (session) {
      if (activeTab === "bookings") fetchBookings()
      if (activeTab === "services") fetchServices()
      if (activeTab === "settings") fetchSettings()
    }
  }, [session, selectedDate, activeTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", loginUsername)
      .eq("password", loginPassword)
      .maybeSingle()

    if (error || !data) {
      alert("Usuário ou senha incorretos.")
      setLoginLoading(false)
      return
    }

    const userSession = { username: data.username, role: data.role }
    localStorage.setItem("admin_session", JSON.stringify(userSession))
    setSession(userSession)
    setLoginLoading(false)
  }

  const fetchBookings = async () => {
    setLoading(true)
    let query = supabase.from("bookings").select("*")

    if (selectedDate) {
      query = query.eq("booking_date", selectedDate).order("booking_time", { ascending: true })
    } else {
      query = query.order("booking_date", { ascending: true }).order("booking_time", { ascending: true })
    }

    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id)
    fetchBookings()
  }

  // Serviços (Corrigido para enviar priceInCents conforme a tabela do Supabase)
  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("name")
    setServices(data || [])
  }

  const handleAddService = async () => {
    if (!newServiceName || !newServicePrice) return alert("Preencha o nome e preço do serviço.")
    
    const numericPrice = Number(newServicePrice.replace(/\D/g, "")) || 0

    const { error } = await supabase.from("services").insert([
      { 
        name: newServiceName, 
        priceInCents: numericPrice 
      }
    ])

    if (error) {
      alert("Erro ao cadastrar: " + error.message)
      return
    }

    setNewServiceName("")
    setNewServicePrice("")
    fetchServices()
  }

  const handleDeleteService = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const { error } = await supabase.from("services").delete().eq("id", id)
      if (error) {
        alert("Erro ao excluir: " + error.message)
        return
      }
      fetchServices()
    }
  }

  // Configurações de Horário
  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle()
    if (data) {
      setOpenTime(data.open_time || "08:00")
      setCloseTime(data.close_time || "19:00")
      setLunchStart(data.lunch_start || "12:00")
      setLunchEnd(data.lunch_end || "13:00")
    }
  }

  const handleSaveSettings = async () => {
    const { data } = await supabase.from("settings").select("id").limit(1).maybeSingle()
    if (data?.id) {
      await supabase.from("settings").update({
        open_time: openTime,
        close_time: closeTime,
        lunch_start: lunchStart,
        lunch_end: lunchEnd
      }).eq("id", data.id)
    } else {
      await supabase.from("settings").insert([{
        open_time: openTime,
        close_time: closeTime,
        lunch_start: lunchStart,
        lunch_end: lunchEnd
      }])
    }
    alert("Horários salvos com sucesso!")
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    setSession(null)
  }

  if (!session) {
    return (
      <AdminLogin
        loginUsername={loginUsername} setLoginUsername={setLoginUsername}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        loginLoading={loginLoading} handleLogin={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <Scissors className="w-6 h-6" /> Painel ADM
            </h1>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
              Logado como: <span className="text-white font-semibold">{session.username}</span> 
              <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800 text-[10px] font-bold">
                {session.role}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors">
              <Home className="w-3.5 h-3.5 text-red-500" /> Ir para o Início
            </Link>
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>

        {/* Menu de Abas */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "bookings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Agendamentos
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "services" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4" /> Serviços
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "settings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" /> Horários
          </button>
        </div>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === "bookings" && (
          <BookingsTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            fetchBookings={fetchBookings}
            loading={loading}
            bookings={bookings}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === "services" && (
          <ServicesTab
            services={services}
            newServiceName={newServiceName}
            setNewServiceName={setNewServiceName}
            newServicePrice={newServicePrice}
            setNewServicePrice={setNewServicePrice}
            handleAddService={handleAddService}
            handleDeleteService={handleDeleteService}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            openTime={openTime}
            setOpenTime={setOpenTime}
            closeTime={closeTime}
            setCloseTime={setCloseTime}
            lunchStart={lunchStart}
            setLunchStart={setLunchStart}
            lunchEnd={lunchEnd}
            setLunchEnd={setLunchEnd}
            handleSaveSettings={handleSaveSettings}
          />
        )}
      </div>
    </div>
  )
}