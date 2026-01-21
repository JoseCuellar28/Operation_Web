import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, Check, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { excelDateToJSDate, normalizeColumnName } from '../utils/excelUtils';
import { personalService, Employee } from '../services/personalService';

interface BulkImportWizardProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkImportWizard: React.FC<BulkImportWizardProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview, 3: Processing
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Partial<Employee>[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const processFile = async (file: File) => {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            setError('Por favor sube un archivo Excel válido (.xlsx, .xls)');
            return;
        }

        setFile(file);
        setError(null);

        try {
            const data = await parseExcel(file);
            setParsedData(data);
            setStep(2);
        } catch (err) {
            setError('Error al leer el archivo. Asegúrate de que no esté corrupto.');
            console.error(err);
        }
    };

    const parseExcel = (file: File): Promise<Partial<Employee>[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    const mappedData = jsonData.map((row: any) => {
                        // Normalized Key Lookup Helper
                        const getVal = (keys: string[]) => {
                            for (const key of keys) {
                                // Try exact match
                                if (row[key] !== undefined) return row[key];
                                // Try loose match
                                const normalizedKey = normalizeColumnName(key);
                                const foundKey = Object.keys(row).find(k => normalizeColumnName(k) === normalizedKey);
                                if (foundKey) return row[foundKey];
                            }
                            return undefined;
                        };

                        return {
                            dni: getVal(['DNI', 'CODIGO SAP']) || '',
                            inspector: getVal(['TRABAJADOR', 'NOMBRE', 'Inspector']) || '',
                            telefono: String(getVal(['TELEFONO', 'CELULAR']) || ''),
                            distrito: getVal(['DISTRITO', 'SEDE DE TRABAJO']) || '',
                            tipo: getVal(['CATEGORIA / GRUPO OCUPACIONAL', 'PUESTO', 'CARGO']) || 'OPERARIO',
                            estado: getVal(['SITUACION', 'ESTADO']) || 'ACTIVO',
                            fechaInicio: excelDateToJSDate(getVal(['FECHA DE INGRESO', 'FECHA_INICIO']))?.toISOString(),
                            fechaCese: excelDateToJSDate(getVal(['FECHA DE CESE']))?.toISOString(),
                            area: getVal(['AREA-PROYECTO', 'Area']) || '',
                            email: getVal(['CORREO CORPORATIVO', 'EMAIL']) || '',
                        } as Partial<Employee>;
                    });

                    // Filter empty rows
                    resolve(mappedData.filter(d => d.dni && d.inspector));
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const handleImport = async () => {
        setStep(3);
        try {
            await personalService.importBulk(parsedData);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Error al subir los datos al servidor.');
            setStep(2);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Carga Masiva de Personal</h2>
                        <p className="text-gray-500 text-sm mt-1">Sube tu Excel para actualizar la base de datos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div
                            className={`border-3 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <FileSpreadsheet className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Arrastra tu archivo Excel aquí</h3>
                            <p className="text-gray-500 mb-6">o haz clic para explorar</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                            />
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span>.XLSX</span>
                                <span>.XLS</span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{parsedData.length} registros</span>
                                    encontrados
                                </h3>
                                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 underline">
                                    Elegir otro archivo
                                </button>
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-gray-600">DNI</th>
                                            <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
                                            <th className="px-4 py-3 font-medium text-gray-600">Cargo</th>
                                            <th className="px-4 py-3 font-medium text-gray-600">Área</th>
                                            <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {parsedData.slice(0, 50).map((emp, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-mono text-xs">{emp.dni}</td>
                                                <td className="px-4 py-2">{emp.inspector}</td>
                                                <td className="px-4 py-2">{emp.tipo}</td>
                                                <td className="px-4 py-2">{emp.area}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {emp.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedData.length > 50 && (
                                    <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t">
                                        Mostrando primeros 50 de {parsedData.length} registros...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                            <h3 className="text-xl font-semibold text-gray-800">Procesando Carga...</h3>
                            <p className="text-gray-500">Esto puede tardar unos segundos dependiendo del tamaño del archivo.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 2 && (
                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 font-bold"
                        >
                            <Upload className="w-4 h-4" />
                            Importar {parsedData.length} Registros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
