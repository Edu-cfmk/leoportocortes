"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Calendar, Clock, Phone, User, Scissors, CheckCircle, XCircle, RefreshCw, Trash2,
  LogOut, Settings, Plus, MessageCircle, Clock3, Lock, Loader2
} from "lucide-react"

export default function AdminPage() {
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<"dashboard" | "services" | "barbers" | "settings">("dashboard")
  
  const [bookings, setBookings] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0])

  // Form de novos cadastros
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")
  const [newServiceDuration, setNewServiceDuration] = useState("")
  const [newBarberName, setNewBarberName] = useState("")

  // Horários de Funcionamento
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("19:00")
  const [lunchStart, setLunchStart] = useState("12:00")
  const [lunchEnd, setLunchEnd] = useState("13:00")

  useEffect(() => {
    const local = localStorage.getItem("admin_session")
    if (local) {
      try {
        setSession(JSON.parse(local))
      } catch (e) {
        localStorage.removeItem("admin_session")
      }
    }
  }, [])

  useEffect(() => {
    if (session) {
      loadAllData()
    }
  }, [session, selectedDate])

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

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([fetchBookings(), fetchServices(), fetchBarbers(), fetchSettings()])
    setLoading(false)
  }

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", selectedDate)
      .order("booking_time", { ascending: true })
    setBookings(data || [])
  }

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: true })
    setServices(data || [])
  }

  const fetchBarbers = async () => {
    const { data } = await supabase.from("barbers").select("*").order("created_at", { ascending: true })
    setBarbers(data || [])
  }

  const fetchSettings = async () => {
    const { data } = await supabase.from("business_settings").select("*").maybeSingle()
    if (data) {
      setOpenTime(data.open_time || "08:00")
      setCloseTime(data.close_time || "19:00")
      setLunchStart(data.lunch_start || "12:00")
      setLunchEnd(data.lunch_end || "13:00")
    }
  }

  const handleSaveSettings = async () => {
    const { data } = await supabase.from("business_settings").select("id").limit(1)
    if (data && data.length > 0) {
      await supabase.from("business_settings").update({ open_time: openTime, close_time: closeTime, lunch_start: lunchStart, lunch_end: lunchEnd }).eq("id", data[0].id)
    } else {
      await supabase.from("business_settings").insert([{ open_time: openTime, close_time: closeTime, lunch_start: lunchStart, lunch_end: lunchEnd }])
    }
    alert("Horários salvos com sucesso!")
  }

  const handleAddService = async () => {
    if (!newServiceName || !newServicePrice) return
    await supabase.from("services").insert([{ name: newServiceName, price: newServicePrice, duration: newServiceDuration || "30m" }])
    setNewServiceName("")
    setNewServicePrice("")
    setNewServiceDuration("")
    fetchServices()
  }

  const handleDeleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id)
    fetchServices()
  }

  const handleAddBarber = async () => {
    if (!newBarberName) return
    await supabase.from("barbers").insert([{ name: newBarberName }])
    setNewBarberName("")
    fetchBarbers()
  }

  const handleDeleteBarber = async (id: string) => {
    await supabase.from("barbers").delete().eq("id", id)
    fetchBarbers()
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id)
    fetchBookings()
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    setSession(null)
  }

  // TELA DE LOGIN (Caso não esteja autenticado)
  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950/60 text-red-500 border border-red-800/50 mb-2">
              <Scissors className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Acesso Administrativo</h1>
            <p className="text-xs text-zinc-400">Entre com as credenciais de acesso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-red-600 hover:bg-red-700 font-bold py-2.5 rounded-lg text-sm text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar no Painel"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const upcomingBookings = (bookings || []).filter(b => b.status === "pending").slice(0, 4)

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

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard" ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "services" ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            Serviços & Preços
          </button>
          <button
            onClick={() => setActiveTab("barbers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "barbers" ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            Colaboradores
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "settings" ? "bg-red-600 text-white" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            Horários Barbearia
          </button>
        </div>

        {/* ABA: AGENDAMENTOS */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
              <button onClick={fetchBookings} className="text-zinc-400 hover:text-white">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* MINIATURAS: PRÓXIMOS 4 HORÁRIOS */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock3 className="w-4 h-4 text-red-500" /> Próximos 4 Horários Mais Perto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {upcomingBookings.length === 0 ? (
                  <div className="col-span-full py-4 text-center text-xs text-zinc-500 bg-zinc-950/50 rounded-lg border border-zinc-900">
                    Nenhum agendamento pendente.
                  </div>
                ) : (
                  upcomingBookings.map((item) => (
                    <div key={item.id} className="bg-zinc-950 border border-red-900/40 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                          {item.booking_time}
                        </span>
                        <span className="text-[10px] text-zinc-400">{item.barber_name}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white truncate">{item.client_name}</p>
                        <p className="text-xs text-zinc-400 truncate">{item.service_name}</p>
                      </div>
                      <a
                        href={`https://wa.me/55${(item.client_phone || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LISTA COMPLETA */}
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Todos os Agendamentos do Dia ({(bookings || []).length})
              </h2>

              {(bookings || []).length === 0 ? (
                <div className="text-center py-8 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 text-sm">
                  Nenhum registro para esta data.
                </div>
              ) : (
                <div className="grid gap-3">
                  {bookings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-zinc-900 text-white border border-zinc-800 px-2.5 py-0.5 rounded text-xs font-bold">
                            {item.booking_time}
                          </span>
                          <span className="text-xs font-semibold text-white">{item.client_name}</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {item.service_name} ({item.service_price}) • Com: <span className="text-zinc-200">{item.barber_name}</span>
                        </p>
                        <div className="pt-1">
                          <a
                            href={`https://wa.me/55${(item.client_phone || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp: {item.client_phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status !== "completed" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "completed")}
                            className="px-2.5 py-1 text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 rounded hover:bg-emerald-900"
                          >
                            Concluir
                          </button>
                        )}
                        {item.status !== "canceled" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "canceled")}
                            className="px-2.5 py-1 text-xs bg-rose-950 text-rose-400 border border-rose-800 rounded hover:bg-rose-900"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: SERVIÇOS & PREÇOS */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" /> Adicionar Novo Serviço
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nome do Serviço"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Preço (ex: R$ 45,00)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleAddService}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-xs"
                >
                  Cadastrar Serviço
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              {(services || []).map((s) => (
                <div key={s.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="text-xs text-zinc-400">{s.price}</p>
                  </div>
                  <button onClick={() => handleDeleteService(s.id)} className="text-zinc-500 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: COLABORADORES */}
        {activeTab === "barbers" && (
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" /> Adicionar Barbeiro
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nome do Profissional"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleAddBarber}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded text-xs"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              {(barbers || []).map((b) => (
                <div key={b.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">{b.name}</span>
                  <button onClick={() => handleDeleteBarber(b.id)} className="text-zinc-500 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: HORÁRIOS BARBEARIA */}
        {activeTab === "settings" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-500" /> Horários de Funcionamento e Almoço
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400">Abertura</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Fechamento</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Início Almoço</label>
                <input
                  type="time"
                  value={lunchStart}
                  onChange={(e) => setLunchStart(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Fim Almoço</label>
                <input
                  type="time"
                  value={lunchEnd}
                  onChange={(e) => setLunchEnd(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs transition-colors"
            >
              Salvar Horários
            </button>
          </div>
        )}

      </div>
    </div>
  )
}