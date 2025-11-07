"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Chip, CircularProgress, TextField, TableSortLabel,
  TablePagination, Box
} from "@mui/material";

const headCells = [
  { id: "qboInvoiceId", label: "Invoice Id" },
  { id: "clientName", label: "Client" },
  { id: "email", label: "Email" },
  { id: "amount", label: "Amount", numeric: true },
  { id: "status", label: "Status" },
  { id: "createdAt", label: "Created at" },

];

export default function InvoicesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // search + sort + pagination state
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, { cache: "no-store" });
        const data = await res.json();

        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- helpers: filtering + sorting
  const normalize = (v) => (v ?? "").toString().toLowerCase();

  const matchesQuery = (r, q) => {
    if (!q) return true;
    const s = normalize(q);


    return (
      normalize(r.clientName).includes(s) ||
      normalize(r.email).includes(s) ||
      normalize(r.status).includes(s) ||
      normalize(r.amount).includes(s) ||
      normalize(r.qboInvoiceId).includes(s)
    );
  };

  function descendingComparator(a, b, key) {
    const av = a[key];
    const bv = b[key];

    // special handling for dates and numbers
    if (key === "createdAt") {
      return new Date(bv) - new Date(av);
    }

    if (key === "amount") {
      return Number(bv) - Number(av);
    }

    // string-ish fallback
    const as = av == null ? "" : av.toString();
    const bs = bv == null ? "" : bv.toString();


    return bs.localeCompare(as, undefined, { numeric: true, sensitivity: "base" });
  }

  function getComparator(ord, key) {
    return ord === "desc"
      ? (a, b) => descendingComparator(a, b, key)
      : (a, b) => -descendingComparator(a, b, key);
  }

  const filteredSorted = useMemo(() => {
    const q = query.trim();
    const data = rows?.filter((r) => matchesQuery(r, q));
    const comparator = getComparator(order, orderBy);


    return data.slice().sort(comparator);
  }, [rows, query, order, orderBy]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;


    return filteredSorted.slice(start, start + rowsPerPage);
  }, [filteredSorted, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";

    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) return <Stack alignItems="center" mt={6}><CircularProgress /></Stack>;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Invoices</Typography>
        <TextField
          size="small"
          placeholder="Search invoices…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        />
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headCells.map((hc) => (
                <TableCell
                  key={hc.id}
                  sortDirection={orderBy === hc.id ? order : false}
                  align={hc.numeric ? "right" : "left"}
                >
                  <TableSortLabel
                    active={orderBy === hc.id}
                    direction={orderBy === hc.id ? order : "asc"}
                    onClick={() => handleRequestSort(hc.id)}
                  >
                    {hc.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.qboInvoiceId || "-"}</TableCell>
                <TableCell>{r.clientName}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell align="right">{r.amount}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.status}
                    color={r.status === "Paid" ? "success" : "warning"}
                    variant={r.status === "Paid" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}

            {filteredSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box py={4} textAlign="center" color="text.secondary">
                    No invoices match “{query}”.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredSorted.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Stack>
  );
}
