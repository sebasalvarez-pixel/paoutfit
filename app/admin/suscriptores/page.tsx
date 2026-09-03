import { prisma } from "@/lib/prisma";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-ink">Suscriptores</h1>
        <a
          href="/admin/suscriptores/export"
          className="text-sm border border-rose text-rose px-4 py-2 hover:bg-rose hover:text-white transition-colors"
        >
          Exportar CSV
        </a>
      </div>
      <p className="text-sm text-ink/60">
        {subscribers.length} correo{subscribers.length === 1 ? "" : "s"}{" "}
        capturados — listos para conectar a una herramienta de email
        marketing.
      </p>

      <div className="bg-white border border-ink/10 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 capitalize">{s.source}</td>
                <td className="px-4 py-3 text-ink/60">
                  {s.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                  Todavía no hay suscriptores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
