import React, { useState, useMemo, useRef, useEffect } from "react";
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
  searchMode?: "single" | "double";
  // New prop to control height behavior
  heightMode?: "fixed" | "flexible" | "viewport";
}

// Helper function to detect if a column is a date column
const isDateColumn = (columns: ColumnDef<any, any>[], columnId: string) => {
  const column = columns.find(col => col.accessorKey === columnId);
  return column?.meta?.type === 'date' || 
         (column?.accessorKey && /date|time|created|updated/i.test(column.accessorKey as string));
};

// Helper function to parse date strings
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

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
  searchMode = "single",
  heightMode = "viewport", // Default to flexible height
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(400);

  // 🔍 single search
  const [searchInput, setSearchInput] = useState("");

  // 🔍 double search
  const [search1, setSearch1] = useState("");
  const [search1Col, setSearch1Col] = useState<string>("");
  const [search2, setSearch2] = useState("");
  const [search2Col, setSearch2Col] = useState<string>("");

  // Calculate available height for the table body
  useEffect(() => {
    const calculateHeight = () => {
      if (heightMode === "viewport") {
        // Use the full viewport height minus the space taken by other elements
        const headerHeight = document.querySelector('header')?.clientHeight || 0;
        const otherElementsHeight = 200; // Approximate height of controls and pagination
        setAvailableHeight(window.innerHeight - headerHeight - otherElementsHeight - 100);
      } else if (heightMode === "flexible" && containerRef.current) {
        // Use the available space in the parent container
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentHeight = containerRef.current.parentElement?.clientHeight || 0;
        setAvailableHeight(parentHeight - 200); // Reserve space for controls
      }
      // For "fixed" mode, we don't need to calculate anything
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [heightMode]);

  // Check if both search columns are date columns
  const bothDateColumns = useMemo(() => {
    return search1Col && search2Col && 
           isDateColumn(columns, search1Col) && 
           isDateColumn(columns, search2Col);
  }, [search1Col, search2Col, columns]);

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
          const cellValue = String((row as any)[search1Col] ?? "");
          
          if (isDateColumn(columns, search1Col)) {
            // For date columns, check if the date matches (simple contains check)
            match1 = cellValue.toLowerCase().includes(search1.toLowerCase());
          } else {
            match1 = cellValue.toLowerCase().includes(search1.toLowerCase());
          }
        }

        if (search2 && search2Col) {
          const cellValue = String((row as any)[search2Col] ?? "");
          
          if (isDateColumn(columns, search2Col)) {
            match2 = cellValue.toLowerCase().includes(search2.toLowerCase());
          } else {
            match2 = cellValue.toLowerCase().includes(search2.toLowerCase());
          }
        }

        // Special handling for date range search
        if (bothDateColumns && search1 && search2) {
          const rowDate1 = parseDate(String((row as any)[search1Col] ?? ""));
          const rowDate2 = parseDate(String((row as any)[search2Col] ?? ""));
          const fromDate = parseDate(search1);
          const toDate = parseDate(search2);
          
          // If we have valid dates, check if either of the row dates falls within the range
          if (rowDate1 && fromDate && toDate) {
            match1 = rowDate1 >= fromDate && rowDate1 <= toDate;
          }
          if (rowDate2 && fromDate && toDate) {
            match2 = rowDate2 >= fromDate && rowDate2 <= toDate;
          }
          
          // Return true if either date in the row falls within the range
          return match1 || match2;
        }

        return match1 && match2;
      });
    }

    return data;
  }, [data, searchInput, search1, search1Col, search2, search2Col, searchMode, columns, bothDateColumns]);

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

  // Determine the max height based on the selected mode
  const getTableBodyHeight = () => {
    switch (heightMode) {
      case "fixed":
        return { maxHeight: '400px' };
      case "flexible":
        return { maxHeight: '70vh' }; // Use 70% of viewport height
      case "viewport":
        return { maxHeight: `${availableHeight}px` };
      default:
        return { maxHeight: '400px' };
    }
  };

  // Get minimum date for the second date input
  const getMinDateForSecondInput = () => {
    if (bothDateColumns && search1) {
      return search1;
    }
    return undefined;
  };

  // Handle date change for first input
  const handleFirstDateChange = (value: string) => {
    setSearch1(value);
    
    // If both are date columns and the second date is earlier than the first, reset the second date
    if (bothDateColumns && search2) {
      const firstDate = parseDate(value);
      const secondDate = parseDate(search2);
      
      if (firstDate && secondDate && secondDate < firstDate) {
        setSearch2("");
      }
    }
  };

  // Render appropriate input based on column type
  const renderSearchInput = (
    searchValue: string, 
    setSearchValue: (value: string) => void, 
    columnId: string,
    isSecondInput: boolean = false
  ) => {
    if (isDateColumn(columns, columnId)) {
      return (
        <input
          type="date"
          value={searchValue}
          onChange={(e) => isSecondInput ? setSearchValue(e.target.value) : handleFirstDateChange(e.target.value)}
          min={isSecondInput ? getMinDateForSecondInput() : undefined}
          className="border outline-none px-4 py-2 rounded"
        />
      );
    }

    return (
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search..."
        className="border outline-none px-4 py-2 rounded"
      />
    );
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
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
            <div className="flex gap-4 items-center">
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
                {renderSearchInput(search1, setSearch1, search1Col)}
              </div>

              {/* Show "to" label when both columns are dates */}
              {bothDateColumns && (
                <span className="text-gray-600 font-medium">to</span>
              )}

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
                {renderSearchInput(search2, setSearch2, search2Col, true)}
              </div>

              {/* Validation message */}
              {bothDateColumns && search1 && search2 && parseDate(search2) < parseDate(search1) && (
                <span className="text-red-500 text-sm">
                  End date cannot be earlier than start date
                </span>
              )}
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
              <div key={col.accessorKey as string} className="flex flex-col">
                {isDateColumn(columns, col.accessorKey as string) ? (
                  <input
                    type="date"
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
                ) : (
                  <input
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
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden border-b">
        <table className="w-full table-fixed border-collapse">
          <thead className="cursor-pointer">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2 border-b bg-slate-300 text-[1rem] text-gray-500 text-center font-semibold capitalize tracking-wider text-sm"
                    style={{ width: `auto` }}
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

        {/* Table Body - This will scroll independently */}
        <div 
          className="overflow-y-auto scrollbar-hide flex-1"
          style={getTableBodyHeight()}
        >
          <table className="w-full table-fixed border-collapse">
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const span = row.original._rowSpan?.[cell.column.id] ?? 1;
                    // console.log(span, cell.column.id)
                    return <td
                      key={cell.id}
                      className={`text-secondary relative px-2 py-2 border-b border-r first:border-l text-center text-[1rem] ${span > 1 && "bg-gray-200"}`}
                      style={{ width: `auto` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-2">
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