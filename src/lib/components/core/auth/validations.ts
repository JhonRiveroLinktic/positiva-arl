import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Formato de email inválido")
    .max(255, "El email no puede tener más de 255 caracteres")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede tener más de 100 caracteres")
    .regex(/^[a-zA-Z0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, "La contraseña contiene caracteres no permitidos"),
});

export type LoginFormData = z.infer<typeof loginSchema>; 