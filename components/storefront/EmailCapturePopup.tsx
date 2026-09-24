"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { subscribeEmail } from "@/lib/actions/subscribe";
import { useLocale } from "@/components/LocaleProvider";

const STORAGE_KEY = "paoutfit-popup-v2";
// Si alguien lo cierra sin suscribirse, vuelve a aparecer pasados unos días.
const REAPPEAR_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
// En estas páginas no se interrumpe al cliente (está pagando o consultando un pedido).
const QUIET_PATHS = ["/checkout", "/pagar", "/pedido-confirmado", "/rastrear-pedido", "/addi-retorno"];

type Saved = { dismissedAt?: number; subscribed?: boolean };

function readSaved(): Saved {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Saved;
  } catch {
    return {};
  }
}

function writeSaved(value: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Sin almacenamiento (modo privado): simplemente no se recuerda.
  }
}

export function EmailCapturePopup({
  image,
}: {
  image: { storagePath: string; alt: string } | null;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    { status: "idle" } | { status: "success"; code: string } | { status: "error"; message: string }
  >({ status: "idle" });
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const quiet = QUIET_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (quiet) {
      setVisible(false);
      return;
    }
    const saved = readSaved();
    if (saved.subscribed) return;
    if (saved.dismissedAt && Date.now() - saved.dismissedAt < REAPPEAR_AFTER_MS) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setVisible(true);
    };
    // Sale a los pocos segundos o apenas la persona empieza a explorar la página.
    const timer = setTimeout(show, 4000);
    const onScroll = () => {
      if (window.scrollY > 350) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [quiet, pathname]);

  function close() {
    setVisible(false);
    if (state.status !== "success") writeSaved({ dismissedAt: Date.now() });
  }

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, state.status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeEmail(email);
      if (result.ok) {
        setState({ status: "success", code: result.code });
        writeSaved({ subscribed: true });
      } else {
        setState({ status: "error", message: result.error });
      }
    });
  }

  if (!visible || quiet) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("popup_title")}
        className="animate-pop-in relative bg-ivory max-w-md w-full grid sm:grid-cols-2 shadow-xl"
      >
        <button
          onClick={close}
          aria-label={t("popup_cerrar")}
          className="absolute top-3 right-3 text-ink/50 hover:text-ink z-10 h-8 w-8 flex items-center justify-center"
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
              className="object-cover object-top"
            />
          )}
        </div>

        <div className="p-8 flex flex-col justify-center text-center sm:text-left">
          {state.status === "success" ? (
            <>
              <h2 className="font-heading text-2xl text-ink">{t("popup_listo")}</h2>
              <p className="text-sm text-ink/70 mt-2">{t("popup_usa_codigo")}</p>
              <p className="mt-3 border border-dashed border-rose text-rose text-lg font-semibold py-2 px-3 text-center">
                {state.code}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl text-ink">
                {t("popup_title")}
              </h2>
              <p className="text-sm text-ink/70 mt-2">{t("popup_subtitle")}</p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-2">
                <input
                  type="email"
                  required
                  placeholder={t("popup_email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-ink/20 px-3 py-2 text-base sm:text-sm bg-white"
                />
                {state.status === "error" && (
                  <p className="text-xs text-red-600">{state.message}</p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-rose text-white py-2 uppercase text-sm tracking-wide hover:bg-plum active:scale-95 transition-all disabled:opacity-60"
                >
                  {isPending ? t("popup_enviando") : t("popup_cta")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
