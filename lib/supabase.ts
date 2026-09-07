import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: solo se usa en el servidor (server
// actions), nunca se expone al navegador. Sirve para leer/escribir en
// Supabase Storage sin las restricciones de Row Level Security.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export const PRODUCT_IMAGES_BUCKET = "product-images";
