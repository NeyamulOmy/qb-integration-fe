"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  Stack, TextField, Button, Paper, Typography,
  MenuItem, Checkbox, FormControlLabel,
  Snackbar, Alert, Box
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

// ✅ validation schema
const invoiceSchema = Yup.object({
  clientName: Yup.string().trim().min(3, "Too short").max(80).required("Client name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dueDate: Yup.date()
    .min(new Date(Date.now() - 24 * 60 * 60 * 1000), "Due date cannot be in the past")
    .required("Due date is required"),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than 0")
    .required("Amount is required"),
  status: Yup.mixed().oneOf(["Draft", "Paid"]).required(),
  description: Yup.string().max(500, "Too long"),
  syncToQBO: Yup.boolean()
});

export default function NewInvoicePage() {
  const router = useRouter();
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const formik = useFormik({
    initialValues: {
      clientName: "",
      email: "",
      dueDate: "",
      amount: "",
      status: "Draft",
      description: "",
      syncToQBO: true
    },
    validationSchema: invoiceSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));

          throw new Error(j.error || "Create failed");
        }

        setSnack({ open: true, msg: "Invoice created", sev: "success" });
        resetForm();
        setTimeout(() => router.push("/invoices"), 600);
      } catch (err) {
        setSnack({ open: true, msg: err.message, sev: "error" });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } = formik;

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" mb={2}>New Invoice</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Client Name"
            name="clientName"
            value={values.clientName}
            onChange={handleChange}
            error={touched.clientName && Boolean(errors.clientName)}
            helperText={touched.clientName && errors.clientName}
            required
          />
          <TextField
            label="Billing Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            required
          />
          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={values.dueDate}
            onChange={handleChange}
            error={touched.dueDate && Boolean(errors.dueDate)}
            helperText={touched.dueDate && errors.dueDate}
            required
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            inputProps={{ step: "0.01" }}
            value={values.amount}
            onChange={handleChange}
            error={touched.amount && Boolean(errors.amount)}
            helperText={touched.amount && errors.amount}
            required
          />
          <TextField
            label="Status"
            name="status"
            select
            value={values.status}
            onChange={handleChange}
            error={touched.status && Boolean(errors.status)}
            helperText={touched.status && errors.status}
          >
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
          </TextField>
          <TextField
            label="Description"
            name="description"
            multiline
            minRows={3}
            value={values.description}
            onChange={handleChange}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
          />

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => router.push("/invoices")}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.sev}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
