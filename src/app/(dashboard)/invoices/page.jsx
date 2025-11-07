"use client";

import { useEffect, useState } from "react";

import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Chip, CircularProgress
} from "@mui/material";

export default function InvoicesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Stack alignItems="center" mt={6}><CircularProgress /></Stack>;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Invoices</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>QBO Id</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.clientName}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell align="right">{r.amount}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.status}
                    color={r.status === "Paid" ? "success" : "default"}
                    variant={r.status === "Paid" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>{r.qboInvoiceId || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
