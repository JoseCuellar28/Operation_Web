import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../connections/supabase';

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
  validationStatus: 'ok' | 'error' | 'warning';
  validationMessage: string;
}

type SourceFormat = 'calidda_base' | 'luz_del_sur' | 'interno_oca';

export default function JobImportView() {
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>('calidda_base');
  const [isDragging, setIsDragging] = useState(false);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
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

  const mapField = (row: any, possibleFields: string[]): string => {
    for (const field of possibleFields) {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        return String(row[field]).trim();
      }
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

  const parseExcelFile = (file: File) => {
    return new Promise<JobRow[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<any>(firstSheet);

          const parsedJobs: JobRow[] = rows.map((row, index) => {
            const job: JobRow = {
              id: `temp-${Date.now()}-${index}`,
              code: mapField(row, ['Solicitud', 'SOLICITUD', 'Código', 'Code', 'codigo', 'N INST']),
              client: row['CLIENTE'] || row['USUARIO FISE'] || getClientFromFormat(sourceFormat),
              work_type: mapField(row, ['Tipo de instalación', 'TIPO DE HAB', 'Tipo', 'Type', 'tipo']) || 'instalación',
              address: mapField(row, ['DIRECCION', 'DIRECCIÓN SAP', 'Dirección', 'Address', 'direccion']),
              district: mapField(row, ['Distrito', 'DISTRITO', 'District', 'distrito']),
              zone: mapField(row, ['UBICACIÓN', 'Zona', 'Zone', 'zona', 'MANIFOLD']),
              scheduled_date: mapField(row, ['Fecha', 'Date', 'fecha']),
              priority: determinePriority(row),
              notes: buildNotes(row),
              validationStatus: 'ok',
              validationMessage: ''
            };

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
      calidda_base: 'Calidda',
      luz_del_sur: 'Luz del Sur',
      interno_oca: 'OCA'
    };
    return clients[format];
  };

  const validateJobRow = (job: JobRow): JobRow => {
    if (!job.address || job.address.trim() === '') {
      return {
        ...job,
        validationStatus: 'error',
        validationMessage: 'Falta dirección (campo obligatorio)'
      };
    }

    const duplicate = jobs.find(j => j.code === job.code && j.id !== job.id);
    if (duplicate) {
      return {
        ...job,
        validationStatus: 'warning',
        validationMessage: 'Posible duplicado'
      };
    }

    return {
      ...job,
      validationStatus: 'ok',
      validationMessage: ''
    };
  };

  const handleFileUpload = async (file: File) => {
    try {
      const parsedJobs = await parseExcelFile(file);
      setJobs(parsedJobs);
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      alert('Error al procesar el archivo. Asegúrese de que sea un archivo Excel válido.');
    }
  };

  const handleCellEdit = (rowId: string, field: string, value: string) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === rowId) {
          const updatedJob = { ...job, [field]: value };
          return validateJobRow(updatedJob);
        }
        return job;
      });
      return updatedJobs;
    });
    setEditingCell(null);
  };

  const handleDoubleClick = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const getRowClassName = (status: 'ok' | 'error' | 'warning') => {
    const baseClass = 'border-b border-gray-200 hover:bg-gray-50';
    if (status === 'error') return `${baseClass} bg-red-50`;
    if (status === 'warning') return `${baseClass} bg-yellow-50`;
    return `${baseClass} bg-white`;
  };

  const handleImportToDatabase = async () => {
    const errorJobs = jobs.filter(j => j.validationStatus === 'error');
    if (errorJobs.length > 0) {
      alert(`No se puede importar. Hay ${errorJobs.length} trabajos con errores críticos.`);
      return;
    }

    if (jobs.length === 0) {
      alert('No hay trabajos para importar.');
      return;
    }

    if (!confirm(`¿Desea importar ${jobs.length} trabajos a la base de datos?`)) {
      return;
    }

    setIsImporting(true);

    try {
      const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          filename: 'import-' + new Date().toISOString(),
          source_format: sourceFormat,
          total_rows: jobs.length,
          successful_rows: 0,
          error_rows: 0,
          warnings_rows: jobs.filter(j => j.validationStatus === 'warning').length,
          status: 'processing'
        })
        .select()
        .single();

      if (batchError) throw batchError;

      const jobsToInsert = jobs.map(job => ({
        code: job.code,
        client: job.client,
        work_type: job.work_type,
        address: job.address,
        district: job.district,
        zone: job.zone,
        scheduled_date: job.scheduled_date || null,
        priority: job.priority,
        status: 'pendiente',
        notes: job.notes,
        source_format: sourceFormat,
        import_batch_id: batch.id,
        raw_data: job
      }));

      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
        .select();

      if (insertError) throw insertError;

      await supabase
        .from('import_batches')
        .update({
          successful_rows: insertedJobs?.length || 0,
          status: 'completed'
        })
        .eq('id', batch.id);

      alert(`Importación exitosa: ${insertedJobs?.length || 0} trabajos importados.`);
      setJobs([]);
    } catch (error: any) {
      console.error('Error al importar:', error);
      alert(`Error al importar: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const okCount = jobs.filter(j => j.validationStatus === 'ok').length;
  const errorCount = jobs.filter(j => j.validationStatus === 'error').length;
  const warningCount = jobs.filter(j => j.validationStatus === 'warning').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Importación de Trabajos</h1>

        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Formato de Origen:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSourceFormat('calidda_base')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sourceFormat === 'calidda_base'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Calidda Base
            </button>
            <button
              onClick={() => setSourceFormat('luz_del_sur')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sourceFormat === 'luz_del_sur'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Luz del Sur
            </button>
            <button
              onClick={() => setSourceFormat('interno_oca')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sourceFormat === 'interno_oca'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Interno OCA
            </button>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
        >
          <Upload size={48} className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Arrastra tus Excels aquí
          </p>
          <p className="text-sm text-gray-500">
            o haz clic para seleccionar un archivo
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {jobs.length > 0 && (
        <>
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dirección</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Distrito</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Zona</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className={getRowClassName(job.validationStatus)}>
                        <td className="px-4 py-3">
                          {job.validationStatus === 'ok' && (
                            <CheckCircle size={18} className="text-green-600" />
                          )}
                          {job.validationStatus === 'error' && (
                            <div className="flex items-center gap-2">
                              <AlertCircle size={18} className="text-red-600" />
                              <span className="text-xs text-red-600">{job.validationMessage}</span>
                            </div>
                          )}
                          {job.validationStatus === 'warning' && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={18} className="text-yellow-600" />
                              <span className="text-xs text-yellow-600">{job.validationMessage}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.client}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.work_type}</td>
                        <td
                          className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100"
                          onDoubleClick={() => handleDoubleClick(job.id, 'address')}
                        >
                          {editingCell?.rowId === job.id && editingCell?.field === 'address' ? (
                            <input
                              type="text"
                              defaultValue={job.address}
                              autoFocus
                              onBlur={(e) => handleCellEdit(job.id, 'address', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellEdit(job.id, 'address', e.currentTarget.value);
                                }
                              }}
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            job.address || '(vacío - doble clic para editar)'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.district}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.zone}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.scheduled_date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{job.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {okCount} Listas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {errorCount} Errores
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {warningCount} Advertencias
                  </span>
                </div>
              </div>
              <button
                onClick={handleImportToDatabase}
                disabled={errorCount > 0 || isImporting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${errorCount > 0 || isImporting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <Database size={20} />
                {isImporting ? 'Importando...' : 'Importar a Base de Datos'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
