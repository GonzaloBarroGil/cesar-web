import { z } from "zod";

export const moneySchema = z.object({
  amount: z.string().describe("Decimal value with up to 2 fractional digits (ARS)"),
  currency: z.enum(["ARS"]).default("ARS").describe("ISO 4217 currency code"),
});

export const cuitSchema = z.object({
  value: z
    .string()
    .regex(/^\d{11}$/, "CUIT debe tener exactamente 11 dígitos")
    .describe("11-digit Argentine tax identifier with checksum"),
});

export const percentageSchema = z.object({
  value: z.string().describe("Decimal percentage (0.00–100.00)"),
});

export const yyyymmSchema = z.object({
  code: z
    .string()
    .regex(/^(20[0-9]{2}|209[0-9])(0[1-9]|1[0-2])$/, "Formato YYYYMM requerido")
    .describe("Six-digit year-month code"),
});

export const ivaConditionSchema = z
  .enum(["RI", "EXENTO", "MONOTRIBUTISTA", "CF"])
  .describe("AFIP IVA condition");

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string().describe("Machine-readable error code"),
    message: z.string().describe("Human-readable error message"),
    details: z.array(z.string()).optional().describe("Additional error details"),
  }),
});

export const timestampSchema = z.string().datetime().describe("ISO 8601 UTC timestamp");
export const dateSchema = z.string().date().describe("ISO 8601 date");
export const uuidSchema = z.string().uuid().describe("UUID v7 identifier");
export const hashSchema = z
  .string()
  .length(64)
  .regex(/^[a-fA-F0-9]{64}$/)
  .describe("SHA-256 hex digest");

export const createConsorcioRequestSchema = z.object({
  cuit: cuitSchema.shape.value,
  razon_social: z.string().min(1, "Razón social es requerida"),
  nombre_fantasia: z.string().optional(),
  matricula_caba: z.string().optional(),
  domicilio: z.string().optional(),
  iva_condition: ivaConditionSchema.optional(),
});

export const consorcioResponseSchema = z.object({
  id: uuidSchema,
  cuit: cuitSchema.shape.value,
  razon_social: z.string(),
  nombre_fantasia: z.string(),
  matricula_caba: z.string(),
  domicilio: z.string(),
  iva_condition: ivaConditionSchema,
  status: z.enum(["ACTIVE", "INACTIVE"]),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: uuidSchema,
    username: z.string(),
    role: z.enum(["ADMIN", "ACCOUNTANT"]),
    consorcio_id: uuidSchema.nullable().optional(),
    nombre_completo: z.string(),
  }),
});

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  postgres: z.string(),
  redis: z.string(),
  nats: z.string(),
});
