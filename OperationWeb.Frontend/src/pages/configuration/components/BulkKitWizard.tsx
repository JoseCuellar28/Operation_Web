import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertTriangle, X, FileSpreadsheet, ArrowRight, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkKitWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveBatch: (kits: any[]) => void;
}

// Intermediate structure for parsing flat rows
interface FlatKitRow {
    rowNum: number;
    nombre_kit: string;
    tipo_servicio: string;
    cod_material: string;
    cantidad: number;
    destino: string;
    errors: string[];
}

// Final aggregated structure for validation/preview
interface ParsedKit {
    nombre_kit: string;
    tipo_servicio: string;
    items: { material: string, cantidad: number, destino: string }[];
    isValid: boolean;
    errors: string[];
}

export default function BulkKitWizard({ isOpen, onClose, onSaveBatch }: BulkKitWizardProps) {
    const [step, setStep] = useState(1);
    const [parsedKits, setParsedKits] = useState<ParsedKit[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedKit, setExpandedKit] = useState<string | null>(null);
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

            // 1. Parse Flat Rows
            const flatRows: FlatKitRow[] = data.map((row: any, idx: number) => {
                const errors: string[] = [];
                const nombre = row['NOMBRE_KIT'] || '';
                const servicio = row['TIPO_SERVICIO']?.toString().toUpperCase() || 'INSTALACION';
                const mat = row['COD_MATERIAL'] || '';
                const cant = parseInt(row['CANTIDAD'] || '0');
                const dest = row['DESTINO_CUSTODIA']?.toString().toUpperCase() || 'DNI';

                if (!nombre) errors.push('Falta Nombre Kit');
                if (!mat) errors.push('Falta Material');
                if (cant <= 0) errors.push('Cantidad inválida');

                return {
                    rowNum: idx + 2, // Excel row
                    nombre_kit: nombre,
                    tipo_servicio: servicio,
                    cod_material: mat,
                    cantidad: cant,
                    destino: dest,
                    errors
                };
            });

            // 2. Group by Kit Name
            const grouped: Record<string, ParsedKit> = {};

            flatRows.forEach(row => {
                if (!row.nombre_kit) return; // Skip invalid rows in grouping for now

                if (!grouped[row.nombre_kit]) {
                    grouped[row.nombre_kit] = {
                        nombre_kit: row.nombre_kit,
                        tipo_servicio: row.tipo_servicio,
                        items: [],
                        isValid: true,
                        errors: []
                    };
                }

                // Add item
                grouped[row.nombre_kit].items.push({
                    material: row.cod_material,
                    cantidad: row.cantidad,
                    destino: row.destino
                });

                // Aggregate Row Errors into Kit Errors
                if (row.errors.length > 0) {
                    grouped[row.nombre_kit].isValid = false;
                    grouped[row.nombre_kit].errors.push(`Fila ${row.rowNum}: ${row.errors.join(', ')}`);
                }
            });

            // 3. Kit-Level Validation
            const finalized = Object.values(grouped).map(kit => {
                if (kit.items.length === 0) {
                    kit.isValid = false;
                    kit.errors.push('El kit no tiene ítems');
                }
                if (!['INSTALACION', 'MANTENIMIENTO'].includes(kit.tipo_servicio)) {
                    kit.isValid = false;
                    kit.errors.push(`Servicio inválido: ${kit.tipo_servicio}`);
                }
                return kit;
            });

            setParsedKits(finalized);
            setIsProcessing(false);
            setStep(2);
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { NOMBRE_KIT: 'Kit HFC Básico', TIPO_SERVICIO: 'INSTALACION', COD_MATERIAL: 'MAT-001', CANTIDAD: 1, DESTINO_CUSTODIA: 'DNI' },
            { NOMBRE_KIT: 'Kit HFC Básico', TIPO_SERVICIO: 'INSTALACION', COD_MATERIAL: 'MAT-002', CANTIDAD: 5, DESTINO_CUSTODIA: 'DNI' },
            { NOMBRE_KIT: 'Kit Mantenimiento', TIPO_SERVICIO: 'MANTENIMIENTO', COD_MATERIAL: 'MAT-003', CANTIDAD: 2, DESTINO_CUSTODIA: 'PLACA' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Kits");
        XLSX.writeFile(wb, "Plantilla_Kits.xlsx");
    };

    const handleSave = () => {
        const validOnes = parsedKits.filter(k => k.isValid);
        // Transform to final App structure
        const toSave = validOnes.map(k => ({
            nombre_kit: k.nombre_kit,
            tipo_servicio: k.tipo_servicio,
            composicion_kit: k.items.map((item, idx) => ({
                id: Date.now() + idx, // Temp ID
                materialId: item.material,
                cantidad: item.cantidad,
                destinoCustodia: item.destino
            }))
        }));
        onSaveBatch(toSave);
        onClose();
        setStep(1);
        setParsedKits([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileSpreadsheet className="text-green-600" size={20} />
                        Importación Masiva de Kits (Recetas)
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
                        Validación
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
                            <p className="mt-2 text-xs text-gray-500">
                                El archivo debe contener filas repetidas por cada material del kit.
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={16} /> {parsedKits.filter(d => d.isValid).length} Kits Válidos</span>
                                    <span className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle size={16} /> {parsedKits.filter(d => !d.isValid).length} Errores</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 w-10"></th>
                                            <th className="px-4 py-2">Estado</th>
                                            <th className="px-4 py-2">Nombre Kit</th>
                                            <th className="px-4 py-2">Servicio</th>
                                            <th className="px-4 py-2">Items</th>
                                            <th className="px-4 py-2">Errores</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedKits.map((kit, idx) => (
                                            <>
                                                <tr key={idx} className={`hover:bg-gray-50 cursor-pointer ${kit.isValid ? 'bg-white' : 'bg-red-50'}`} onClick={() => setExpandedKit(expandedKit === kit.nombre_kit ? null : kit.nombre_kit)}>
                                                    <td className="px-4 py-2">
                                                        {expandedKit === kit.nombre_kit ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                                    </td>
                                                    <td className="px-4 py-2">{kit.isValid ? <CheckCircle size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</td>
                                                    <td className="px-4 py-2 font-medium">{kit.nombre_kit}</td>
                                                    <td className="px-4 py-2">{kit.tipo_servicio}</td>
                                                    <td className="px-4 py-2">{kit.items.length}</td>
                                                    <td className="px-4 py-2 text-red-600 text-xs">{kit.errors.join(', ')}</td>
                                                </tr>
                                                {expandedKit === kit.nombre_kit && (
                                                    <tr className="bg-gray-50">
                                                        <td colSpan={6} className="px-8 py-2">
                                                            <table className="w-full text-xs border rounded bg-white">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="px-2 py-1">Material</th>
                                                                        <th className="px-2 py-1">Cant.</th>
                                                                        <th className="px-2 py-1">Destino</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {kit.items.map((item, i) => (
                                                                        <tr key={i} className="border-t border-gray-100">
                                                                            <td className="px-2 py-1">{item.material}</td>
                                                                            <td className="px-2 py-1">{item.cantidad}</td>
                                                                            <td className="px-2 py-1">{item.destino}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
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
                            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar Kits <ArrowRight size={18} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
