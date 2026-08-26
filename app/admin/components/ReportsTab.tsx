"use client"

import React, { useState, useMemo } from "react"
import { BarChart3, DollarSign, Scissors, Users, CalendarCheck, TrendingUp, Filter, AlertCircle, Wallet, History, Search } from "lucide-react"

interface ReportsTabProps {
  bookings: any[]
}

export function ReportsTab({ bookings }: ReportsTabProps) {
  // Filtro de período: "all", "today", "month"
  const [periodFilter, setPeriodFilter] = useState<"all" | "today" | "month">("month")
  
  // Estado para busca interna no histórico de serviços
  const [searchTerm, setSearchTerm] = useState("")

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
    const canceledBookings = list.filter(b => b.status === "canceled")

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

    // Ticket Médio (Faturamento Total dividido pelo número de agendamentos válidos)
    const ticketMedio = validBookings.length > 0 ? totalRevenue / validBookings.length : 0

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

    const topServices = Object.entries(byService)
      .sort((a, b) => b[1].count - a[1].count)

    return {
      totalBookings: list.length,
      validCount: validBookings.length,
      completedCount: completedBookings.length,
      canceledCount: canceledBookings.length,
      totalRevenue,
      completedRevenue,
      ticketMedio,
      byBarber,
      topServices
    }
  }, [filteredBookings])

  // Função auxiliar para formatar YYYY-MM-DD para DD/MM/AAAA
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const parts = dateStr.split("-")
    if (parts.length !== 3) return dateStr
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  // Lista para o Histórico de Serviços Passados (com busca por texto)
  const historyBookings = useMemo(() => {
    let list = bookings || []
    
    // Ordena do mais recente para o mais antigo
    list = [...list].sort((a, b) => {
      const dateA = a.booking_date || ""
      const dateB = b.booking_date || ""
      if (dateA !== dateB) return dateB.localeCompare(dateA)
      return (b.booking_time || "").localeCompare(a.booking_time || "")
    })

    if (!searchTerm.trim()) return list

    const term = searchTerm.toLowerCase()
    return list.filter(item => 
      (item.client_name && item.client_name.toLowerCase().includes(term)) ||
      (item.barber_name && item.barber_name.toLowerCase().includes(term)) ||
      (item.service_name && item.service_name.toLowerCase().includes(term)) ||
      (item.client_phone && item.client_phone.includes(term))
    )
  }, [bookings, searchTerm])

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

      {/* Cards de Métricas Principais (6 cards organizados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Faturamento Estimado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-zinc-500">Baseado nos agendamentos ativos</p>
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
            <span className="text-xs font-medium uppercase">Ticket Médio</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            R$ {stats.ticketMedio.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-zinc-500">Média gasta por atendimento</p>
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

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase">Cancelados / Desistências</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400">{stats.canceledCount}</p>
          <p className="text-[11px] text-zinc-500">Agendamentos cancelados</p>
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

      {/* SEÇÃO NOVA: BANCO DE DADOS / HISTÓRICO COMPLETO DE ATENDIMENTOS PASSADOS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-red-500" /> Histórico Completo de Serviços (Banco de Dados)
          </h3>

          {/* Campo de Busca Rápida no Histórico */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar cliente, barbeiro ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
        </div>

        {historyBookings.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-400 border border-zinc-800/80 rounded-lg bg-zinc-900/40">
            Nenhum registro encontrado no histórico.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Serviço / Preço</th>
                  <th className="py-2.5 px-3">Barbeiro</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {historyBookings.map((item) => {
                  const status = (item.status || "pending").toLowerCase()
                  
                  // Estilos customizados por status
                  let statusBadge = <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-medium">Pendente</span>
                  if (status === "completed" || status === "concluído") {
                    statusBadge = <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-medium">Concluído</span>
                  } else if (status === "canceled") {
                    statusBadge = <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-medium">Cancelado</span>
                  }

                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 text-zinc-300 font-medium whitespace-nowrap">
                        {formatDate(item.booking_date)} às {item.booking_time}
                      </td>
                      <td className="py-3 px-3 text-white font-bold">
                        {item.client_name}
                        <span className="block text-[11px] font-normal text-zinc-400">{item.client_phone}</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        <span className="text-white font-semibold">{item.service_name}</span>
                        <span className="text-zinc-400 ml-1.5">({item.service_price || "R$ 0,00"})</span>
                      </td>
                      <td className="py-3 px-3 text-red-400 font-medium">
                        {item.barber_name || "Não atribuído"}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {statusBadge}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}