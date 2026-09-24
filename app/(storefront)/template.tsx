// A diferencia del layout, el template se vuelve a montar en cada
// navegación: eso reinicia la animación y da la sensación de "pasar de página".
export default function StorefrontTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-in">{children}</div>;
}
