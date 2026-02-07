import z, { email, int } from "zod";

export const loginUserSchema = z.object({
  email: z
    .email({ error: "Provide standard email format" })
    .max(100, { error: "Email must be no more 100 character" }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 character long" })
    .max(100, { error: "Password must be no more than 100 characters" }),
});

// export const registerUserSchema = z.object({
//   name: z
//     .string()
//     .trim()
//     .min(3, { error: "Name must be at least 3 character long" })
//     .max(100, { error: "Name must be no more than 100 character" }),
//   email: z
//     .email({ error: "Provide standard email format" })
//     .max(100, { error: "Email must be no more than 100 character" }),
//   password: z
//     .string()
//     .min(6, { error: "Password must be at least 6 character long" })
//     .max(100, { error: "Password must be no more than 100 characters" }),
// });

export const registerUserSchema = loginUserSchema.extend({
  name: z
    .string()
    .trim()
    .min(3, { error: "Name must be at least 3 character long" })
    .max(100, { error: "Name must be no more than 100 character" }),
});


// ! zod validation for verify Email
export const verifyEmailSchema = z.object({
  email : z.email().max(100,"Email is greater than 100 of length"),
  token: z.string().trim().length(8),
})
