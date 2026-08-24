"use client"

import React, { useMemo } from "react"
import { BarChart3, DollarSign, Scissors, Users, CalendarCheck, TrendingUp } from "lucide-react"

interface ReportsTabProps {
  bookings: any[]
}

export function ReportsTab({ bookings }: ReportsTabProps) {
  // Processamento dos dados para os relatórios
  const stats = useMemo(() => {
    const list = bookings || []
    
    // Total de agendamentos
    const totalBookings = list.length
    
    // Apenas concluídos contam para faturamento real, ou todos se preferir. Vamos usar concluídos + pendentes para estimativa, ou focar nos concluídos. Vamos filtrar concluídos ou válidos (não cancelados).
    const validBookings = list.filter(b => b.status !== "canceled")
    const completedBookings = list.filter(b => b.status === "completed")

    // Faturamento Total (convertendo service_price string como "R$ 70,00" para número)
    let totalRevenue = 0
    validBookings.forEach(b => {
      if (b.service_price) {
        const clean = b.service_price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')
        const val = parseFloat(clean)
        if (!isNaN(val)) totalRevenue += val
      }
    })

    // Faturamento Concluído
    let completedRevenue = 0
    completedBookings.forEach(b => {
      if (b.service_price) {
        const clean = b.service_price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')
        const val = parseFloat(clean)
        if (!isNaN(val)) completedRevenue += val
      }
    })

    // Agrupamento por Barbeiro
    const byBarber: { [key: string]: { count: number, revenue: number } } = {}
    validBookings.forEach(b => {
      const barber = b.barber_name || "Não atribuído"
      if (!byBarber[barber]) {
        byBarber[barber] = { count: 0, revenue: 0 }
      }
      byBarber[barber].count += 1
      
      let val = 0
      if (b.service_price) {
        const clean = b.service_price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')
        val = parseFloat(clean) || 0
      }
      byBarber[barber].revenue += val
    })

    return {
      totalBookings,
      validCount: validBookings.length,
      completedCount: completedBookings.length,
      totalRevenue,
      completedRevenue,
      byBarber
    }
  }, [bookings])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-500" /> Relatórios e Estatísticas Gerais
        </h2>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Faturamento Estimado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-zinc-500">Baseado em todos os agendamentos ativos</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Faturamento Concluído</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">
            R$ {stats.completedRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-zinc-500">Apenas serviços finalizados</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Total de Cortes/Serviços</span>
            <Scissors className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.validCount}</p>
          <p className="text-[11px] text-zinc-500">Excluindo os cancelados</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Concluídos / Realizados</span>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.completedCount}</p>
          <p className="text-[11px] text-zinc-500">Atendimentos finalizados com sucesso</p>
        </div>
      </div>

      {/* Desempenho por Barbeiro */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-red-500" /> Desempenho por Profissional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(stats.byBarber).length === 0 ? (
            <p className="text-xs text-zinc-400">Nenhum dado registrado ainda.</p>
          ) : (
            Object.entries(stats.byBarber).map(([barberName, data]) => (
              <div key={barberName} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{barberName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{data.count} atendimento(s) realizado(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-emerald-400">
                    R$ {data.revenue.toFixed(2).replace('.', ',')}
                  </p>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Faturamento</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}