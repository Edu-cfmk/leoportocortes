"use client"

import { Calendar, RefreshCw, Clock3, MessageCircle, X } from "lucide-react"

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
  const upcomingBookings = (bookings || []).filter(b => b.status === "pending").slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Filtro Opcional */}
      <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
            >
              <X className="w-3 h-3" /> Limpar filtro (Mostrar Todos)
            </button>
          )}
        </div>
        <button onClick={fetchBookings} className="text-zinc-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Próximos Horários */}
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
                  <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded">{item.booking_time}</span>
                  <span className="text-[10px] text-zinc-400">{item.barber_name}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate">{item.client_name}</p>
                  <p className="text-xs text-zinc-400 truncate">{item.service_name}</p>
                  {item.booking_date && <p className="text-[10px] text-zinc-500 mt-1">Data: {item.booking_date}</p>}
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

      {/* Lista Principal */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {selectedDate ? `Agendamentos do Dia (${(bookings || []).length})` : `Todos os Agendamentos em Ordem (${(bookings || []).length})`}
        </h2>
        {(bookings || []).length === 0 ? (
          <div className="text-center py-8 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 text-sm">
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="grid gap-3">
            {bookings.map((item) => (
              <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-900 text-white border border-zinc-800 px-2.5 py-0.5 rounded text-xs font-bold">
                      {item.booking_date ? `${item.booking_date} às ${item.booking_time}` : item.booking_time}
                    </span>
                    <span className="text-xs font-semibold text-white">{item.client_name}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{item.service_name} ({item.service_price}) • Com: <span className="text-zinc-200">{item.barber_name}</span></p>
                  <div className="pt-1">
                    <a href={`https://wa.me/55${(item.client_phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp: {item.client_phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status !== "completed" && (
                    <button onClick={() => handleUpdateStatus(item.id, "completed")} className="px-2.5 py-1 text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 rounded hover:bg-emerald-900">
                      Concluir
                    </button>
                  )}
                  {item.status !== "canceled" && (
                    <button onClick={() => handleUpdateStatus(item.id, "canceled")} className="px-2.5 py-1 text-xs bg-rose-950 text-rose-400 border border-rose-800 rounded hover:bg-rose-900">
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