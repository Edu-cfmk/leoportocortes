"use client"

import Link from "next/link"
import { Scissors, User, Lock, Loader2, Home } from "lucide-react"

interface AdminLoginProps {
  loginUsername: string
  setLoginUsername: (v: string) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  loginLoading: boolean
  handleLogin: (e: React.FormEvent) => void
}

export function AdminLogin({
  loginUsername, setLoginUsername,
  loginPassword, setLoginPassword,
  loginLoading, handleLogin
}: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-2 text-xs transition-colors"
      >
        <Home className="w-4 h-4 text-red-500" /> Ir para o Início
      </Link>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950/60 text-red-500 border border-red-800/50 mb-2">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Acesso Administrativo</h1>
          <p className="text-xs text-zinc-400">Entre com as credenciais de acesso</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Usuário</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                placeholder="Seu usuário"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-red-600 hover:bg-red-700 font-bold py-2.5 rounded-lg text-sm text-white flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  )
}