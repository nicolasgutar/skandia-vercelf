import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Pagination from './Pagination';

/**
 * Reusable Table Component
 * 
 * @param {Object[]} columns - Array of column definitions
 * @param {string|React.ReactNode} columns[].header - Column header
 * @param {string} [columns[].key] - Key to access in row data
 * @param {string} [columns[].className] - Classes for the header cell
 * @param {string} [columns[].cellClassName] - Classes for the body cell
 * @param {function(Object, number): React.ReactNode} [columns[].render] - Custom render function
 * 
 * @param {Object[]} data - Array of data items
 * @param {string|function} [keyField='id'] - Field to use as unique key for rows, or function(row)
 * @param {number} [itemsPerPage=10] - Items per page
 * @param {string} [className] - Wrapper additional classes
 * @param {string} [emptyMessage] - Message when no data
 * @param {boolean} [loading] - Loading state
 * 
 * @param {number} [currentPage] - Managed externally
 * @param {number} [totalPages] - Managed externally
 * @param {function} [onPageChange] - Managed externally
 * @param {number} [totalItems] - Managed externally
 */
const Table = ({
    columns,
    data,
    keyField = 'id',
    itemsPerPage = 10,
    className = "",
    emptyMessage = "No hay datos para mostrar",
    loading = false,
    // Optional props for controlled pagination
    currentPage: externalPage,
    totalPages: externalTotalPages,
    onPageChange: externalOnPageChange,
    totalItems: externalTotalItems,
}) => {
    const [internalPage, setInternalPage] = useState(1);

    const isControlled = externalPage !== undefined;
    const page = isControlled ? externalPage : internalPage;
    const handlePageChange = isControlled ? externalOnPageChange : setInternalPage;

    // Reset internal page if data changes significantly and we are out of bounds (simple heuristic)
    useEffect(() => {
        if (!isControlled && data.length > 0) {
            const maxPage = Math.ceil(data.length / itemsPerPage);
            if (internalPage > maxPage) {
                setInternalPage(1);
            }
        }
    }, [data.length, itemsPerPage, isControlled, internalPage]);

    // Calculate data slice
    let tableData = data;
    let computedTotalPages = 0;
    let computedTotalItems = 0;

    if (loading) {
        tableData = []; // Show loading state instead
    } else if (!isControlled) {
        computedTotalItems = data.length;
        computedTotalPages = Math.ceil(computedTotalItems / itemsPerPage);

        const start = (page - 1) * itemsPerPage;
        tableData = data.slice(start, start + itemsPerPage);
    } else {
        computedTotalPages = externalTotalPages || 0;
        computedTotalItems = externalTotalItems || 0;
    }

    const totalPages = isControlled ? externalTotalPages : computedTotalPages;
    const totalItems = isControlled ? externalTotalItems : computedTotalItems;

    return (
        <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-10">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.key || idx}
                                    className={`px-4 py-2 font-medium ${col.className || ''}`}
                                    style={col.style}
                                    {...(col.headerProps || {})}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 size={18} className="animate-spin text-blue-600" />
                                        <span>Cargando datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : tableData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            tableData.map((row, rowIndex) => {
                                // determine key
                                let rowKey;
                                if (typeof keyField === 'function') {
                                    rowKey = keyField(row);
                                } else {
                                    rowKey = row[keyField] !== undefined ? row[keyField] : rowIndex;
                                }

                                return (
                                    <tr key={rowKey} className="hover:bg-slate-50 transition-colors align-top">
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-4 py-2 text-slate-600 ${col.cellClassName || ''}`}
                                            >
                                                {col.render ? col.render(row, rowIndex) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {(totalPages > 1 || isControlled) && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};

export default Table;
