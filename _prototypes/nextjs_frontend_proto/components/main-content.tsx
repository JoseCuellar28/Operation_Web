"use client"

import { useState } from "react"
import { Download, Upload, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CollaboratorsTable } from "@/components/collaborators-table"

export function MainContent() {
  const [filterText, setFilterText] = useState("")

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Actions Bar */}
        <Card className="p-4 border-slate-200 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                <Download className="w-4 h-4" />
                Descargar Archivo
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Upload className="w-4 h-4" />
                Cargar Archivo
              </Button>
              <Button className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                <Plus className="w-4 h-4" />
                Crear Nuevo
              </Button>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <Input
                placeholder="Buscar..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="flex-1 lg:w-48 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
              <Button
                variant="outline"
                className="gap-2 bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 dark:border-slate-700 overflow-hidden dark:bg-slate-900">
          <CollaboratorsTable searchFilter={filterText} />
        </Card>
      </div>
    </main>
  )
}
