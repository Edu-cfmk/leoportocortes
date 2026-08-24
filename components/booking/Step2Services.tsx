"use client";

import { useState, useEffect } from "react";
import { Scissors, Check, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Service } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Step2Props {
  selectedServices: Service[];
  onSelectServices: (services: Service[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Services({
  selectedServices,
  onSelectServices,
  onNext,
  onBack,
}: Step2Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("name");

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      onSelectServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      onSelectServices([...selectedServices, service]);
    }
  };

  // Agrupa os serviços por categoria (Cortes / Serviços Adicionais)
  const cortes = services.filter(
    (s) => !s.category || s.category.toLowerCase() === "cortes"
  );
  const adicionais = services.filter(
    (s) => s.category && s.category.toLowerCase() === "serviços adicionais"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-500 font-semibold">
        <Scissors className="w-5 h-5" />
        <h2 className="text-lg text-white">Passo 2: Escolha os Serviços</h2>
      </div>

      {loading ? (
        <p className="text-zinc-400 text-center py-8">Carregando serviços...</p>
      ) : services.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">
          Nenhum serviço disponível no momento.
        </p>
      ) : (
        <div className="space-y-6">
          {/* SEÇÃO DE CORTES */}
          {cortes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Cortes
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {cortes.map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  const priceFormatted = (
                    (service.price_in_cents || 0) / 100
                  )
                    .toFixed(2)
                    .replace(".", ",");

                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-red-950/20 border-red-600 shadow-lg shadow-red-950/30"
                          : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-white text-sm">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-xs text-zinc-400">
                            {service.description}
                          </p>
                        )}
                        {service.duration && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-red-500" />{" "}
                            {service.duration}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-500 text-sm whitespace-nowrap">
                          R$ {priceFormatted}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEÇÃO DE SERVIÇOS ADICIONAIS */}
          {adicionais.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Serviços Adicionais
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {adicionais.map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  const priceFormatted = (
                    (service.price_in_cents || 0) / 100
                  )
                    .toFixed(2)
                    .replace(".", ",");

                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-red-950/20 border-red-600 shadow-lg shadow-red-950/30"
                          : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-white text-sm">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-xs text-zinc-400">
                            {service.description}
                          </p>
                        )}
                        {service.duration && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-red-500" />{" "}
                            {service.duration}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-500 text-sm whitespace-nowrap">
                          R$ {priceFormatted}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTÕES DE NAVEGAÇÃO */}
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
          disabled={selectedServices.length === 0}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
        >
          Avançar para Barbeiro ({selectedServices.length} selecionado
          {selectedServices.length === 1 ? "" : "s"})
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}