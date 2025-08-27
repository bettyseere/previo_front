import React, { useState, useMemo } from "react";
import Button from "./Button";
import { MdKeyboardBackspace } from "react-icons/md";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

interface TableWithPaginationProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  initialPageSize?: number;
  actionBtn?: React.JSX.Element;
  searchMsg?: string;
  entity_name?: string;
  back_path?: string;
  handleBtn?: () => void;
  onRowClick?: (row: T) => void;
  enableColumnVisibility?: boolean;
  enableColumnFilters?: boolean;
  searchMode?: "single" | "double"; // 👈 new
}

export default function Table<T>({
  columns,
  data,
  actionBtn,
  handleBtn = () => {},
  searchMsg = "",
  entity_name = "",
  back_path = "",
  initialPageSize = 10,
  onRowClick,
  enableColumnVisibility = false,
  enableColumnFilters = false,
  searchMode = "single", // 👈 default to single
}: TableWithPaginationProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    columns.reduce((acc, col) => {
      if (col.accessorKey) {
        acc[col.accessorKey as string] = true;
      }
      return acc;
    }, {} as VisibilityState)
  );
  const [filters, setFilters] = useState<Record<string, string>>({});

  // 🔍 single search
  const [searchInput, setSearchInput] = useState("");

  // 🔍 double search
  const [search1, setSearch1] = useState("");
  const [search1Col, setSearch1Col] = useState<string>("");
  const [search2, setSearch2] = useState("");
  const [search2Col, setSearch2Col] = useState<string>("");

  // Filtering logic
  const filteredData = useMemo(() => {
    if (searchMode === "single") {
      if (!searchInput) return data;
      return data.filter((row) =>
        Object.values(row as object)
          .join(" ")
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
    }

    if (searchMode === "double") {
      return data.filter((row) => {
        let match1 = true;
        let match2 = true;

        if (search1 && search1Col) {
          match1 = String((row as any)[search1Col] ?? "")
            .toLowerCase()
            .includes(search1.toLowerCase());
        }

        if (search2 && search2Col) {
          match2 = String((row as any)[search2Col] ?? "")
            .toLowerCase()
            .includes(search2.toLowerCase());
        }

        return match1 && match2;
      });
    }

    return data;
  }, [data, searchInput, search1, search1Col, search2, search2Col, searchMode]);

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {(back_path || entity_name) && (
            <div className="flex items-center gap-2">
              {back_path && (
                <a href={back_path}>
                  <div className="font-bold gap-1 flex items-center hover:scale-105 hover:duration-200">
                    <MdKeyboardBackspace size={15} className="text-primary" />
                    <p className="text-primary">Back</p>
                  </div>
                </a>
              )}
              {entity_name && (
                <h4 className="font-semibold text-xl text-secondary capitalize">
                  {entity_name}
                </h4>
              )}
            </div>
          )}

          {/* 🔍 Single search */}
          {searchMode === "single" && (
            <div className="w-[24rem]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchMsg}
                className="border px-4 py-2 rounded w-full outline-none text-gray-700"
              />
            </div>
          )}

          {/* 🔍 Double search */}
          {searchMode === "double" && (
            <div className="flex gap-4">
              {/* Search 1 */}
              <div className="flex gap-2">
                <select
                  value={search1Col}
                  onChange={(e) => setSearch1Col(e.target.value)}
                  className="border px-2 py-2 rounded outline-none"
                >
                  <option value="" className="outline-none">Select column</option>
                  {columns.map((col) =>
                    col.accessorKey ? (
                      <option key={col.accessorKey} value={col.accessorKey as string}>
                        {col.header as string}
                      </option>
                    ) : null
                  )}
                </select>
                <input
                  type="text"
                  value={search1}
                  onChange={(e) => setSearch1(e.target.value)}
                  placeholder="Search..."
                  className="border outline-none px-4 py-2 rounded"
                />
              </div>

              {/* Search 2 */}
              <div className="flex gap-2">
                <select
                  value={search2Col}
                  onChange={(e) => setSearch2Col(e.target.value)}
                  className="border px-2 py-2 rounded outline-none"
                >
                  <option value="">Select column</option>
                  {columns.map((col) =>
                    col.accessorKey ? (
                      <option key={col.accessorKey} value={col.accessorKey as string}>
                        {col.header as string}
                      </option>
                    ) : null
                  )}
                </select>
                <input
                  type="text"
                  value={search2}
                  onChange={(e) => setSearch2(e.target.value)}
                  placeholder="Search..."
                  className="border px-4 py-2 rounded outline-none"
                />
              </div>
            </div>
          )}
        </div>
        {actionBtn && <div onClick={handleBtn}>{actionBtn}</div>}
      </div>

      {/* Column Visibility Toggle */}
      {enableColumnVisibility && (
        <div className="flex gap-4 mb-4 flex-wrap">
          {table.getAllLeafColumns().map((col) => (
            <label key={col.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={col.getIsVisible()}
                onChange={col.getToggleVisibilityHandler()}
              />
              {flexRender(col.columnDef.header, { column: col, table })}
            </label>
          ))}
        </div>
      )}

      {/* Column Filters */}
      {enableColumnFilters && (
        <div className="flex gap-4 mb-4 flex-wrap">
          {columns.map((col) => {
            if (!col.accessorKey) {
              return null;
            }

            return (
              <input
                key={col.accessorKey as string}
                type="text"
                placeholder={`${col.header as string}`}
                value={filters[col.accessorKey as string] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    [col.accessorKey as string]: e.target.value,
                  }))
                }
                className="border p-2 rounded outline-none focus:border-black/50"
              />
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden border-b">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="cursor-pointer">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2 border-b bg-slate-300 text-[1rem] text-gray-500 text-center font-semibold capitalize tracking-wider text-sm"
                    style={{ width: `${header.column.getSize()}px` }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanSort() && (
                      <span className="text-sm">
                        {header.column.getIsSorted() === "asc"
                          ? " 🔼"
                          : header.column.getIsSorted() === "desc"
                          ? " 🔽"
                          : " ⬍"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>

        {/* Table Body */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
          <table className="min-w-full table-fixed border-collapse">
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="text-secondary px-4 py-2 border-b border-r first:border-l text-center text-[1rem]"
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="absolute right-6 mt-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              text="<<"
              handleClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              styling="text-white"
            />
            <Button
              text="<"
              handleClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              styling="text-white"
            />
            <Button
              text=">"
              handleClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              styling="text-white"
            />
            <Button
              text=">>"
              handleClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              styling="text-white"
            />
          </div>
          <div className="ml-2">
            <span>
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>{" "}
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
