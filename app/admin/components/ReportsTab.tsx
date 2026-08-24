"use client"

import React, { useState, useMemo } from "react"
import { BarChart3, DollarSign, Scissors, Users, CalendarCheck, TrendingUp, Filter } from "lucide-react"

interface ReportsTabProps {
  bookings: any[]
}

export function ReportsTab({ bookings }: ReportsTabProps) {
  // Filtro de período: "all", "today", "month"
  const [periodFilter, setPeriodFilter] = useState<"all" | "today" | "month">("month")

  // Filtragem dos agendamentos conforme o período selecionado
  const filteredBookings = useMemo(() => {
    const list = bookings || []
    const todayStr = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    const currentMonthPrefix = todayStr.slice(0, 7) // YYYY-MM

    return list.filter(b => {
      if (!b.booking_date) return periodFilter === "all"
      if (periodFilter === "today") {
        return b.booking_date === todayStr
      }
      if (periodFilter === "month") {
        return b.booking_date.startsWith(currentMonthPrefix)
      }
      return true
    })
  }, [bookings, periodFilter])

  // Estatísticas calculadas com base nos agendamentos filtrados
  const stats = useMemo(() => {
    const list = filteredBookings
    const validBookings = list.filter(b => b.status !== "canceled")
    const completedBookings = list.filter(b => b.status === "completed")

    // Faturamento Total (Válidos)
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

    // Agrupamento por Serviço (Ranking)
    const byService: { [key: string]: { count: number, revenue: number } } = {}
    validBookings.forEach(b => {
      const service = b.service_name || "Serviço Geral"
      if (!byService[service]) {
        byService[service] = { count: 0, revenue: 0 }
      }
      byService[service].count += 1
      
      let val = 0
      if (b.service_price) {
        const clean = b.service_price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.')
        val = parseFloat(clean) || 0
      }
      byService[service].revenue += val
    })

    // Ordenar serviços mais vendidos
    const topServices = Object.entries(byService)
      .sort((a, b) => b[1].count - a[1].count)

    return {
      totalBookings: list.length,
      validCount: validBookings.length,
      completedCount: completedBookings.length,
      totalRevenue,
      completedRevenue,
      byBarber,
      topServices
    }
  }, [filteredBookings])

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtro de Período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-500" /> Relatórios e Estatísticas Gerais
        </h2>

        {/* Botões de Período */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-zinc-400 ml-2" />
          <button
            onClick={() => setPeriodFilter("today")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${periodFilter === "today" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriodFilter("month")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${periodFilter === "month" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriodFilter("all")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${periodFilter === "all" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Tudo
          </button>
        </div>
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
          <p className="text-[11px] text-zinc-500">Baseado nos agendamentos do período</p>
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
          <p className="text-[11px] text-zinc-500">Excluindo cancelados</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Atendimentos Concluídos</span>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.completedCount}</p>
          <p className="text-[11px] text-zinc-500">Finalizados com sucesso</p>
        </div>
      </div>

      {/* Grid Inferior: Desempenho por Barbeiro + Ranking de Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Barbeiro */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" /> Desempenho por Profissional
          </h3>

          <div className="space-y-3">
            {Object.keys(stats.byBarber).length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Nenhum dado registrado para este período.</p>
            ) : (
              Object.entries(stats.byBarber).map(([barberName, data]) => (
                <div key={barberName} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{barberName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{data.count} atendimento(s)</p>
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

        {/* Ranking de Serviços Mais Realizados */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scissors className="w-4 h-4 text-red-500" /> Serviços Mais Realizados (Ranking)
          </h3>

          <div className="space-y-3">
            {stats.topServices.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Nenhum serviço registrado para este período.</p>
            ) : (
              stats.topServices.map(([serviceName, data], index) => (
                <div key={serviceName} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-950 border border-red-800 text-red-400 text-xs font-bold rounded-full">
                      {index + 1}º
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{serviceName}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{data.count} vez(es) agendado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-400">
                      R$ {data.revenue.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}