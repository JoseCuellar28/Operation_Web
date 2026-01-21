import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
// import { supabase } from '../connections/supabase'; // Removed

type SourceFormat = 'calidda' | 'luz_del_sur' | 'interno';

type ValidationStatus = 'ok' | 'warning' | 'error';

interface JobRow {
  id: string;
  code: string;
  client: string;
  work_type: string;
  address: string;
  district: string;
  zone: string;
  scheduled_date: string;
  priority: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  validationStatus: ValidationStatus;
  validationMessage: string;
}

interface InboxViewProps {
  onViewChange?: (view: string) => void;
}

export default function InboxView({ onViewChange }: InboxViewProps) {
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>('calidda');
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof JobRow } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Por favor, carga un archivo Excel válido (.xlsx o .xls)');
      return;
    }

    setIsProcessing(true);
    try {
      const parsedJobs = await parseExcelFile(file);
      setJobs(parsedJobs);
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      alert('Error al procesar el archivo. Verifica el formato.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Helper to find a key fuzzy matching our targets (Robust Logic from Test Suite)
  const findKey = (row: any, targets: string[]): string | undefined => {
    const keys = Object.keys(row);
    for (const key of keys) {
      // AGGRESSIVE NORMALIZATION:
      // 1. Upper case
      // 2. Remove accents
      // 3. Remove ALL non-alphanumeric characters (dots, spaces, underscores, colons)
      const cleanKey = key.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "");

      // Exact match against targets (which must also be clean)
      if (targets.includes(cleanKey)) return key;

      // Substring check allowed for long targets
      if (targets.some(t => t.length > 3 && cleanKey.includes(t))) return key;
    }
    return undefined;
  };

  const mapField = (row: any, possibleFields: string[]): string => {
    // Normalize targets to match the aggressive key normalization
    const normalizedTargets = possibleFields.map(t =>
      t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "")
    );

    const foundKey = findKey(row, normalizedTargets);
    if (foundKey) {
      const val = row[foundKey];
      if (val !== undefined && val !== null && val !== '') return String(val).trim();
    }
    return '';
  };

  const determinePriority = (row: any): string => {
    const priority = mapField(row, ['Prioridad', 'PRIORIDAD', 'Priority', 'prioridad']);
    if (priority) return priority.toLowerCase();

    const estado = mapField(row, ['ESTADO', 'Estado', 'STATE']);
    if (estado.toLowerCase().includes('urgente')) return 'urgente';
    if (estado.toLowerCase().includes('prioritario')) return 'alta';

    return 'media';
  };

  const buildNotes = (row: any): string => {
    const notes: string[] = [];

    const inspector = mapField(row, ['INSPECTOR ASIGNADO', 'Inspector', 'SUPERVISOR OCA GLOBAL']);
    if (inspector) notes.push(`Inspector: ${inspector}`);

    const empresa = mapField(row, ['EMPRESA INSTALADORA', 'Empresa']);
    if (empresa) notes.push(`Empresa: ${empresa}`);

    const habilitador = mapField(row, ['HABILITADOR']);
    if (habilitador) notes.push(`Habilitador: ${habilitador}`);

    const comentario = mapField(row, ['COMENTARIO', 'Comentario', 'OBS.2']);
    if (comentario) notes.push(`Comentario: ${comentario}`);

    const categoria = mapField(row, ['CATEGORIA', 'Categoría']);
    if (categoria) notes.push(`Categoría: ${categoria}`);

    const piso = mapField(row, ['PISO SAP', 'Piso']);
    if (piso) notes.push(`Piso: ${piso}`);

    const celular = mapField(row, ['CELULAR', 'Teléfono']);
    if (celular) notes.push(`Celular: ${celular}`);

    const dni = mapField(row, ['DNI CLIENTE', 'DNI']);
    if (dni) notes.push(`DNI: ${dni}`);

    return notes.join(' | ');
  };

  const parseExcelFile = (file: File): Promise<JobRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<any>(firstSheet);

          const LAT_TARGETS = ['LATITUD', 'LATITUDE', 'LAT', 'Y', 'COORD_LAT', 'COORD_Y'];
          const LNG_TARGETS = ['LONGITUD', 'LONGITUDE', 'LNG', 'LON', 'LONG', 'X', 'COORD_LON', 'COORD_LNG', 'COORD_X'];

          const parsedJobs: JobRow[] = rows.map((row, index) => {
            const rawLat = mapField(row, LAT_TARGETS);
            const rawLng = mapField(row, LNG_TARGETS);

            // Clean values (remove quotes, spaces, fix commas)
            const cleanLat = rawLat ? rawLat.replace(/'/g, '').replace(',', '.').replace(/\s/g, '') : null;
            const cleanLng = rawLng ? rawLng.replace(/'/g, '').replace(',', '.').replace(/\s/g, '') : null;

            const latNum = cleanLat ? parseFloat(cleanLat) : null;
            const lngNum = cleanLng ? parseFloat(cleanLng) : null;

            const job: JobRow = {
              id: `temp-${Date.now()}-${index}`,
              code: mapField(row, ['Solicitud', 'SOLICITUD', 'Código', 'Code', 'codigo', 'N INST']),
              client: row['CLIENTE'] || row['USUARIO FISE'] || getClientFromFormat(sourceFormat),
              work_type: mapField(row, ['Tipo de instalación', 'TIPO DE HAB', 'Tipo', 'Type', 'tipo']) || 'instalación',
              address: mapField(row, ['DIRECCION', 'DIRECCIÓN SAP', 'Dirección', 'Address', 'direccion']),
              district: mapField(row, ['Distrito', 'DISTRITO', 'District', 'distrito']),
              zone: mapField(row, ['UBICACIÓN', 'Zona', 'Zone', 'zona', 'MANIFOLD', 'SECTOR', 'Sector']),
              scheduled_date: mapField(row, ['Fecha', 'Date', 'fecha']),
              priority: determinePriority(row),
              notes: buildNotes(row),
              latitude: latNum,
              longitude: lngNum,
              validationStatus: 'ok',
              validationMessage: ''
            };

            // Fallback: If Lat/Lng missing, check if they are hidden in "Zone" / "Sector" / "Ubicación"
            // Example format: "-12.040, -77.030" or "-12.040 -77.030"
            if (!job.latitude && !job.longitude && job.zone) {
              // Look for two float numbers separated by comma or space
              const coordMatch = job.zone.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
              if (coordMatch) {
                const part1 = parseFloat(coordMatch[1]);
                const part2 = parseFloat(coordMatch[2]);

                // Heuristic: Lat is usually between -90 and 90, Lng between -180 and 180.
                // In Peru/Latam: Lat is ~ -3 to -18, Lng ~ -70 to -81.
                // If both are negative, Y is Lat, X is Lng.

                // Assuming standard Order: Lat, Lng
                job.latitude = part1;
                job.longitude = part2;

                // If "Zone" was just coords, maybe clean it? Or keep it?
                // User said "created a sector column WHERE lat/long is", implying Zone IS the coords.
                // Let's explicitly mark it as found.
              }
            }

            return validateJobRow(job);
          });

          resolve(parsedJobs);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsBinaryString(file);
    });
  };

  const getClientFromFormat = (format: SourceFormat): string => {
    const clients = {
      calidda: 'Calidda',
      luz_del_sur: 'Luz del Sur',
      interno: 'OCA'
    };
    return clients[format];
  };

  const validateJobRow = (job: JobRow): JobRow => {
    if (!job.address || job.address.trim() === '') {
      return {
        ...job,
        validationStatus: 'error',
        validationMessage: 'Dirección es obligatoria'
      };
    }

    if (!job.district || job.district.trim() === '') {
      return {
        ...job,
        validationStatus: 'error',
        validationMessage: 'Distrito es obligatorio'
      };
    }

    const duplicate = jobs.find(j => j.code === job.code && j.id !== job.id);
    if (duplicate && job.code) {
      return {
        ...job,
        validationStatus: 'warning',
        validationMessage: 'Código duplicado'
      };
    }

    return {
      ...job,
      validationStatus: 'ok',
      validationMessage: ''
    };
  };

  const handleCellClick = (rowId: string, field: keyof JobRow) => {
    const editableFields: (keyof JobRow)[] = ['code', 'address', 'district', 'zone', 'work_type', 'scheduled_date', 'priority', 'notes'];
    if (editableFields.includes(field)) {
      setEditingCell({ rowId, field });
    }
  };

  const handleCellChange = (rowId: string, field: keyof JobRow, value: string) => {
    const updatedJobs = jobs.map(job => {
      if (job.id === rowId) {
        const updatedJob = { ...job, [field]: value };
        return validateJobRow(updatedJob);
      }
      return job;
    });
    setJobs(updatedJobs);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const getRowBackgroundColor = (status: ValidationStatus): string => {
    switch (status) {
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-white';
    }
  };

  const validCount = jobs.filter(j => j.validationStatus === 'ok').length;
  const errorCount = jobs.filter(j => j.validationStatus === 'error').length;
  const warningCount = jobs.filter(j => j.validationStatus === 'warning').length;
  const totalCount = jobs.length;

  const handleProcess = async () => {
    if (errorCount > 0) return;

    setIsProcessing(true);
    try {
      const payload = {
        fileName: 'imported_file.xlsx', // In real app, we would store the actual name
        source: sourceFormat.toUpperCase(),
        items: jobs.map(job => ({
          code: job.code,
          client: job.client,
          work_type: job.work_type,
          address: job.address,
          district: job.district,
          zone: job.zone,
          priority: job.priority,
          scheduled_date: job.scheduled_date || null,
          notes: job.notes,
          latitude: job.latitude,
          longitude: job.longitude
        }))
      };

      // Use relative path directly, handled by Vite Proxy
      const res = await fetch(`/api/v1/work-orders/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to process batch');

      const data = await res.json();
      alert(`${totalCount} órdenes de trabajo importadas correctamente (Lote #${data.loteId})`);
      setJobs([]);

      if (onViewChange) {
        onViewChange('tablero-maestro');
      }
    } catch (error) {
      console.error('Error al procesar:', error);
      alert('Error al procesar las órdenes. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-semibold text-gray-800">Bandeja de Entrada</h2>
        <p className="text-sm text-gray-500 mt-1">Importación y validación de órdenes de trabajo</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Fuente de Datos
              </label>
              <select
                value={sourceFormat}
                onChange={(e) => setSourceFormat(e.target.value as SourceFormat)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="calidda">Cliente Calidda</option>
                <option value="luz_del_sur">Cliente Luz del Sur</option>
                <option value="interno">Interno</option>
              </select>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
              className={`relative border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center text-center">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
                    <p className="text-lg font-medium text-gray-700">Procesando archivo...</p>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                      <Upload className="h-12 w-12 text-blue-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Arrastra y suelta tu archivo Excel aquí
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      o haz clic para seleccionar un archivo
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Formatos aceptados: .xlsx, .xls</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Validación de Datos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Haz clic en las celdas resaltadas para corregir errores
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dirección
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distrito
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zona
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job.id} className={getRowBackgroundColor(job.validationStatus)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {job.validationStatus === 'ok' && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {job.validationStatus === 'error' && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            {job.validationStatus === 'warning' && (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                            {job.validationMessage && (
                              <span className="text-xs text-gray-600">{job.validationMessage}</span>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'code')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'code' ? (
                            <input
                              type="text"
                              defaultValue={job.code}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'code', e.target.value);
                                handleCellBlur();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(job.id, 'code', e.currentTarget.value);
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.code || '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {job.client}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'work_type')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'work_type' ? (
                            <input
                              type="text"
                              defaultValue={job.work_type}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'work_type', e.target.value);
                                handleCellBlur();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(job.id, 'work_type', e.currentTarget.value);
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.work_type
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'address')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'address' ? (
                            <input
                              type="text"
                              defaultValue={job.address}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'address', e.target.value);
                                handleCellBlur();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(job.id, 'address', e.currentTarget.value);
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.address || <span className="text-red-500 font-medium">Vacío</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'district')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'district' ? (
                            <input
                              type="text"
                              defaultValue={job.district}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'district', e.target.value);
                                handleCellBlur();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(job.id, 'district', e.currentTarget.value);
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.district || <span className="text-red-500 font-medium">Vacío</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'zone')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'zone' ? (
                            <input
                              type="text"
                              defaultValue={job.zone}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'zone', e.target.value);
                                handleCellBlur();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(job.id, 'zone', e.currentTarget.value);
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.zone || '-'
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCellClick(job.id, 'priority')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'priority' ? (
                            <select
                              defaultValue={job.priority}
                              onBlur={(e) => {
                                handleCellChange(job.id, 'priority', e.target.value);
                                handleCellBlur();
                              }}
                              onChange={(e) => {
                                handleCellChange(job.id, 'priority', e.target.value);
                                handleCellBlur();
                              }}
                              autoFocus
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                              <option value="urgente">Urgente</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${job.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                              job.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                                job.priority === 'media' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-gray-900">{totalCount}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Válidos:</span>
                  <span className="text-lg font-bold text-green-600">{validCount}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">Advertencias:</span>
                  <span className="text-lg font-bold text-yellow-600">{warningCount}</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">Errores:</span>
                  <span className="text-lg font-bold text-red-600">{errorCount}</span>
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={errorCount > 0 || isProcessing}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${errorCount > 0 || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Procesar y Enviar a Planificación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
