import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangle, X, FileSpreadsheet, ArrowRight, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveBatch: (vehicles: any[]) => void;
}

interface ParsedVehicle {
    placa: string;
    marca: string;
    tipo_activo: string; // Should be validated
    isValid: boolean;
    errors: string[];
}

export default function BulkImportWizard({ isOpen, onClose, onSaveBatch }: BulkImportWizardProps) {
    const [step, setStep] = useState(1);
    const [parsedData, setParsedData] = useState<ParsedVehicle[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Validate & Transform
            const validated: ParsedVehicle[] = data.map((row: any) => {
                const errors: string[] = [];
                const tipo = row['TIPO_ACTIVO']?.toString().toUpperCase() || '';
                const placa = row['PLACA']?.toString().toUpperCase() || '';

                if (!placa) errors.push('Placa requerida');
                // Simple duplicate check against itself (full check needs DB)
                // if (data.filter((r:any) => r.PLACA === row.PLACA).length > 1) errors.push('Placa duplicada en archivo');

                const validTypes = ['CAMIONETA', 'MINIVAN', 'MOTO'];
                if (!validTypes.includes(tipo)) errors.push(`Tipo inválido: ${tipo}`);

                return {
                    placa,
                    marca: row['MARCA'] || 'Desconocido',
                    tipo_activo: tipo,
                    isValid: errors.length === 0,
                    errors
                };
            });

            // Check for duplicates within the file
            const placaCounts: Record<string, number> = {};
            validated.forEach(v => { placaCounts[v.placa] = (placaCounts[v.placa] || 0) + 1; });

            validated.forEach(v => {
                if (placaCounts[v.placa] > 1) {
                    v.isValid = false;
                    v.errors.push('Placa duplicada en este archivo');
                }
            });

            setParsedData(validated);
            setIsProcessing(false);
            setStep(2);
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        // Generate simple template
        const ws = XLSX.utils.json_to_sheet([
            { PLACA: 'ABC-123', MARCA: 'Toyota', TIPO_ACTIVO: 'CAMIONETA' },
            { PLACA: 'XYZ-987', MARCA: 'Honda', TIPO_ACTIVO: 'MOTO' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        XLSX.writeFile(wb, "Plantilla_Vehiculos.xlsx");
    };

    const handleSave = () => {
        const validOnes = parsedData.filter(v => v.isValid);
        // map to final structure
        const toSave = validOnes.map(v => ({
            placa: v.placa,
            marca: v.marca,
            tipo_activo: v.tipo_activo,
            max_volumen: v.tipo_activo === 'MOTO' ? 'BAJO' : 'ALTO', // Default logic
            estado: 'OPERATIVO'
        }));
        onSaveBatch(toSave);
        onClose();
        setStep(1);
        setParsedData([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" size={20} />
                        Importación Masiva de Flota
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-center py-4 border-b border-gray-100 bg-white">
                    <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>1</div>
                        Cargar Archivo
                    </div>
                    <div className="w-12 h-px bg-gray-200 mx-4" />
                    <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>2</div>
                        Validación
                    </div>
                    <div className="w-12 h-px bg-gray-200 mx-4" />
                    <div className={`flex items-center gap-2 text-sm font-medium ${step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>3</div>
                        Confirmación
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div
                                className="w-full max-w-xl h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isProcessing ? (
                                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                                ) : (
                                    <Upload className="text-gray-400 mb-4" size={48} />
                                )}
                                <p className="text-gray-600 font-medium">Click para cargar archivo Excel/CSV</p>
                                <p className="text-xs text-gray-400 mt-2">Arrastra y suelta o explora</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <button
                                onClick={handleDownloadTemplate}
                                className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-2"
                            >
                                <FileSpreadsheet size={16} />
                                Descargar Plantilla Estándar
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                        <CheckCircle size={16} />
                                        {parsedData.filter(d => d.isValid).length} Válidos
                                    </span>
                                    <span className="flex items-center gap-1 text-red-600 font-medium">
                                        <AlertTriangle size={16} />
                                        {parsedData.filter(d => !d.isValid).length} Errores
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-700">Estado</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Placa</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Marca</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Tipo</th>
                                            <th className="px-4 py-2 font-medium text-gray-700">Errores</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedData.map((row, idx) => (
                                            <tr key={idx} className={row.isValid ? 'bg-white' : 'bg-red-50'}>
                                                <td className="px-4 py-2">
                                                    {row.isValid ? <CheckCircle size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                                                </td>
                                                <td className="px-4 py-2 font-medium">{row.placa}</td>
                                                <td className="px-4 py-2">{row.marca}</td>
                                                <td className="px-4 py-2">{row.tipo_activo}</td>
                                                <td className="px-4 py-2 text-red-600 text-xs">
                                                    {row.errors.join(', ')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    {step === 2 && (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={parsedData.filter(d => !d.isValid).length > 0} // Strict: No errors allowed? User said "Deshabilitado si hay errores ROJOS"
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium text-white ${parsedData.filter(d => !d.isValid).length > 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                Guardar {parsedData.filter(d => d.isValid).length} Vehículos
                                <ArrowRight size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
