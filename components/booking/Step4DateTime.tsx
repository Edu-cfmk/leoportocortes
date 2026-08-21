"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Barber, Service } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface Step4Props {
  selectedDate: string
  selectedTime: string
  selectedBarber: Barber | null
  selectedService: Service | null
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
  onNext: () => void
  onBack: () => void
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function Step4DateTime({
  selectedDate,
  selectedTime,
  selectedBarber,
  selectedService,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}: Step4Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  
  const [bookedIntervals, setBookedIntervals] = useState<{ start: number; end: number }[]>([])
  const [loadingTimes, setLoadingTimes] = useState<boolean>(false)

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  const parseDurationToMinutes = (durationStr?: string) => {
    if (!durationStr) return 45
    let totalMinutes = 0
    const hourMatch = durationStr.match(/(\d+)h/)
    const minMatch = durationStr.match(/(\d+)min/)

    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60
    if (minMatch) totalMinutes += parseInt(minMatch[1])

    return totalMinutes > 0 ? totalMinutes : 45
  }

  // Gera os horários possíveis do dia com base na duração do serviço atual
  // Exemplo: Expediente das 09:00 às 19:00 (pausa de almoço das 12:00 às 13:30)
  const generateDynamicSlots = () => {
    const serviceDuration = parseDurationToMinutes(selectedService?.duration)
    const slots: string[] = []

    // Período da manhã: 09:00 até 12:00
    let currentMin = 9 * 60 // 09:00
    const morningEnd = 12 * 60 // 12:00

    while (currentMin + serviceDuration <= morningEnd) {
      slots.push(minutesToTime(currentMin))
      currentMin += 15 // Incremento de 15 em 15 minutos para testar novos encaixes, ou pode usar a própria duração se preferir
    }

    // Período da tarde: 13:30 até 19:00
    currentMin = 13 * 60 + 30 // 13:30
    const eveningEnd = 19 * 60 // 19:00

    while (currentMin + serviceDuration <= eveningEnd) {
      slots.push(minutesToTime(currentMin))
      currentMin += 15
    }

    return slots
  }

  const availableSlots = generateDynamicSlots()

  useEffect(() => {
    async function fetchBookedTimes() {
      if (!selectedDate || !selectedBarber) {
        setBookedIntervals([])
        return
      }

      setLoadingTimes(true)
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("booking_time, status, service_name")
          .eq("booking_date", selectedDate)
          .eq("barber_name", selectedBarber.name)

        if (error) {
          console.error("Erro ao buscar horários ocupados:", error)
        } else if (data) {
          const intervals: { start: number; end: number }[] = []

          for (const booking of data) {
            const statusLower = (booking.status || "").toLowerCase()
            if (statusLower.includes("cancel") || statusLower.includes("cancelado")) {
              continue
            }

            const startTime = booking.booking_time
            const startMin = timeToMinutes(startTime)
            
            // Descobre a duração real do agendamento já existente no banco
            let durationMin = 45
            if (booking.service_name) {
              const serviceNameLower = booking.service_name.toLowerCase()
              if (
                serviceNameLower.includes("degrade") || 
                serviceNameLower.includes("combo") || 
                serviceNameLower.includes("1h")
              ) {
                durationMin = 60
              }
            }

            intervals.push({
              start: startMin,
              end: startMin + durationMin
            })
          }

          setBookedIntervals(intervals)
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar horários:", err)
      } finally {
        setLoadingTimes(false)
      }
    }

    fetchBookedTimes()
  }, [selectedDate, selectedBarber])

  const isSlotUnavailable = (slotTime: string) => {
    const slotStartMin = timeToMinutes(slotTime)
    const serviceDuration = parseDurationToMinutes(selectedService?.duration)
    const slotEndMin = slotStartMin + serviceDuration

    // Verifica se cruza com algum intervalo já ocupado no banco
    for (const booked of bookedIntervals) {
      // Há conflito se o novo agendamento começar antes do outro terminar E terminar depois do outro começar
      if (slotStartMin < booked.end && slotEndMin > booked.start) {
        return true
      }
    }

    return false
  }

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0")
    const formattedDay = String(day).padStart(2, "0")
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`
    onSelectDate(dateStr)
    onSelectTime("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-500 font-semibold">
        <CalendarIcon className="w-5 h-5" />
        <h2 className="text-lg text-white">Passo 4: Data e Horário</h2>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white capitalize">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const cellDate = new Date(currentYear, currentMonth, day)
            cellDate.setHours(0, 0, 0, 0)

            const isPast = cellDate < today
            const formattedMonth = String(currentMonth + 1).padStart(2, "0")
            const formattedDay = String(day).padStart(2, "0")
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDay(day)}
                className={`py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-red-600 text-white font-bold shadow-md shadow-red-900/40"
                    : isPast
                    ? "text-zinc-700 cursor-not-allowed"
                    : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate ? (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              Horários para {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}:
            </span>
            {selectedBarber && (
              <span className="text-red-400 font-semibold">Profissional: {selectedBarber.name}</span>
            )}
          </label>

          {loadingTimes ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((time) => {
                const isSelected = selectedTime === time
                const isUnavailable = isSlotUnavailable(time)

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => onSelectTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      isUnavailable
                        ? "bg-zinc-900/50 border-zinc-900 text-zinc-600 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-900/30"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    {time} {isUnavailable && "(Ocupado)"}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-center py-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          Selecione um dia no calendário acima para visualizar os horários.
        </p>
      )}

      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
        >
          Revisar Agendamento <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}