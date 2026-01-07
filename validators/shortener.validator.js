import z from "zod";

export const shortLinkSchema = z.object({
  url: z
    .url({ error: "provode an valid Url" })
    .max(1024, { error: "Url should be not more than 1024 letters" }),
  shortCode: z
    .string()
    .trim()
    .min(2, { error: "Shortcode must be greater than 2 letters" })
    .max(50, { error: "Shortcode should be not more than 50 letters" }),
});
