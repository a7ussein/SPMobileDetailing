import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    price: z.string().optional(),
    duration: z.string().optional(),
  }),
});

const cities = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/cities" }),
  schema: z.object({
    name: z.string(),
    state: z.string().default("ME"),
    description: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { services, cities };
