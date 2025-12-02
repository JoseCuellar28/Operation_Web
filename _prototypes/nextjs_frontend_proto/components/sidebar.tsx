"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface MenuItemProps {
  label: string
  icon: React.ReactNode
  children?: MenuItemProps[]
}

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(isCollapsed)

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    onToggleCollapse?.(newState)
  }

  const menuItems: MenuItemProps[] = [
    {
      label: "Operaciones Diarias",
      icon: "📋",
      children: [
        { label: "Gestión Operativa", icon: "📊" },
        { label: "Gestión de Cuadrillas", icon: "👥" },
        { label: "Gestión de Stock", icon: "📦" },
      ],
    },
    {
      label: "Seguimiento",
      icon: "👁️",
      children: [
        { label: "Seguimiento de Proyectos", icon: "🎯" },
        { label: "Asistencia", icon: "✓" },
        { label: "Control Vehicular", icon: "🚗" },
        { label: "Reportes / Registros", icon: "📄" },
      ],
    },
    {
      label: "Configuración",
      icon: "⚙️",
      children: [
        { label: "Crea tus Colaboradores", icon: "👤" },
        { label: "Crea tus Proyectos", icon: "🎯" },
        { label: "Crea tus Vehículos", icon: "🚗" },
        { label: "Crea tus Materiales", icon: "🔧" },
        { label: "Gestión de Formatos", icon: "📄" },
        { label: "Configuración de Sistema", icon: "⚙️" },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        "h-full flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white">
              OCA
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">OperationSmart</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestión Integral</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white">
            OCA
          </div>
        )}

        {/* Collapse/Expand Button */}
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() => toggleExpand(item.label.toLowerCase())}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                expandedItems.includes(item.label.toLowerCase())
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",
              )}
              title={collapsed ? item.label : ""}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </div>
              {!collapsed && item.children && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    expandedItems.includes(item.label.toLowerCase()) ? "rotate-180" : "",
                  )}
                />
              )}
            </button>

            {/* Submenu */}
            {!collapsed && item.children && expandedItems.includes(item.label.toLowerCase()) && (
              <div className="mt-1 ml-4 space-y-1 border-l border-slate-300 dark:border-slate-600 pl-4">
                {item.children.map((child) => (
                  <button
                    key={child.label}
                    className="w-full text-left px-3 py-2 rounded text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2">
                      <span>{child.icon}</span>
                      <span>{child.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Theme Toggle and User Section */}
      <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tema
              </label>
              <ThemeToggle />
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}

        {/* User Profile */}
        <button
          className={cn(
            "flex items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
            collapsed ? "justify-center p-2" : "w-full gap-3 px-3 py-2",
          )}
          title={collapsed ? "admin" : ""}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
