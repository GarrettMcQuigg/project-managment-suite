'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button } from './button';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  searchKey?: string;
  onRowClick?: (item: T) => void;
  addRow?: React.ReactNode;
}

export function DataTable<T>({ data, columns, searchKey, onRowClick, addRow }: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey as keyof T])
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : data;

  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        {searchKey && (
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
          </div>
        )}
        {addRow}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => (
              <TableRow key={idx} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render ? column.render(item) : String(item[column.key as keyof T])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * itemsPerPage >= filteredData.length}>
          Next
        </Button>
      </div>
    </div>
  );
}
