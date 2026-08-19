"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Scissors, LogOut, Home } from "lucide-react"

import { AdminLogin } from "./components/AdminLogin"
import { BookingsTab } from "./components/BookingsTab"
import { ServicesTab } from "./components/ServicesTab"
import { SettingsTab } from "./components/SettingsTab"

export default function AdminPage() {
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    const local = localStorage.getItem("admin_session")
    if (local) {
      try { setSession(JSON.parse(local)) } catch (e) { localStorage.removeItem("admin_session") }
    }
  }, [])

  useEffect(() => {
    if (session) fetchBookings()
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

        <BookingsTab
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          fetchBookings={fetchBookings}
          loading={loading}
          bookings={bookings}
          handleUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  )
}