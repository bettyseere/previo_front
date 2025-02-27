import React, { useState, useMemo } from 'react';
import Button from './Button';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface TableWithPaginationProps<T> {
  columns: ColumnDef<T, any>[]; // Table column definitions
  data: T[];                   // Table data
  initialPageSize?: number;    // Optional initial page size
  actionBtn?: React.JSX.Element; // Optional action button
  searchMsg?: string;
  entity_name?: any,        // Placeholder text for search input
  handleBtn?: () => void;      // Action button click handler
  onRowClick?: (row: T) => void; // Callback when a row is clicked
}

export default function Table<T>({
  columns,
  data,
  actionBtn,
  handleBtn = () => {},
  searchMsg = '',
  entity_name = '',
  initialPageSize = 10,
  onRowClick,
}: TableWithPaginationProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [searchInput, setSearchInput] = useState('');
  const [sorting, setSorting] = useState([]);

  // Filter data based on search input
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
      sorting,
    },
      defaultColumn: {
      enableSorting: false, // Disable sorting for all columns by default
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="">
      {/* Search Input */}
      <div className="flex items-center justify-between mb-4">
        {entity_name && <h4 className="font-semibold text-xl text-secondary uppercase">{entity_name}</h4>}
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
      <div className="overflow-hidden border-b">
      {/* Table Header */}
      <table className="min-w-full table-fixed border-collapse">
        <thead className='cursor-pointer'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 border-b bg-slate-300 text-[1rem] text-gray-500 text-center font-semibold capitalize tracking-wider"
                  style={{ width: `${header.column.getSize()}px` }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanSort() ? (
                    <span>
                      {header.column.getIsSorted() === 'asc'
                        ? ' 🔼'
                        : header.column.getIsSorted() === 'desc'
                        ? ' 🔽'
                        : ' ⬍'}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
      </table>

      {/* Table Body (Scrollable with max-height) */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        <table className="min-w-full table-fixed border-collapse">
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-100 cursor-pointer"
                // Add a click handler if needed
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="text-secondary px-4 py-2 border-b border-r first:border-l text-center text-[1rem] truncate"
                    style={{ width: `${cell.column.getSize()}px` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>


      {/* Pagination Controls */}
      <div className="absolute bottom-4 right-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button text="<<" handleClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} styling="text-white" />
            <Button text="<" handleClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} styling="text-white" />
            <Button text=">" handleClick={() => table.nextPage()} disabled={!table.getCanNextPage()} styling="text-white" />
            <Button text=">>" handleClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} styling="text-white" />
          </div>

          <div className="ml-2">
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
