"use client"

import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shadow-sm">
      <div className="flex-1 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Gestión de Colaboradores</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total: <span className="font-semibold">1,139 colaboradores</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  )
}
