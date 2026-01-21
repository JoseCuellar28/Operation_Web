import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangle, X, FileSpreadsheet, ArrowRight, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkFormatWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveBatch: (formats: any[]) => void;
}

interface ParsedFormat {
    nombre: string;
    control_series: boolean;
    inicio: number | null;
    fin: number | null;
    isValid: boolean;
    errors: string[];
}

export default function BulkFormatWizard({ isOpen, onClose, onSaveBatch }: BulkFormatWizardProps) {
    const [step, setStep] = useState(1);
    const [parsedData, setParsedData] = useState<ParsedFormat[]>([]);
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

            const validated: ParsedFormat[] = data.map((row: any) => {
                const errors: string[] = [];
                const nombre = row['NOMBRE_FORMATO'] || 'Sin Nombre';
                const control = row['CONTROL_SERIES']?.toString().toUpperCase() === 'SI';
                let inicio = null;
                let fin = null;

                if (control) {
                    inicio = parseInt(row['RANGO_INICIO']);
                    fin = parseInt(row['RANGO_FIN']);

                    if (isNaN(inicio) || isNaN(fin)) errors.push('Rangos inválidos');
                    else if (inicio >= fin) errors.push('Inicio mayor que Fin');
                }

                return {
                    nombre,
                    control_series: control,
                    inicio,
                    fin,
                    isValid: errors.length === 0,
                    errors
                };
            });

            setParsedData(validated);
            setIsProcessing(false);
            setStep(2);
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { NOMBRE_FORMATO: 'Acta de Instalación', CONTROL_SERIES: 'SI', RANGO_INICIO: 100, RANGO_FIN: 200 },
            { NOMBRE_FORMATO: 'Checklist Diario', CONTROL_SERIES: 'NO', RANGO_INICIO: '', RANGO_FIN: '' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Formatos");
        XLSX.writeFile(wb, "Plantilla_Formatos.xlsx");
    };

    const handleSave = () => {
        const validOnes = parsedData.filter(v => v.isValid);
        const toSave = validOnes.map(v => ({
            nombre: v.nombre,
            control_series: v.control_series,
            rango_inicio: v.inicio,
            rango_fin: v.fin
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
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" size={20} />
                        Importación Masiva de Formatos
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="flex items-center justify-center py-4 border-b border-gray-100 bg-white">
                    <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>1</div>
                        Cargar
                    </div>
                    <div className="w-12 h-px bg-gray-200 mx-4" />
                    <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>2</div>
                        Revisión
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div
                                className="w-full max-w-xl h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isProcessing ? <Loader2 className="animate-spin text-blue-500 mb-4" size={48} /> : <Upload className="text-gray-400 mb-4" size={48} />}
                                <p className="text-gray-600 font-medium">Click para cargar archivo Excel</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            </div>
                            <button onClick={handleDownloadTemplate} className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-2">
                                <FileSpreadsheet size={16} /> Descargar Plantilla
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Estado</th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Control Series</th>
                                            <th className="px-4 py-2">Rango</th>
                                            <th className="px-4 py-2">Errores</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedData.map((row, idx) => (
                                            <tr key={idx} className={row.isValid ? 'bg-white' : 'bg-red-50'}>
                                                <td className="px-4 py-2">{row.isValid ? <CheckCircle size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</td>
                                                <td className="px-4 py-2 font-medium">{row.nombre}</td>
                                                <td className="px-4 py-2">{row.control_series ? 'SI' : 'NO'}</td>
                                                <td className="px-4 py-2">{row.control_series ? `${row.inicio} - ${row.fin}` : '-'}</td>
                                                <td className="px-4 py-2 text-red-600 text-xs">{row.errors.join(', ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    {step === 2 && (
                        <>
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">Atrás</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar <ArrowRight size={18} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
