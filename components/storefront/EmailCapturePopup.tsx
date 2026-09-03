"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { subscribeEmail } from "@/lib/actions/subscribe";

const STORAGE_KEY = "paoutfit-popup-dismissed";

export function EmailCapturePopup({
  image,
}: {
  image: { storagePath: string; alt: string } | null;
}) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    { status: "idle" } | { status: "success"; code: string } | { status: "error"; message: string }
  >({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeEmail(email);
      if (result.ok) {
        setState({ status: "success", code: result.code });
        window.localStorage.setItem(STORAGE_KEY, "1");
      } else {
        setState({ status: "error", message: result.error });
      }
    });
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="relative bg-ivory max-w-md w-full grid sm:grid-cols-2 shadow-xl">
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-ink/50 hover:text-ink z-10"
        >
          ✕
        </button>

        <div className="relative hidden sm:block bg-blush">
          {image && (
            <Image
              src={image.storagePath}
              alt={image.alt}
              fill
              sizes="200px"
              className="object-cover"
            />
          )}
        </div>

        <div className="p-8 flex flex-col justify-center text-center sm:text-left">
          {state.status === "success" ? (
            <>
              <h2 className="font-heading text-2xl text-ink">¡Listo! 🎉</h2>
              <p className="text-sm text-ink/70 mt-2">
                Usa este código en tu compra:
              </p>
              <p className="mt-3 border border-dashed border-rose text-rose text-lg font-semibold py-2 px-3 text-center">
                {state.code}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl text-ink">
                5% para ti
              </h2>
              <p className="text-sm text-ink/70 mt-2">
                Déjanos tu correo y recibe 5% de descuento en tu primera compra.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-2">
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-ink/20 px-3 py-2 text-sm bg-white"
                />
                {state.status === "error" && (
                  <p className="text-xs text-red-600">{state.message}</p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-rose text-white py-2 uppercase text-sm tracking-wide hover:bg-plum transition-colors disabled:opacity-60"
                >
                  {isPending ? "Enviando..." : "Quiero mi descuento"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
