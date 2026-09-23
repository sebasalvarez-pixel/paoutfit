"use client";

import { useActionState, useEffect, useRef, useState } from "react";

type State =
  | { status: "idle" }
  | { status: "ok"; at: number }
  | { status: "error"; at: number };

/**
 * Formulario del panel con retroalimentación clara: mientras guarda los
 * botones se apagan, y al terminar aparece un aviso "guardado ✓" (o un
 * error). Envuelve una acción del servidor que NO redirige; para las que
 * sí redirigen, se usa un <form> normal.
 */
export function AdminForm({
  action,
  children,
  className,
  successMessage = "Cambios guardados",
  resetOnSuccess = false,
}: {
  action: (formData: FormData) => Promise<void | unknown>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  /** Vacía el formulario al guardar (útil en formularios de "crear"). */
  resetOnSuccess?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);

  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      try {
        await action(formData);
        return { status: "ok", at: Date.now() };
      } catch {
        return { status: "error", at: Date.now() };
      }
    },
    { status: "idle" },
  );

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "ok") {
      // Le avisa al protector de "cambios sin guardar" que este formulario ya quedó guardado.
      formRef.current?.dispatchEvent(new CustomEvent("admin:saved", { bubbles: true }));
      if (resetOnSuccess) formRef.current?.reset();
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      className={`${className ?? ""} ${
        pending
          ? "[&_button[type=submit]]:opacity-60 [&_button[type=submit]]:pointer-events-none"
          : ""
      }`}
    >
      {children}
      {pending && <span className="sr-only">Guardando…</span>}

      {(pending || visible) && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] rounded shadow-lg px-5 py-3 text-sm text-white ${
            pending
              ? "bg-ink"
              : state.status === "error"
                ? "bg-red-600"
                : "bg-emerald-700"
          }`}
        >
          {pending
            ? "Guardando…"
            : state.status === "error"
              ? "No se pudo guardar. Revisa los datos e inténtalo de nuevo."
              : `✓ ${successMessage}`}
        </div>
      )}
    </form>
  );
}
