"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Scissors, Trash2, Plus } from "lucide-react";

export function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("name");
    setServices(data || []);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return alert("Preencha o nome e o preço do serviço.");

    setLoading(true);

    const { data: barbers } = await supabase.from("barbers").select("id").limit(1);
    const firstBarberId = barbers && barbers.length > 0 ? barbers[0].id : null;

    if (!firstBarberId) {
      alert("Cadastre um colaborador na aba 'Colaboradores' primeiro.");
      setLoading(false);
      return;
    }

    const numericPrice = Number(price.replace(/\D/g, "")) || 0;

    const { error } = await supabase.from("services").insert([
      {
        id: crypto.randomUUID(),
        name,
        description,
        price_in_cents: numericPrice,
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
      fetchServices();
      alert("Serviço cadastrado com sucesso!");
    }
    setLoading(false);
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
          <Scissors className="w-5 h-5 text-red-500" /> Adicionar Novo Serviço
        </h2>

        <form onSubmit={handleAddService} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nome do Serviço (ex: Corte Degrade)"
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
            <input
              type="text"
              placeholder="Preço (ex: 45,00)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Cadastrando..." : "Cadastrar Serviço"}
          </button>
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
                  <h4 className="font-bold text-white text-sm">{service.name}</h4>
                  {service.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">{service.description}</p>
                  )}
                  <p className="text-red-500 font-semibold text-xs mt-1">
                    R$ {(service.price_in_cents / 100).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Excluir Serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}