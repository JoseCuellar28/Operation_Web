"use client"

import type React from "react"

import { useState } from "react"
import { X, Camera, Upload, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CollaboratorFormData {
  // Personal info
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  email: string
  telefono: string
  codigoEmpleado: string
  tipoDocumento: string
  numeroDocumento: string
  unidad: string
  area: string
  puesto: string
  jefeInmediato: string
  // Profile info
  fotoPerfil?: File
  firma?: File
}

interface CollaboratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CollaboratorModal({ isOpen, onClose }: CollaboratorModalProps) {
  const [formData, setFormData] = useState<CollaboratorFormData>({
    nombre: "L",
    apellidoPaterno: "uzdelsur",
    apellidoMaterno: "OCA",
    fechaNacimiento: "01/01/1990",
    email: "jose.arbildo@ocaglobal.com",
    telefono: "999999999",
    codigoEmpleado: "EMP000",
    tipoDocumento: "DNI",
    numeroDocumento: "12345678",
    unidad: "Proyecto Inspecciones de SST - Luz del Sur",
    area: "Operaciones",
    puesto: "Representante",
    jefeInmediato: "",
  })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setFormData((prev) => ({ ...prev, fotoPerfil: file }))
    }
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setFormData((prev) => ({ ...prev, firma: file }))
    }
  }

  const handleSave = () => {
    console.log("Guardando cambios:", formData)
    // Aquí iría la lógica para guardar los datos
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-center flex-1 text-slate-900">Colaborador</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Section - Profile */}
            <div className="lg:col-span-1">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {previewImage ? (
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photo-input"
                    className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-2 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <Camera size={16} />
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {formData.nombre} {formData.apellidoPaterno}
                  </h2>
                  <p className="text-sm text-gray-600">{formData.puesto}</p>
                </div>

                {/* Contact Info */}
                <div className="w-full space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-700">{formData.telefono}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm break-all">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">{formData.email}</span>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="w-full pt-4 border-t border-gray-200">
                  <p className="text-center font-semibold text-slate-900 mb-4">Firma</p>
                  <label
                    htmlFor="signature-input"
                    className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {signaturePreview ? (
                        <img
                          src={signaturePreview || "/placeholder.svg"}
                          alt="Firma"
                          className="w-full h-24 object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500">Click para cargar</span>
                        </>
                      )}
                    </div>
                    <input
                      id="signature-input"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 text-center mt-2">Formato permitido: PNG</p>
                </div>
              </div>
            </div>

            {/* Right Section - Form */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Section Title */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Personal y Laboral</h3>

                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno
                      </Label>
                      <Input
                        id="apellidoPaterno"
                        name="apellidoPaterno"
                        value={formData.apellidoPaterno}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno
                      </Label>
                      <Input
                        id="apellidoMaterno"
                        name="apellidoMaterno"
                        value={formData.apellidoMaterno}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento
                      </Label>
                      <div className="relative">
                        <Input
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          type="text"
                          value={formData.fechaNacimiento}
                          onChange={handleInputChange}
                          className="w-full border-gray-300 pr-10"
                        />
                        <svg
                          className="absolute right-3 top-3 w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Row 3 - Email Full Width */}
                  <div className="mb-4">
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border-gray-300"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="codigoEmpleado" className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Empleado
                      </Label>
                      <Input
                        id="codigoEmpleado"
                        name="codigoEmpleado"
                        value={formData.codigoEmpleado}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                      </Label>
                      <Select
                        value={formData.tipoDocumento}
                        onValueChange={(value) => handleSelectChange("tipoDocumento", value)}
                      >
                        <SelectTrigger className="w-full border-gray-300">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="RUC">RUC</SelectItem>
                          <SelectItem value="Carnet">Carnet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="numeroDocumento" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento
                      </Label>
                      <Input
                        id="numeroDocumento"
                        name="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={handleInputChange}
                        className="w-full border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Row 6 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="unidad" className="block text-sm font-medium text-gray-700 mb-2">
                        Unidad
                      </Label>
                      <Select value={formData.unidad} onValueChange={(value) => handleSelectChange("unidad", value)}>
                        <SelectTrigger className="w-full border-gray-300">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proyecto Inspecciones de SST - Luz del Sur">
                            Proyecto Inspecciones de SST - Luz del Sur
                          </SelectItem>
                          <SelectItem value="Otro Proyecto">Otro Proyecto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                        Área
                      </Label>
                      <Select value={formData.area} onValueChange={(value) => handleSelectChange("area", value)}>
                        <SelectTrigger className="w-full border-gray-300">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operaciones">Operaciones</SelectItem>
                          <SelectItem value="Administración">Administración</SelectItem>
                          <SelectItem value="Ventas">Ventas</SelectItem>
                          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 7 - Puesto */}
                  <div className="mb-4">
                    <Label htmlFor="puesto" className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto/Posición
                    </Label>
                    <Select value={formData.puesto} onValueChange={(value) => handleSelectChange("puesto", value)}>
                      <SelectTrigger className="w-full border-gray-300">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Representante">Representante</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Asistente">Asistente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 8 - Jefe Inmediato */}
                  <div className="mb-6">
                    <Label htmlFor="jefeInmediato" className="block text-sm font-medium text-gray-700 mb-2">
                      Jefe Inmediato
                    </Label>
                    <div className="relative">
                      <Input
                        id="jefeInmediato"
                        name="jefeInmediato"
                        value={formData.jefeInmediato}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <button className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}
