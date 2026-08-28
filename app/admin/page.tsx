"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Scissors,
  LogOut,
  Home,
  Calendar,
  Wrench,
  Users,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";

import { AdminLogin } from "./components/AdminLogin";
import { BookingsTab } from "./components/BookingsTab";
import { ServicesTab } from "./components/ServicesTab";
import { SettingsTab, DaySchedule } from "./components/SettingsTab";
import { BarbersTab } from "./components/BarbersTab";
import { PermissionsTab } from "./components/PermissionsTab";
import { ReportsTab } from "./components/ReportsTab";

const defaultSchedules: DaySchedule[] = [
  { dayOfWeek: "segunda", label: "Segunda-feira", isOpen: true, openTime: "08:00", closeTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "terca", label: "Terça-feira", isOpen: true, openTime: "08:00", closeTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "quarta", label: "Quarta-feira", isOpen: true, openTime: "08:00", closeTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "quinta", label: "Quinta-feira", isOpen: true, openTime: "08:00", closeTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "sexta", label: "Sexta-feira", isOpen: true, openTime: "08:00", closeTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "sabado", label: "Sábado", isOpen: true, openTime: "08:00", closeTime: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  { dayOfWeek: "domingo", label: "Domingo", isOpen: false, openTime: "08:00", closeTime: "14:00", lunchStart: "12:00", lunchEnd: "13:00" },
];

export default function AdminPage() {
  const [session, setSession] = useState<{
    username: string;
    role: string;
  } | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "bookings" | "services" | "barbers" | "settings" | "permissions" | "reports"
  >("bookings");

  const [rolePermissions, setRolePermissions] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>("geral");
  const [schedules, setSchedules] = useState<DaySchedule[]>(defaultSchedules);

  const isDev = session?.role === "DEV";
  const hasFullAccess = session?.role === "ADM" || isDev;

  useEffect(() => {
    const local = localStorage.getItem("admin_session");
    if (local) {
      try {
        setSession(JSON.parse(local));
      } catch (e) {
        localStorage.removeItem("admin_session");
      }
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchRolePermissions();
      fetchBarbers();
      fetchAllBookingsForReports();
    }
  }, [session]);

  const fetchRolePermissions = async () => {
    if (!session) return;
    if (hasFullAccess) {
      setRolePermissions({
        can_manage_services: true,
        can_manage_barbers: true,
        can_manage_bookings: true,
        can_manage_schedule: true,
        can_manage_schedules: true,
        can_manage_reports: true,
      });
      return;
    }

    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_name", session.role)
      .maybeSingle();

    if (!error && data) {
      setRolePermissions(data);
    }
  };

  useEffect(() => {
    if (session) {
      if (activeTab === "bookings" || activeTab === "reports") fetchAllBookingsForReports();
      if (activeTab === "services") fetchServices();
      if (activeTab === "settings") fetchSchedulesForContext();
    }
  }, [session, selectedDate, activeTab, selectedBarber]);

  const fetchBarbers = async () => {
    const { data } = await supabase.from("barbers").select("*");
    if (data) {
      const filtered = data.filter((b: any) => {
        if (isDev) return true;
        const nameLower = b.name.toLowerCase();
        return !nameLower.includes("dev") && !nameLower.includes("eduardo");
      });
      setBarbers(filtered);
    }
  };

  const fetchSchedulesForContext = async () => {
    const targetId = selectedBarber === "geral" ? null : selectedBarber;
    const queryId = (!targetId || targetId === "geral") ? null : targetId;

    let query = supabase.from("barber_schedules").select("*");
    
    if (queryId === null) {
      query = query.is("barber_id", null);
    } else {
      query = query.eq("barber_id", queryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar horários:", error.message);
      return;
    }

    if (data && data.length > 0) {
      const updated = defaultSchedules.map((def) => {
        const found = data.find((d: any) => d.day_of_week === def.dayOfWeek);
        if (found) {
          return {
            ...def,
            isOpen: found.is_open ?? def.isOpen,
            openTime: found.open_time?.slice(0, 5) || def.openTime,
            closeTime: found.close_time?.slice(0, 5) || def.closeTime,
            lunchStart: found.lunch_start?.slice(0, 5) || def.lunchStart,
            lunchEnd: found.lunch_end?.slice(0, 5) || def.lunchEnd,
          };
        }
        return def;
      });
      setSchedules(updated);
    } else {
      setSchedules(defaultSchedules);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", loginUsername)
      .eq("password", loginPassword)
      .maybeSingle();

    if (error || !data) {
      alert("Usuário ou senha incorretos.");
      setLoginLoading(false);
      return;
    }

    const userSession = { username: data.username, role: data.role };
    localStorage.setItem("admin_session", JSON.stringify(userSession));
    setSession(userSession);
    setLoginLoading(false);
  };

  const fetchAllBookingsForReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (!error) {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      fetchAllBookingsForReports();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir agendamento: " + error.message);
    } else {
      fetchAllBookingsForReports();
    }
  };

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("name");
    setServices(data || []);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setSession(null);
  };

  if (!session) {
    return (
      <AdminLogin
        loginUsername={loginUsername}
        setLoginUsername={setLoginUsername}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginLoading={loginLoading}
        handleLogin={handleLogin}
      />
    );
  }

  const canSeeBookings = hasFullAccess || rolePermissions?.can_manage_bookings;
  const canSeeServices = hasFullAccess || rolePermissions?.can_manage_services;
  const canSeeBarbers = hasFullAccess || rolePermissions?.can_manage_barbers;
  const canSeeSchedules = hasFullAccess || rolePermissions?.can_manage_schedules || rolePermissions?.can_manage_schedule; 
  const canSeeReports = hasFullAccess || rolePermissions?.can_manage_reports;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <Scissors className="w-6 h-6" /> Painel ADM
            </h1>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
              Logado como:{" "}
              <span className="text-white font-semibold">
                {session.username}
              </span>
              <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800 text-[10px] font-bold">
                {session.role}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-red-500" /> Ir para o Início
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="border-b border-zinc-800 pb-4">
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {canSeeBookings && (
              <button
                onClick={() => setActiveTab("bookings")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bookings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <Calendar className="w-4 h-4" /> Agendamentos
              </button>
            )}

            {canSeeServices && (
              <button
                onClick={() => setActiveTab("services")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "services" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <Wrench className="w-4 h-4" /> Serviços
              </button>
            )}

            {canSeeBarbers && (
              <button
                onClick={() => setActiveTab("barbers")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "barbers" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <Users className="w-4 h-4" /> Colaboradores
              </button>
            )}

            {canSeeSchedules && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "settings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <Clock className="w-4 h-4" /> Horários
              </button>
            )}

            {canSeeReports && (
              <button
                onClick={() => setActiveTab("reports")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "reports" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <BarChart3 className="w-4 h-4" /> Relatórios
              </button>
            )}

            {hasFullAccess && (
              <button
                onClick={() => setActiveTab("permissions")}
                className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "permissions" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800"}`}
              >
                <Shield className="w-4 h-4" /> Permissões
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {canSeeBookings && (
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "bookings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Calendar className="w-4 h-4" /> Agendamentos
              </button>
            )}

            {canSeeServices && (
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "services" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Wrench className="w-4 h-4" /> Serviços
              </button>
            )}

            {canSeeBarbers && (
              <button
                onClick={() => setActiveTab("barbers")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "barbers" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Users className="w-4 h-4" /> Colaboradores
              </button>
            )}

            {canSeeSchedules && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Clock className="w-4 h-4" /> Horários
              </button>
            )}

            {canSeeReports && (
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "reports" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <BarChart3 className="w-4 h-4" /> Relatórios
              </button>
            )}

            {hasFullAccess && (
              <button
                onClick={() => setActiveTab("permissions")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === "permissions" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <Shield className="w-4 h-4" /> Permissões
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === "bookings" && canSeeBookings && (
          <BookingsTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            fetchBookings={fetchAllBookingsForReports}
            loading={loading}
            bookings={bookings}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}
        {activeTab === "services" && canSeeServices && <ServicesTab />}
        {activeTab === "barbers" && canSeeBarbers && <BarbersTab />}
        {activeTab === "settings" && canSeeSchedules && (
          <SettingsTab
            schedules={schedules}
            setSchedules={setSchedules}
            handleSaveSettings={async () => {
              if (!hasFullAccess && !rolePermissions?.can_manage_schedules && !rolePermissions?.can_manage_schedule) {
                alert("Você não tem permissão para alterar os horários.");
                return;
              }

              const targetBarberId = selectedBarber === "geral" ? null : selectedBarber;
              const payload = schedules.map((item) => ({
                barber_id: targetBarberId,
                day_of_week: item.dayOfWeek,
                is_open: item.isOpen,
                open_time: item.openTime,
                close_time: item.closeTime,
                lunch_start: targetBarberId !== null ? item.lunchStart : null,
                lunch_end: targetBarberId !== null ? item.lunchEnd : null,
              }));

              if (targetBarberId === null) {
                await supabase.from("barber_schedules").delete().is("barber_id", null);
              } else {
                await supabase.from("barber_schedules").delete().eq("barber_id", targetBarberId);
              }

              const { error } = await supabase.from("barber_schedules").insert(payload);

              if (error) {
                alert("Erro ao salvar: " + error.message);
                return;
              }

              alert("Horários salvos com sucesso!");
              fetchSchedulesForContext();
            }}
            barbers={barbers}
            selectedBarber={selectedBarber}
            setSelectedBarber={setSelectedBarber}
          />
        )}
        {activeTab === "reports" && <ReportsTab bookings={bookings} onDeleteBooking={handleDeleteBooking} />}
        {activeTab === "permissions" && hasFullAccess && <PermissionsTab />}
      </div>
    </div>
  );
}