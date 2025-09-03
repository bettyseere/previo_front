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
import moment from "moment";

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
  // Date format configuration
  dateFormat?: string;
}

// Helper function to detect if a column is a date column
const isDateColumn = (columns: ColumnDef<any, any>[], columnId: string) => {
  const column = columns.find(col => col.accessorKey === columnId);
  return column?.meta?.type === 'date' || 
         (column?.accessorKey && /date|time|created|updated/i.test(column.accessorKey as string));
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
  heightMode = "viewport",
  dateFormat = "DD-MM-YYYY", // Default ISO format for date inputs
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
        const headerHeight = document.querySelector('header')?.clientHeight || 0;
        const otherElementsHeight = 200;
        setAvailableHeight(window.innerHeight - headerHeight - otherElementsHeight - 100);
      } else if (heightMode === "flexible" && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentHeight = containerRef.current.parentElement?.clientHeight || 0;
        setAvailableHeight(parentHeight - 200);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [heightMode]);

  // Format date for input value (YYYY-MM-DD format required for date inputs)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    
    const date = moment(dateString);
    return date.isValid() ? date.format("YYYY-MM-DD") : "";
  };

  // Parse date from input value
  const parseDateFromInput = (inputValue: string): string => {
    if (!inputValue) return "";
    
    const date = moment(inputValue, "YYYY-MM-DD");
    return date.isValid() ? date.format(dateFormat) : inputValue;
  };

  // Filtering logic with proper date handling
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
            // For date columns, format both values consistently for comparison
            const formattedCellValue = moment(cellValue).isValid() 
              ? moment(cellValue).format(dateFormat) 
              : cellValue;
            const formattedSearchValue = parseDateFromInput(search1);
            match1 = formattedCellValue.toLowerCase().includes(formattedSearchValue.toLowerCase());
          } else {
            match1 = cellValue.toLowerCase().includes(search1.toLowerCase());
          }
        }

        if (search2 && search2Col) {
          const cellValue = String((row as any)[search2Col] ?? "");
          if (isDateColumn(columns, search2Col)) {
            const formattedCellValue = moment(cellValue).isValid() 
              ? moment(cellValue).format(dateFormat) 
              : cellValue;
            const formattedSearchValue = parseDateFromInput(search2);
            match2 = formattedCellValue.toLowerCase().includes(formattedSearchValue.toLowerCase());
          } else {
            match2 = cellValue.toLowerCase().includes(search2.toLowerCase());
          }
        }

        return match1 && match2;
      });
    }

    return data;
  }, [data, searchInput, search1, search1Col, search2, search2Col, searchMode, columns, dateFormat]);

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
        return { maxHeight: '70vh' };
      case "viewport":
        return { maxHeight: `${availableHeight}px` };
      default:
        return { maxHeight: '400px' };
    }
  };

  // Handle date input change
  const handleDateInputChange = (
    value: string, 
    setSearchValue: (value: string) => void,
    isForInput: boolean = true
  ) => {
    if (isForInput) {
      // For the search input, we want to store the formatted date
      setSearchValue(value);
    } else {
      // For filters, we might want to handle differently if needed
      setSearchValue(value);
    }
  };

  // Render appropriate input based on column type
  const renderSearchInput = (
    searchValue: string, 
    setSearchValue: (value: string) => void, 
    columnId: string
  ) => {
    if (isDateColumn(columns, columnId)) {
      return (
        <input
          type="date"
          value={formatDateForInput(searchValue)}
          onChange={(e) => handleDateInputChange(e.target.value, setSearchValue)}
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

  // Render filter input based on column type
  const renderFilterInput = (columnId: string, filterValue: string) => {
    if (isDateColumn(columns, columnId)) {
      return (
        <input
          type="date"
          value={formatDateForInput(filterValue)}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              [columnId]: parseDateFromInput(e.target.value),
            }))
          }
          className="border p-2 rounded outline-none focus:border-black/50"
        />
      );
    }

    return (
      <input
        type="text"
        value={filterValue}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            [columnId]: e.target.value,
          }))
        }
        className="border p-2 rounded outline-none focus:border-black/50"
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
                {renderSearchInput(search1, setSearch1, search1Col)}
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
                {renderSearchInput(search2, setSearch2, search2Col)}
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
              <div key={col.accessorKey as string} className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  {col.header as string}
                </label>
                {renderFilterInput(col.accessorKey as string, filters[col.accessorKey as string] || "")}
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of the table component remains the same */}
      {/* ... */}
    </div>
  );
}
