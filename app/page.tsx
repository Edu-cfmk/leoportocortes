import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Phone, Scissors } from "lucide-react"

export default function Home() {
  const services = [
    { id: 1, name: "Corte de Cabelo", price: "R$ 45,00", time: "30 min" },
    { id: 2, name: "Barba Completa", price: "R$ 35,00", time: "30 min" },
    { id: 3, name: "Combo (Cabelo + Barba)", price: "R$ 70,00", time: "50 min" },
    { id: 4, name: "Pezinho / Sobrancelha", price: "R$ 20,00", time: "15 min" },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-10">
      {/* Hero Header */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950 font-bold">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Léo Porto Cortês</h1>
          <p className="text-sm text-zinc-400 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4 text-amber-500" /> Barbearia & Estilo
          </p>
        </div>
      </div>

      {/* Lista de Serviços */}
      <section className="max-w-md mx-auto px-4 mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200 border-b border-zinc-800 pb-2">
          Nossos Serviços
        </h2>

        <div className="grid gap-3">
          {services.map((service) => (
            <Card key={service.id} className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {service.time}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-sm font-bold text-amber-500">{service.price}</p>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
                    Agendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rodapé / Contato */}
      <footer className="max-w-md mx-auto px-4 mt-8 text-center text-xs text-zinc-500 space-y-2">
        <p className="flex items-center justify-center gap-1">
          <Phone className="w-3 h-3 text-amber-500" /> (19) 99999-9999
        </p>
        <p>© 2026 Léo Porto Cortês. Todos os direitos reservados.</p>
      </footer>
    </main>
  )
}