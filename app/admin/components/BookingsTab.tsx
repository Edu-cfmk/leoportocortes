"use client"

import React, { useEffect } from "react"
import { Calendar, RefreshCw, Clock3, MessageCircle, X, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface BookingsTabProps {
  selectedDate: string
  setSelectedDate: (date: string) => void
  fetchBookings: () => void
  loading: boolean
  bookings: any[]
  handleUpdateStatus: (id: string, status: string) => void
}

export function BookingsTab({
  selectedDate, setSelectedDate, fetchBookings, loading, bookings, handleUpdateStatus
}: BookingsTabProps) {
  
  // Ativa o Realtime do Supabase para atualizar a lista automaticamente
  useEffect(() => {
    fetchBookings()

    const channel = supabase
      .channel('admin-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Alteração detectada via Realtime:', payload)
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedDate]) // Recarrega se a data mudar

  // Função auxiliar para formatar YYYY-MM-DD para DD/MM/AAAA
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const parts = dateStr.split("-")
    if (parts.length !== 3) return dateStr
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  // Define a data de hoje no formato YYYY-MM-DD
  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
  }

  // Filtro rigoroso: Se selectedDate estiver preenchida, filtra exatamente por ela (YYYY-MM-DD)
  const filteredBookings = (bookings || []).filter(item => {
    if (!selectedDate) return true // Se não há data selecionada, mostra todos
    if (!item.booking_date) return false
    
    // Normaliza a data do banco para comparar apenas a parte YYYY-MM-DD (ex: pegando os 10 primeiros caracteres)
    const itemDateOnly = item.booking_date.split("T")[0]
    return itemDateOnly === selectedDate
  })

  const upcomingBookings = (filteredBookings || []).filter(b => b.status === "pending").slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Filtro por Data + Botão Hoje */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-red-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-sm text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-600"
          />
          <button
            onClick={setTodayDate}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
          >
            Ver Hoje
          </button>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtro (Mostrar Todos)
            </button>
          )}
        </div>
        <button 
          onClick={fetchBookings} 
          className="text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 p-2 rounded-lg transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Próximos 4 Horários Mais Perto */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-red-500" /> Próximos 4 Horários Pendentes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {upcomingBookings.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-zinc-400 bg-zinc-950/60 rounded-xl border border-zinc-800">
              Nenhum agendamento pendente para esta data.
            </div>
          ) : (
            upcomingBookings.map((item) => (
              <div key={item.id} className="bg-zinc-950 border border-red-900/60 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                  <span className="text-xs font-extrabold bg-red-600 text-white px-2.5 py-1 rounded">
                    {item.booking_time}
                  </span>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {item.barber_name}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-base font-bold text-white tracking-wide">{item.client_name}</p>
                  <p className="text-xs font-medium text-zinc-300">{item.service_name}</p>
                  {item.booking_date && (
                    <p className="text-xs text-red-400 font-semibold pt-1">
                      Data: {formatDate(item.booking_date)}
                    </p>
                  )}
                </div>

                <div className="pt-1 border-t border-zinc-800/60 flex items-center justify-between">
                  <a
                    href={`https://wa.me/55${(item.client_phone || "").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lista Principal de Agendamentos */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          {selectedDate 
            ? `Agendamentos do Dia ${formatDate(selectedDate)} (${filteredBookings.length})` 
            : `Todos os Agendamentos em Ordem (${filteredBookings.length})`}
        </h2>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-10 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
            Nenhum registro encontrado para este filtro.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBookings.map((item) => (
              <div 
                key={item.id} 
                className={`bg-zinc-950 border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                  item.status === "completed" ? "border-emerald-900/40 opacity-75" :
                  item.status === "canceled" ? "border-rose-900/40 opacity-60" : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-zinc-900 text-white border border-zinc-700 px-3 py-1 rounded-md text-xs font-bold">
                      {item.booking_date ? `${formatDate(item.booking_date)} às ${item.booking_time}` : item.booking_time}
                    </span>
                    <span className="text-sm font-bold text-white">{item.client_name}</span>
                    {item.status === "completed" && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Concluído
                      </span>
                    )}
                    {item.status === "canceled" && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Cancelado
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">
                    <span className="text-white font-semibold">{item.service_name}</span> ({item.service_price}) • Barbeiro: <span className="text-red-400 font-semibold">{item.barber_name}</span>
                  </p>

                  <div className="pt-1">
                    <a 
                      href={`https://wa.me/55${(item.client_phone || "").replace(/\D/g, "")}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp: {item.client_phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.status !== "completed" && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "completed")} 
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg transition-colors"
                    >
                      Concluído
                    </button>
                  )}
                  {item.status !== "canceled" && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "canceled")} 
                      className="px-3 py-1.5 text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors"
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
  )
}