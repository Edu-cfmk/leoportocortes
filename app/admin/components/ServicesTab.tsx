"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Scissors, Trash2, Plus, Edit2, X, Clock } from "lucide-react";

export function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("01:00"); // Padrão 1 hora
  const [category, setCategory] = useState("Cortes"); // Categoria padrão
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("name");
    setServices(data || []);
  };

  // Função para converter "01:35" em "1h 35min" (ou "01:00" em "1h")
  const formatDurationDisplay = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;

    if (hours === 0 && minutes === 0) return "0 min";
    if (minutes === 0) return `${hours}h`;
    if (hours === 0) return `${minutes}min`;
    return `${hours}h ${minutes}min`;
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return alert("Preencha o nome e o preço do serviço.");

    setLoading(true);

    const numericPrice = Number(price.replace(/\D/g, "")) || 0;
    // Converte para o formato legível antes de salvar no banco
    const formattedDuration = formatDurationDisplay(duration);

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update({
          name,
          description,
          price_in_cents: numericPrice,
          duration: formattedDuration,
          category,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingId);

      if (error) {
        alert("Erro ao atualizar serviço: " + error.message);
      } else {
        alert("Serviço atualizado com sucesso!");
        handleCancelEdit();
        fetchServices();
      }
    } else {
      const { data: barbers } = await supabase.from("barbers").select("id").limit(1);
      const firstBarberId = barbers && barbers.length > 0 ? barbers[0].id : null;

      if (!firstBarberId) {
        alert("Cadastre um colaborador na aba 'Colaboradores' primeiro.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("services").insert([
        {
          id: crypto.randomUUID(),
          name,
          description,
          price_in_cents: numericPrice,
          duration: formattedDuration,
          category,
          barber_id: firstBarberId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      if (error) {
        alert("Erro ao cadastrar serviço: " + error.message);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setDuration("01:00");
        setCategory("Cortes");
        fetchServices();
        alert("Serviço cadastrado com sucesso!");
      }
    }
    setLoading(false);
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description || "");
    setDuration("01:00"); // Valor padrão caso venha vazio
    setCategory(service.category || "Cortes");
    setPrice((service.price_in_cents / 100).toFixed(2).replace(".", ","));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDuration("01:00");
    setCategory("Cortes");
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchServices();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scissors className="w-5 h-5 text-red-500" />{" "}
          {editingId ? "Editar Serviço" : "Adicionar Novo Serviço"}
        </h2>

        <form onSubmit={handleSaveService} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Nome (ex: Corte Degrade)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
            <div className="flex flex-col">
              <label className="text-xs text-zinc-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              >
                <option value="Cortes">Cortes</option>
                <option value="Serviços Adicionais">Serviços Adicionais</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-400 mb-1">Duração (Horas:Minutos)</label>
              <input
                type="time"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-zinc-400 mb-1">Preço (R$)</label>
              <input
                type="text"
                placeholder="Preço (ex: 45,00)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors flex-1"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Serviço"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
          Serviços Cadastrados
        </h3>

        {services.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhum serviço cadastrado no momento.</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between bg-black border border-zinc-800 p-4 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{service.name}</h4>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                      {service.category || "Cortes"}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-red-500 font-semibold text-xs">
                      R$ {(service.price_in_cents / 100).toFixed(2).replace(".", ",")}
                    </p>
                    {service.duration && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" /> {service.duration}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 text-xs px-3"
                    title="Editar Serviço"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    title="Excluir Serviço"
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
  );
}