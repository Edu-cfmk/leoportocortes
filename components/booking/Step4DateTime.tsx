"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Barber, Service } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Step4Props {
  selectedDate: string;
  selectedTime: string;
  selectedBarber: Barber | null;
  selectedService: Service | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ScheduleConfig {
  openMin: number;
  closeMin: number;
  lunchStartMin: number | null;
  lunchEndMin: number | null;
  isClosed: boolean;
}

interface BookedInterval {
  start: number;
  end: number;
}

interface GeneratedSlot {
  time: string;
  start: number;
  end: number;
  available: boolean;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */

function normalizeText(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function timeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;

  const [hours, minutes] = timeStr.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

/**
 * Converte:
 *
 * "10min"      -> 10
 * "10 min"      -> 10
 * "45min"      -> 45
 * "1h"          -> 60
 * "1h 25min"    -> 85
 * "1h25min"     -> 85
 * "1 hora"      -> 60
 * "1 hora 25 minutos" -> 85
 *
 * Também aceita número puro como minutos:
 * "45" -> 45
 */
function parseDurationToMinutes(duration?: string | number | null): number {
  if (duration === null || duration === undefined || duration === "") {
    return 45;
  }

  if (typeof duration === "number") {
    return duration > 0 ? duration : 45;
  }

  const normalized = duration.toLowerCase().replace(",", ".").trim();

  // Caso seja apenas "45"
  if (/^\d+$/.test(normalized)) {
    const value = Number(normalized);
    return value > 0 ? value : 45;
  }

  let totalMinutes = 0;

  // Horas
  const hourMatch = normalized.match(/(\d+)\s*(?:h|hora|horas)/);

  if (hourMatch) {
    totalMinutes += Number(hourMatch[1]) * 60;
  }

  // Minutos
  const minuteMatch = normalized.match(/(\d+)\s*(?:min|minuto|minutos)/);

  if (minuteMatch) {
    totalMinutes += Number(minuteMatch[1]);
  }

  return totalMinutes > 0 ? totalMinutes : 45;
}

/**
 * Fallback para agendamentos antigos que possuem
 * service_duration = NULL.
 */
function getBookingDuration(
  serviceDuration: string | null | undefined,
  serviceName: string | null | undefined,
): number {
  if (serviceDuration) {
    return parseDurationToMinutes(serviceDuration);
  }

  const name = normalizeText(serviceName);

  if (name.includes("sobrancelha")) {
    return 10;
  }

  if (name.includes("alisamento")) {
    return 85;
  }

  if (
    name.includes("degrade") ||
    name.includes("freestyle") ||
    name.includes("combo")
  ) {
    return 60;
  }

  // Fallback genérico para registros antigos
  return 45;
}

/* ============================================================
   COMPONENTE
============================================================ */

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
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([]);

  const [loadingTimes, setLoadingTimes] = useState(false);

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    openMin: 8 * 60,
    closeMin: 18 * 60,
    lunchStartMin: null,
    lunchEndMin: null,
    isClosed: false,
  });

  /* ==========================================================
     DURAÇÃO DO SERVIÇO ATUAL
  ========================================================== */

  const serviceDuration = useMemo(() => {
    return parseDurationToMinutes(selectedService?.duration);
  }, [selectedService?.duration]);

  /* ==========================================================
     BUSCA HORÁRIO + AGENDAMENTOS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function fetchScheduleAndBookings() {
      if (!selectedDate || !selectedBarber) {
        setBookedIntervals([]);
        setLoadingTimes(false);
        return;
      }

      setLoadingTimes(true);

      try {
        const dateObj = new Date(`${selectedDate}T00:00:00`);
        const dayIndex = dateObj.getDay();
        const dayOfWeekName = WEEKDAYS[dayIndex];

        const [generalResult, barberResult, bookingsResult] = await Promise.all(
          [
            supabase.from("barber_schedules").select("*").is("barber_id", null),

            supabase
              .from("barber_schedules")
              .select("*")
              .eq("barber_id", selectedBarber.id),

            supabase
              .from("bookings")
              .select(
                "booking_time, status, service_name, service_duration, barber_name",
              )
              .eq("booking_date", selectedDate)
              .eq("barber_name", selectedBarber.name),
          ],
        );

        if (generalResult.error) {
          throw generalResult.error;
        }

        if (barberResult.error) {
          throw barberResult.error;
        }

        if (bookingsResult.error) {
          throw bookingsResult.error;
        }

        if (cancelled) return;

        /* ======================================================
           HORÁRIO GERAL (BASE)
        ====================================================== */

        const generalSchedule = (generalResult.data || []).find(
          (schedule: any) =>
            normalizeText(schedule.day_of_week) ===
            normalizeText(dayOfWeekName),
        );

        const barberSchedule = (barberResult.data || []).find(
          (schedule: any) =>
            normalizeText(schedule.day_of_week) ===
            normalizeText(dayOfWeekName),
        );

        let generalOpenMin = generalSchedule?.open_time
          ? timeToMinutes(generalSchedule.open_time)
          : 8 * 60;

        let generalCloseMin = generalSchedule?.close_time
          ? timeToMinutes(generalSchedule.close_time)
          : 18 * 60;

        let isClosed = generalSchedule?.is_open === false;

        let generalLunchStart: number | null = generalSchedule?.lunch_start
          ? timeToMinutes(generalSchedule.lunch_start)
          : null;

        let generalLunchEnd: number | null = generalSchedule?.lunch_end
          ? timeToMinutes(generalSchedule.lunch_end)
          : null;

        /* ======================================================
           APLICANDO REGRAS DO BARBEIRO RESPEITANDO O GERAL
        ====================================================== */

        let openMin = generalOpenMin;
        let closeMin = generalCloseMin;
        let lunchStartMin = generalLunchStart;
        let lunchEndMin = generalLunchEnd;

        if (barberSchedule) {
          if (
            barberSchedule.is_open !== null &&
            barberSchedule.is_open !== undefined
          ) {
            isClosed = barberSchedule.is_open === false;
          }

          // O colaborador só pode abrir DEPOIS ou no mesmo horário que a barbearia geral.
          if (barberSchedule.open_time) {
            const barberOpen = timeToMinutes(barberSchedule.open_time);
            openMin = Math.max(generalOpenMin, barberOpen);
          }

          // O colaborador deve fechar ATÉ o horário que a barbearia fecha.
          if (barberSchedule.close_time) {
            const barberClose = timeToMinutes(barberSchedule.close_time);
            closeMin = Math.min(generalCloseMin, barberClose);
          }

          if (barberSchedule.lunch_start) {
            lunchStartMin = timeToMinutes(barberSchedule.lunch_start);
          }

          if (barberSchedule.lunch_end) {
            lunchEndMin = timeToMinutes(barberSchedule.lunch_end);
          }
        }

        /*
         * Segurança:
         * se o fechamento for menor ou igual à abertura,
         * consideramos o dia fechado.
         */
        if (closeMin <= openMin) {
          isClosed = true;
        }

        setScheduleConfig({
          openMin,
          closeMin,
          lunchStartMin,
          lunchEndMin,
          isClosed,
        });

        /* ======================================================
           SE O DIA ESTIVER FECHADO
        ====================================================== */

        if (isClosed) {
          setBookedIntervals([]);
          setLoadingTimes(false);
          return;
        }

        /* ======================================================
           CONVERTE AGENDAMENTOS EM INTERVALOS
        ====================================================== */

        const intervals: BookedInterval[] = [];

        for (const booking of bookingsResult.data || []) {
          const status = normalizeText(booking.status);

          const isCancelled =
            status.includes("cancel") || status.includes("cancelado");

          if (isCancelled) {
            continue;
          }

          const startMin = timeToMinutes(booking.booking_time);

          const durationMin = getBookingDuration(
            booking.service_duration,
            booking.service_name,
          );

          intervals.push({
            start: startMin,
            end: startMin + durationMin,
          });
        }

        intervals.sort((a, b) => a.start - b.start);

        setBookedIntervals(intervals);
      } catch (error) {
        console.error("Erro ao carregar horários da barbearia:", error);

        if (!cancelled) {
          setBookedIntervals([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingTimes(false);
        }
      }
    }

    fetchScheduleAndBookings();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedBarber]);

  /* ==========================================================
     GERAÇÃO INTELIGENTE DOS HORÁRIOS
  ========================================================== */

  const generatedSlots = useMemo<GeneratedSlot[]>(() => {
    if (
      !selectedDate ||
      !selectedBarber ||
      scheduleConfig.isClosed ||
      serviceDuration <= 0
    ) {
      return [];
    }

    const slots: GeneratedSlot[] = [];

    let currentMin = scheduleConfig.openMin;

    let safetyCounter = 0;

    while (currentMin < scheduleConfig.closeMin && safetyCounter < 1000) {
      safetyCounter++;

      const slotStart = currentMin;
      const slotEnd = slotStart + serviceDuration;

      if (slotEnd > scheduleConfig.closeMin) {
        break;
      }

      let blockingEnd: number | null = null;

      /* ======================================================
         ALMOÇO
      ====================================================== */

      if (
        scheduleConfig.lunchStartMin !== null &&
        scheduleConfig.lunchEndMin !== null
      ) {
        const crossesLunch =
          slotStart < scheduleConfig.lunchEndMin &&
          slotEnd > scheduleConfig.lunchStartMin;

        if (crossesLunch) {
          blockingEnd = scheduleConfig.lunchEndMin;
        }
      }

      /* ======================================================
         AGENDAMENTOS EXISTENTES
      ====================================================== */

      for (const booked of bookedIntervals) {
        const overlaps = slotStart < booked.end && slotEnd > booked.start;

        if (overlaps) {
          blockingEnd = Math.max(blockingEnd ?? 0, booked.end);
        }
      }

      /* ======================================================
         HORÁRIO BLOQUEADO
      ====================================================== */

      if (blockingEnd !== null) {
        slots.push({
          time: minutesToTime(slotStart),
          start: slotStart,
          end: slotEnd,
          available: false,
        });

        currentMin = blockingEnd;
        continue;
      }

      /* ======================================================
         HORÁRIO LIVRE
      ====================================================== */

      slots.push({
        time: minutesToTime(slotStart),
        start: slotStart,
        end: slotEnd,
        available: true,
      });

      currentMin = slotEnd;
    }

    return slots;
  }, [
    selectedDate,
    selectedBarber,
    scheduleConfig,
    bookedIntervals,
    serviceDuration,
  ]);

  /* ==========================================================
     LIMPA HORÁRIO SE O SERVIÇO MUDAR
  ========================================================== */

  useEffect(() => {
    if (!selectedTime) return;

    const selectedSlot = generatedSlots.find(
      (slot) => slot.time === selectedTime,
    );

    if (!selectedSlot || !selectedSlot.available) {
      onSelectTime("");
    }
  }, [generatedSlots, selectedTime, onSelectTime]);

  /* ==========================================================
     CALENDÁRIO
  ========================================================== */

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");

    const formattedDay = String(day).padStart(2, "0");

    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    onSelectDate(dateStr);
    onSelectTime("");
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">
      {/* ======================================================
          TÍTULO
      ====================================================== */}

      <div className="flex items-center gap-2 text-red-500 font-semibold">
        <CalendarIcon className="w-5 h-5" />

        <h2 className="text-lg text-white">Passo 4: Data e Horário</h2>
      </div>

      {/* ======================================================
          CALENDÁRIO
      ====================================================== */}

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

        {/* DIAS DA SEMANA */}

        <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1 uppercase">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* DIAS */}

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({
            length: firstDayOfMonth,
          }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({
            length: daysInMonth,
          }).map((_, index) => {
            const day = index + 1;

            const cellDate = new Date(currentYear, currentMonth, day);

            cellDate.setHours(0, 0, 0, 0);

            const isPast = cellDate < today;

            const formattedMonth = String(currentMonth + 1).padStart(2, "0");

            const formattedDay = String(day).padStart(2, "0");

            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const isSelected = selectedDate === dateStr;

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
            );
          })}
        </div>
      </div>

      {/* ======================================================
          HORÁRIOS
      ====================================================== */}

      {selectedDate ? (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              Horários para{" "}
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR")}
              :
            </span>

            {selectedBarber && (
              <span className="text-red-400 font-semibold">
                Profissional: {selectedBarber.name}
              </span>
            )}
          </label>

          {/* ==================================================
              SERVIÇO SELECIONADO
          ================================================== */}

          {selectedService && (
            <div className="text-xs text-zinc-500">
              Serviço:{" "}
              <span className="text-zinc-300 font-semibold">
                {selectedService.name}
              </span>{" "}
              — duração:{" "}
              <span className="text-red-400 font-semibold">
                {selectedService.duration}
              </span>
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loadingTimes ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            </div>
          ) : scheduleConfig.isClosed ? (
            <p className="text-xs text-zinc-500 text-center py-6 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              O profissional não atende neste dia.
            </p>
          ) : generatedSlots.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              Não há horários disponíveis para este serviço neste dia.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {generatedSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;

                const isUnavailable = !slot.available;

                return (
                  <button
                    key={`${slot.time}-${slot.start}`}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => onSelectTime(slot.time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      isUnavailable
                        ? "bg-zinc-900/50 border-zinc-900 text-zinc-600 cursor-not-allowed line-through"
                        : isSelected
                          ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-900/30"
                          : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-center py-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          Selecione um dia no calendário acima para visualizar os horários.
        </p>
      )}

      {/* ======================================================
          NAVEGAÇÃO
      ====================================================== */}

      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
        >
          Revisar Agendamento
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}