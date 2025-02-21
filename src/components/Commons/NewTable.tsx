import React, { useState, useMemo } from 'react';
import Button from './Button';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';

interface TableWithPaginationProps<T> {
    columns: ColumnDef<T, any>[];
    data: T[];
    initialPageSize?: number; // Optional initial page size
    actionBtn?: React.JSX.Element,
    searchMsg?: string,
    handleBtn?: () => void
}

export default function Table<T>({
    columns,
    data,
    actionBtn,
    handleBtn = () => {},
    searchMsg = "",
    initialPageSize = 10, // Default page size
}: TableWithPaginationProps<T>) {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    });
    const [searchInput, setSearchInput] = useState('');

  // Memoize the filtered data based on the search input
    const filteredData = useMemo(() => {
        if (!searchInput) return data;
        return data.filter((row) =>
        Object.values(row as object)
            .join(' ')
            .toLowerCase()
            .includes(searchInput.toLowerCase())
        );
    }, [searchInput, data]);


  // Initialize the table instance
    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
        pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
    });

    return (
        <div>
        {/* Search Input */}
        <div className='flex items-center justify-between mb-4'>
            <div className="w-[24rem]">
            <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchMsg}
                className="border px-4 py-2 rounded w-full outline-none text-gray-700"
            />
            </div>
            {actionBtn && <div onClick={handleBtn}>{actionBtn}</div>}
        </div>


        {/* Table */}
        <table className="min-w-full border-collapse">
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <th
                    key={header.id}
                    className="px-4 py-[.6rem] border-b bg-slate-300 text-left text-[1rem]  text-gray-500 font-bold capitalize tracking-wider rounded-sm"
                    >
                    {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                    </th>
                ))}
                </tr>
            ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <td
                    key={cell.id}
                    className="px-4 py-4 border-b font-semibold text-[.9rem] text-gray-800"
                    >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className='absolute bottom-4 right-6'>
            <div className="flex justify-between items-center mb-4">
                <div className='flex gap-2'>
                    <Button text='<<' handleClick={()=>table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} styling='text-white' />
                    <Button text='<' handleClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} styling='text-white' />
                    <Button text='>' handleClick={() => table.nextPage()} disabled={!table.getCanNextPage()} styling='text-white'/>
                    <Button text='>>' handleClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} styling='text-white' />
                </div>

                <div className='ml-2'>
                    <span>
                        Page{' '}
                        <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                        </strong>{' '}
                    </span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                        }}
                        className="ml-2 border-none outline-none text-white rounded px-2 py-1 bg-secondary"
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        </div>
    );
}