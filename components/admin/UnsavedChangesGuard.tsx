"use client";

import { useEffect } from "react";

// Avisa con el mensaje nativo del navegador ("¿Salir sin guardar?") si hay
// cambios sin guardar en cualquier formulario de la página — cubre cerrar
// la pestaña, recargar, o escribir otra URL. No se dispara si el cambio
// se está guardando de verdad (un submit real de alguno de los formularios).
export function UnsavedChangesGuard() {
  useEffect(() => {
    let dirty = false;
    let submitting = false;

    function markDirty(e: Event) {
      if ((e.target as HTMLElement).closest("form")) dirty = true;
    }
    function markSubmitting() {
      submitting = true;
    }
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    document.addEventListener("input", markDirty, true);
    document.addEventListener("change", markDirty, true);
    document.addEventListener("submit", markSubmitting, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("input", markDirty, true);
      document.removeEventListener("change", markDirty, true);
      document.removeEventListener("submit", markSubmitting, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
