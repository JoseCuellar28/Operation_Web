"use client"

import React from "react"

import { useState } from "react"
import { Eye, Edit, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollaboratorsTableProps {
  searchFilter: string
}

export function CollaboratorsTable({ searchFilter }: CollaboratorsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const generateCollaborators = () => {
    const baseNames = [
      "ZAMBRANO LABRA RICARDO MANUEL",
      "LAZO GALVAN HECTOR LUIS",
      "MORENO TEVES JESSICA MELINA",
      "CARBAJAL BARRANTES CHRISTIAN ORLANDO",
      "PERALES LARA MIGUEL ANGEL",
      "RETO CARRANZA MIGUEL ANGEL",
      "FLORES PALOMINO GIANCARLO MARTIN",
      "CASTELLARES VALLADOLID RUBEN AUGUSTO",
      "MENDOZA COTRINA JOEL ANDRES",
      "FLOREZ VANEGAS FELIX GUILLERMO",
    ]

    const roles = ["CHOFER", "INSPECTOR", "ASISTENTE ADMINISTRATIVO", "SUPERVISOR", "COORDINADOR"]
    const bases = ["Base Villa", "Base Sor", "Base Central", "Base Norte", "Base Sur"]

    const collaborators = []
    for (let i = 0; i < 1139; i++) {
      collaborators.push({
        id: `I${String(103509 + i).padStart(7, "0")}`,
        name: `${baseNames[i % baseNames.length]} ${i}`,
        base: bases[i % bases.length],
        role: roles[i % roles.length],
        district: "Sin Estado",
        phone: "-",
        inspector: "-",
        type: "-",
        status: i % 10 === 0 ? "Inactivo" : "Activo",
        startDate: `${Math.floor(Math.random() * 28) + 1}/3/2025`,
        endDate: `${Math.floor(Math.random() * 28) + 1}/11/2025`,
        createdDate: "29/11/2025",
      })
    }
    return collaborators
  }

  const collaborators = generateCollaborators()

  const filteredData = collaborators.filter(
    (item) =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.id.toLowerCase().includes(searchFilter.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  React.useEffect(() => {
    handleFilterChange()
  }, [searchFilter])

  return (
    <div className="w-full space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">DNI</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">NOMBRE</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">PUESTO</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">BASE</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">ESTADO</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">FECHAS</th>
              <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{item.id}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.role}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.base}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === "Activo"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                    <div>Inicio: {item.startDate}</div>
                    <div>Fin: {item.endDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando <span className="font-semibold">{startIndex + 1}</span> a{" "}
            <span className="font-semibold">{Math.min(endIndex, filteredData.length)}</span> de{" "}
            <span className="font-semibold">{filteredData.length}</span> resultados
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 p-0 ${currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
