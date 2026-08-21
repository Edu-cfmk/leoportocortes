"use client";

import { Settings, Check, X } from "lucide-react";

export interface DaySchedule {
  dayOfWeek: string; // ex: "segunda", "terca", etc.
  label: string; // ex: "Segunda-feira"
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
}

interface SettingsTabProps {
  schedules: DaySchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<DaySchedule[]>>;
  handleSaveSettings: () => void;
  barbers: any[];
  setSelectedBarber: (id: string) => void;
}

export function SettingsTab({
  schedules,
  setSchedules,
  handleSaveSettings,
  barbers,
  setSelectedBarber,
}: SettingsTabProps) {
  const updateDayField = (
    dayOfWeek: string,
    field: keyof DaySchedule,
    value: any,
  ) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Colaborador ou Geral */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-2">
        <label className="text-xs font-bold text-zinc-300 block">
          Selecionar Escala (Colaborador ou Geral)
        </label>
        <select
          className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-white w-full text-xs focus:outline-none focus:border-red-600"
          onChange={(e) => setSelectedBarber(e.target.value)}
        >
          <option value="geral">Barbearia (Geral - Base para todos)</option>
          {barbers && barbers.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Settings className="w-4 h-4 text-red-500" /> Horários de
          Funcionamento por Dia da Semana
        </h3>

        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.dayOfWeek}
              className={`border rounded-xl p-4 transition-all ${
                schedule.isOpen
                  ? "bg-zinc-900/60 border-zinc-800"
                  : "bg-zinc-950/40 border-zinc-900 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Nome do Dia e Botão de Permissão (Aberto/Fechado) */}
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-sm font-bold text-white w-32">
                    {schedule.label}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateDayField(
                        schedule.dayOfWeek,
                        "isOpen",
                        !schedule.isOpen,
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      schedule.isOpen
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {schedule.isOpen ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    {schedule.isOpen ? "Aberto" : "Fechado"}
                  </button>
                </div>

                {/* Inputs de Horário (Apenas se estiver aberto) */}
                {schedule.isOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">
                        Abertura
                      </label>
                      <input
                        type="time"
                        value={schedule.openTime}
                        onChange={(e) =>
                          updateDayField(
                            schedule.dayOfWeek,
                            "openTime",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">
                        Fechamento
                      </label>
                      <input
                        type="time"
                        value={schedule.closeTime}
                        onChange={(e) =>
                          updateDayField(
                            schedule.dayOfWeek,
                            "closeTime",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">
                        Início Almoço
                      </label>
                      <input
                        type="time"
                        value={schedule.lunchStart}
                        onChange={(e) =>
                          updateDayField(
                            schedule.dayOfWeek,
                            "lunchStart",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">
                        Fim Almoço
                      </label>
                      <input
                        type="time"
                        value={schedule.lunchEnd}
                        onChange={(e) =>
                          updateDayField(
                            schedule.dayOfWeek,
                            "lunchEnd",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
        >
          Salvar Horários da Semana
        </button>
      </div>
    </div>
  );
}