"use client";

import { useEffect } from "react";

// Avisa con el mensaje nativo del navegador ("¿Salir sin guardar?") si hay
// cambios sin guardar en algún formulario de la página — cubre cerrar la
// pestaña, recargar, o escribir otra URL. Se lleva la cuenta formulario por
// formulario: un formulario deja de contar como "sin guardar" cuando avisa
// que se guardó ("admin:saved") o cuando se envía de forma normal.
export function UnsavedChangesGuard() {
  useEffect(() => {
    const dirtyForms = new Set<Element>();
    let submitting = false;

    function markDirty(e: Event) {
      const form = (e.target as HTMLElement).closest("form");
      if (form) dirtyForms.add(form);
    }
    function markSubmitted(e: Event) {
      dirtyForms.delete(e.target as Element);
      // Cubre los envíos que recargan la página por completo.
      submitting = true;
      setTimeout(() => {
        submitting = false;
      }, 4000);
    }
    function markSaved(e: Event) {
      dirtyForms.delete(e.target as Element);
    }
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyForms.size > 0 && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    document.addEventListener("input", markDirty, true);
    document.addEventListener("change", markDirty, true);
    document.addEventListener("submit", markSubmitted, true);
    document.addEventListener("admin:saved", markSaved, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("input", markDirty, true);
      document.removeEventListener("change", markDirty, true);
      document.removeEventListener("submit", markSubmitted, true);
      document.removeEventListener("admin:saved", markSaved, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
