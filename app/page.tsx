import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scissors, MapPin, Clock, Phone, MessageSquare, Share2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-10">
      {/* 1. Hero Header */}
      <div className="relative bg-zinc-900 border-b border-zinc-800 p-6 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950 font-bold">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Léo Porto Cortês</h1>
          <p className="text-sm text-zinc-400 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4 text-amber-500" /> Barbearia & Estilo
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              Agendar Agora
            </Button>
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Baixar App (Android)
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Seção de Cartões de Info */}
      <section className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cartão Quem Somos */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-200">Quem Somos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Profissionais especializados em cortes masculinos e estilos de barba. Ambiente aconchegante com atendimento personalizado.
            </p>
          </CardContent>
        </Card>

        {/* Cartão Redes Sociais */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-lg text-zinc-200">Redes Sociais</h3>
            <p className="text-sm text-zinc-400">Siga nosso perfil para ver cortes e inspiração.</p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs">
                <Share2 className="w-4 h-4" /> Instagram
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cartão Preço Médio */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <CardContent className="p-5 space-y-2">
            <h3 className="font-bold text-lg text-zinc-200">Preço Médio</h3>
            <div className="text-sm text-zinc-400 space-y-1">
              <p>Corte: R$ 45 — Barba: R$ 35 — Combo: R$ 70</p>
              <p>Pezinho / Sobrancelha: R$ 20</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Seção Nossos Cortes */}
      <section className="max-w-md mx-auto px-4 mt-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-zinc-200">Nossos Cortes</h2>
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-zinc-800 bg-zinc-900 shadow-xl">
          <img 
            src="https://fgrdfpdtvjuzgkvbvgjh.supabase.co/storage/v1/object/public/cuts/corte1.jpg" 
            alt="Exemplo de corte da barbearia"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 4. Seção Agende seu horário */}
      <section className="max-w-md mx-auto px-4 mt-10 text-left space-y-2">
        <h2 className="text-xl font-bold text-zinc-100">Agende seu horário</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Escolha o melhor horário para você. Preencha seu nome e telefone ao agendar.
        </p>
      </section>

      {/* Rodapé / Contato */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-zinc-600 space-y-2 border-t border-zinc-800 pt-6">
        <p className="flex items-center justify-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-amber-600" /> (19) 99999-9999
        </p>
        <p>© 2026 Léo Porto Cortês. Todos os direitos reservados.</p>
      </footer>
    </main>
  )
}