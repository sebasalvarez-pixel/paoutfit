import { formatCop } from "@/lib/format";

type Point = { date: string; revenueCop: number };

// Se fija timeZone: "UTC" a propósito: las fechas son "solo calendario"
// (2026-08-21) y sin esto, el servidor y el navegador podrían formatear
// un día distinto según su zona horaria local, causando un error de
// hidratación en React (el HTML no coincidiría entre los dos).
const DAY_LABEL = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function parseDay(date: string) {
  return new Date(date + "T00:00:00Z");
}

export function RevenueChart({ data }: { data: Point[] }) {
  const width = 700;
  const height = 220;
  const paddingLeft = 8;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartWidth = width - paddingLeft * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const max = Math.max(...data.map((d) => d.revenueCop), 1);
  const barGap = 4;
  const barWidth = Math.max(
    2,
    (chartWidth - barGap * (data.length - 1)) / data.length,
  );

  const hasAnyRevenue = data.some((d) => d.revenueCop > 0);

  return (
    <div className="bg-white border border-ink/10 rounded p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-heading text-xl text-ink">
          Ingresos — últimos {data.length} días
        </h2>
        <span className="text-xs text-ink/40">
          Máximo: {formatCop(max)}
        </span>
      </div>

      {!hasAnyRevenue ? (
        <p className="text-sm text-ink/50 py-10 text-center">
          Todavía no hay ventas en este período.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label="Ingresos diarios"
        >
          {/* línea base (recessive) */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingLeft}
            y2={height - paddingBottom}
            stroke="#2B2224"
            strokeOpacity={0.12}
            strokeWidth={1}
          />

          {data.map((d, i) => {
            const barHeight =
              max === 0 ? 0 : (d.revenueCop / max) * chartHeight;
            const x = paddingLeft + i * (barWidth + barGap);
            const y = height - paddingBottom - barHeight;
            const showLabel =
              i === 0 || i === data.length - 1 || i === data.length - 8;
            return (
              <g key={d.date}>
                {/*
                  Nota: usamos el atributo `title`, NO un elemento hijo
                  <title>. Next.js intercepta cualquier <title> como
                  elemento en toda la página para su sistema de metadatos
                  (aunque esté dentro de un <svg>), y lo deja vacío —
                  causaba un error de hidratación. El atributo sí funciona
                  como tooltip nativo del navegador.
                */}
                <rect
                  x={x}
                  y={barHeight > 0 ? y : height - paddingBottom - 2}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={Math.min(4, barWidth / 2)}
                  fill="#C26B7C"
                  opacity={d.revenueCop > 0 ? 1 : 0.15}
                  {...{ title: `${DAY_LABEL.format(parseDay(d.date))}: ${formatCop(d.revenueCop)}` }}
                />
                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#2B2224"
                    opacity={0.5}
                  >
                    {DAY_LABEL.format(parseDay(d.date))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
