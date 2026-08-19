"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, Phone, User, Scissors, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react"

interface Booking {
  id: string
  client_name: string
  client_phone: string
  service_name: string
  service_price: string
  barber_name: string
  booking_date: string
  booking_time: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", selectedDate)
      .order("booking_time", { ascending: true })

    if (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [selectedDate])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      alert("Erro ao atualizar status.")
    } else {
      fetchBookings()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erro ao excluir agendamento.")
    } else {
      fetchBookings()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <Scissors className="w-6 h-6" /> Painel Administrativo
            </h1>
            <p className="text-sm text-zinc-400">Gerencie todos os agendamentos da barbearia</p>
          </div>

          {/* Filtro de Data */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none"
            />
            <button
              onClick={fetchBookings}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Carregando agendamentos...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-xl">
            <p className="text-zinc-400">Nenhum agendamento encontrado para esta data.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition-colors"
              >
                {/* Informações do Cliente & Horário */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-red-950/60 text-red-400 border border-red-800/50 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {item.booking_time}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.status === "completed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : item.status === "canceled"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Concluído"
                        : item.status === "canceled"
                        ? "Cancelado"
                        : "Pendente"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <User className="w-4 h-4 text-zinc-400" /> {item.client_name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Phone className="w-3.5 h-3.5" /> {item.client_phone}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 pt-1 border-t border-zinc-900">
                    <span className="text-zinc-200 font-medium">{item.service_name}</span> ({item.service_price}) • Barbeiro:{" "}
                    <span className="text-zinc-200 font-medium">{item.barber_name}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-zinc-900 pt-3 sm:pt-0">
                  {item.status !== "completed" && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, "completed")}
                      className="px-3 py-1.5 text-xs font-medium border border-emerald-900/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Concluir
                    </button>
                  )}

                  {item.status !== "canceled" && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, "canceled")}
                      className="px-3 py-1.5 text-xs font-medium border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 hover:text-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}