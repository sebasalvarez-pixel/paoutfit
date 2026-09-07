import { createClient } from "@supabase/supabase-js";

// Cliente para el navegador: usa la llave pública, solo puede hacer lo que
// el token de subida firmado (generado en el servidor) le permite.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export const PRODUCT_IMAGES_BUCKET = "product-images";
