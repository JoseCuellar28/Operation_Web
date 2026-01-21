import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
}

export function Table<T>({ data, columns, keyExtractor, isLoading, onRowClick }: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full p-8 text-center text-gray-500">
                Cargando datos...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-8 text-center text-gray-500 border rounded-lg bg-white">
                No se encontraron registros.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={() => onRowClick && onRowClick(item)}
                            className={onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                        >
                            {columns.map((col, idx) => (
                                <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
