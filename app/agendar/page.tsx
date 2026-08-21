"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scissors, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { BookingData } from "@/types/booking";
import { Step1UserData } from "@/components/booking/Step1UserData";
import { Step2Services } from "@/components/booking/Step2Services";
import { Step3Barbers } from "@/components/booking/Step3Barbers";
import { Step4DateTime } from "@/components/booking/Step4DateTime";
import { Step5Summary } from "@/components/booking/Step5Summary";

export default function AgendarPage() {
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [booking, setBooking] = useState<BookingData>({
    clientName: "",
    clientPhone: "",
    service: null,
    barber: null,
    date: "",
    time: "",
  });

  const resetForm = () => {
    setIsSubmitted(false);
    setStep(1);
    setBooking({
      clientName: "",
      clientPhone: "",
      service: null,
      barber: null,
      date: "",
      time: "",
    });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Cabeçalho de Navegação */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Início
            </Button>
          </Link>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-red-600"
                    : i < step
                      ? "w-2 bg-zinc-600"
                      : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-red-500" /> Agendar Horário
          </h1>
          <p className="text-xs text-zinc-400">Etapa {step} de 5</p>
        </div>

        {/* Conteúdo dos Passos */}
        {isSubmitted ? (
          <Card className="bg-zinc-900 border-emerald-800/50 text-zinc-100 p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">
              Agendamento Realizado com Sucesso!
            </h3>
            <div className="text-sm text-zinc-300 bg-zinc-950/60 p-4 rounded-lg space-y-2 border border-zinc-800 text-left">
              <p>
                <strong className="text-zinc-100">Cliente:</strong>{" "}
                {booking.clientName}
              </p>
              <p>
                <strong className="text-zinc-100">Telefone:</strong>{" "}
                {booking.clientPhone}
              </p>
              <p>
                <strong className="text-zinc-100">Serviço:</strong>{" "}
                {booking.service?.name} ({booking.service?.price})
              </p>
              <p>
                <strong className="text-zinc-100">Barbeiro:</strong>{" "}
                {booking.barber?.name}
              </p>
              <p>
                <strong className="text-zinc-100">Data:</strong>{" "}
                {booking.date
                  ? new Date(booking.date + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                    )
                  : ""}
              </p>
              <p>
                <strong className="text-zinc-100">Horário:</strong>{" "}
                {booking.time}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Fazer outro agendamento
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
            {step === 1 && (
              <Step1UserData
                name={booking.clientName}
                phone={booking.clientPhone}
                onChangeName={(val) =>
                  setBooking((prev) => ({ ...prev, clientName: val }))
                }
                onChangePhone={(val) =>
                  setBooking((prev) => ({ ...prev, clientPhone: val }))
                }
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2Services
                selectedService={booking.service}
                onSelectService={(val) =>
                  setBooking((prev) => ({ ...prev, service: val }))
                }
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3Barbers
                selectedBarber={booking.barber}
                onSelectBarber={(val) =>
                  setBooking((prev) => ({ ...prev, barber: val }))
                }
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4DateTime
                selectedDate={booking.date}
                selectedTime={booking.time}
                selectedBarber={booking.barber}
                onSelectDate={(date) =>
                  setBooking((prev) => ({ ...prev, date }))
                }
                onSelectTime={(time) =>
                  setBooking((prev) => ({ ...prev, time }))
                }
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <Step5Summary
                booking={booking}
                onFinish={() => setIsSubmitted(true)}
                onBack={() => setStep(4)}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
