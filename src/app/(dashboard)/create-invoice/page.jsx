"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  Stack, TextField, Button, Paper, Typography, MenuItem, Checkbox,
  FormControlLabel, Snackbar, Alert, Box
} from "@mui/material";



export default function NewInvoicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    clientName: "", email: "", dueDate: "", amount: "", status: "Draft",
    description: "", syncToQBO: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));

        throw new Error(j.error || "Create failed");
      }

      setSnack({ open: true, msg: "Invoice created", sev: "success" });
      setTimeout(() => router.push("/invoices"), 600);
    } catch (err) {
      setSnack({ open: true, msg: err.message, sev: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" mb={2}>New Invoice</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Client Name" required value={form.clientName}
            onChange={e => setForm({ ...form, clientName: e.target.value })}
          />
          <TextField
            label="Billing Email" type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Due Date" type="date" required value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount" type="number" required inputProps={{ step: "0.01" }}
            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
          />
          <TextField
            label="Status" select value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
          </TextField>
          <TextField
            label="Description" multiline minRows={3}
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => history.back()}>Cancel</Button>
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
