export type Locale = "es" | "en";

export const LOCALE_COOKIE = "paoutfit_locale";

export const dictionary = {
  es: {
    // Header
    nav_vestidos: "Vestidos",
    nav_enterizos: "Enterizos",
    nav_tops: "Tops",
    nav_mi_pedido: "Mi pedido",
    nav_ver_carrito: "Ver carrito",
    nav_abrir_menu: "Abrir menú",

    // Footer
    footer_comprar: "Comprar",
    footer_ayuda: "Ayuda",
    footer_contactanos: "Contáctanos",
    footer_envios_pagos: "Envíos y pagos",
    footer_cambios_devoluciones: "Cambios y devoluciones",
    footer_rastrea_pedido: "Rastrea tu pedido",
    footer_tratamiento_datos: "Tratamiento de datos",
    footer_derechos: "Todos los derechos reservados.",

    // Home
    home_hero_title: "Ropa deportiva para moverte como eres",
    home_hero_subtitle:
      "Diseños femeninos, cómodos y versátiles para entrenar, salir o simplemente ser tú.",
    home_hero_cta: "Ver colección",
    home_proximamente: "Próximamente",
    home_mas_comprados: "Los más comprados",
    category_empty: "Pronto vas a encontrar productos aquí.",

    // Product card / detail
    product_agotado: "Agotado",
    product_ver_producto: "Ver producto",
    product_color: "Color",
    product_agregar_carrito: "Agregar al carrito",
    product_agregado: "¡Agregado! Agregar otra vez",
    product_foto_proximamente: "Foto próximamente",
    product_foto_anterior: "Foto anterior",
    product_foto_siguiente: "Foto siguiente",
    product_talla_unica: "Talla única",

    // Cart
    cart_title: "Tu carrito",
    cart_empty: "Tu carrito está vacío",
    cart_ver_coleccion: "Ver colección",
    cart_color: "Color",
    cart_quitar: "Quitar",
    cart_subtotal: "Subtotal",
    cart_finalizar_compra: "Finalizar compra",
    cart_cerrar: "Cerrar",
    cart_cerrar_carrito: "Cerrar carrito",
    cart_envio_calcula: "El envío se calcula en el siguiente paso.",
    footer_terminos: "Términos y condiciones",
    product_mas_vendido: "Más vendido",
    nav_buscar: "Buscar",
    nav_todo: "Todo",
    filtro_buscar_placeholder: "Buscar por nombre o color…",
    filtro_ordenar: "Ordenar por",
    filtro_orden_novedades: "Novedades",
    filtro_orden_precio_asc: "Precio: menor a mayor",
    filtro_orden_precio_desc: "Precio: mayor a menor",
    filtro_orden_vendidos: "Más vendidos",
    filtro_colores: "Color",
    filtro_solo_disponibles: "Solo disponibles",
    filtro_limpiar: "Limpiar filtros",
    filtro_filtros: "Filtros",
    filtro_sin_resultados: "No encontramos productos con esos filtros.",
    filtro_resultados_uno: "producto",
    filtro_resultados_varios: "productos",
    filtro_categoria: "Categoría",
    filtro_todas: "Todas",
    buscar_titulo: "Buscar",
    todos_titulo: "Todos los productos",
    checkout_y_los: "y los",
    ship_label: "Envío",
    ship_gratis: "Gratis",
    ship_a_cotizar: "A COTIZAR",
    ship_intl_rango: "Aproximadamente entre",
    ship_intl_nota: "Te confirmamos el valor exacto antes de que pagues.",
    ship_faltan_prefix: "Te faltan",
    ship_faltan_sufijo: "para envío gratis",
    ship_ya_gratis: "¡Tienes envío gratis!",
    ship_total_mas_envio: "Total sin envío. El envío se suma cuando lo cotizamos.",
    ship_descuento_nota: "El código de descuento se resta al confirmar el pedido.",

    // Checkout
    checkout_title: "Finalizar compra",
    checkout_contacto: "Contacto",
    checkout_nombre: "Nombre completo",
    checkout_correo: "Correo electrónico",
    checkout_telefono: "Teléfono",
    checkout_direccion_envio: "Dirección de envío",
    checkout_direccion: "Dirección",
    checkout_apartamento: "Apartamento, casa, etc. (opcional)",
    checkout_ciudad: "Ciudad",
    checkout_departamento: "Departamento",
    checkout_codigo_descuento: "Código de descuento",
    checkout_acepto_prefix: "He leído y acepto la",
    checkout_politica_datos: "política de tratamiento de datos personales",
    checkout_pagar_ahora: "Pagar ahora",
    checkout_procesando: "Procesando...",
    checkout_resumen: "Resumen",
    checkout_envio_impuestos: "Envío e impuestos se calculan al confirmar.",
    checkout_carrito_vacio: "Tu carrito está vacío",
    checkout_agrega_productos: "Agrega productos antes de pagar.",
    checkout_pasarela_no_configurada:
      "La pasarela de pago todavía no está configurada. Contacta al equipo.",
    checkout_dev_mode: "Modo desarrollo: Wompi aún no está conectado con llaves reales. Pedido creado en estado pendiente.",
    checkout_simular_pago: "Simular pago aprobado",
    checkout_metodo_pago: "Método de pago",
    checkout_pagar_tarjeta_pse: "Tarjeta / PSE",
    checkout_pagar_addi: "Addi — paga después",
    checkout_pago_tarjeta_desc: "Tarjeta débito o crédito, PSE, Nequi",
    checkout_pago_addi_desc: "Compra hoy y paga en cuotas, sin tarjeta",
    checkout_cedula: "Número de cédula",
    checkout_redirigiendo_addi: "Redirigiendo a Addi...",
    checkout_tipo_envio: "Tipo de envío",
    checkout_envio_nacional: "Nacional (Colombia)",
    checkout_envio_internacional: "Internacional",
    checkout_pais: "País",
    checkout_estado_provincia: "Estado / provincia (opcional)",
    checkout_codigo_postal: "Código postal",
    checkout_telefono_intl: "Teléfono con código de país (ej. +1 555 123 4567)",
    checkout_intl_aviso:
      "El envío internacional lo cotizamos con DHL según tu destino. Te enviaremos por correo el valor del envío y un link de pago — no pagas nada hasta que lo confirmes.",
    checkout_solicitar_cotizacion: "Solicitar cotización de envío",
    checkout_envio_por_cotizar: "Envío internacional: por cotizar",

    // Pedido con envío internacional por cotizar
    order_cotizacion_titulo: "¡Recibimos tu pedido!",
    order_cotizacion_texto:
      "Vamos a cotizar el envío internacional con DHL y te escribiremos a tu correo con el costo total y el link de pago. Guarda tu número de pedido.",

    // Página de pago (pedidos internacionales)
    pay_title: "Pagar tu pedido",
    pay_envio_intl: "Envío internacional (DHL)",
    pay_boton: "Pagar ahora",
    pay_no_cotizado:
      "Este pedido todavía no tiene el envío cotizado. Te avisaremos por correo cuando esté listo para pagar.",
    pay_no_disponible: "Este pedido ya fue pagado o no está disponible para pago.",
    pay_sin_pasarela: "La pasarela de pago todavía no está configurada. Contacta al equipo.",

    // Rastrear pedido
    track_title: "Rastrea tu pedido",
    track_subtitle: "Ingresa tu número de pedido y el correo con el que compraste.",
    track_numero_pedido: "Número de pedido, ej. PAO-ABC123",
    track_correo: "Correo electrónico",
    track_buscar: "Buscar pedido",
    track_buscando: "Buscando...",
    track_pedido: "Pedido",
    track_enviado_con: "Enviado con",
    track_numero_guia: "Número de guía",
    track_whatsapp_ayuda:
      "Escríbenos por WhatsApp con este número si quieres que te ayudemos a consultar el estado exacto de tu envío.",
    track_total: "Total",
    track_ayuda_prefix: "¿Necesitas ayuda con tu pedido? Escríbenos por",
    track_o_revisa: "o revisa nuestra",
    track_pagina_info: "página de información",

    // Popup
    popup_title: "5% para ti",
    popup_subtitle: "Déjanos tu correo y recibe 5% de descuento en tu primera compra.",
    popup_email_placeholder: "tu@correo.com",
    popup_cta: "Quiero mi descuento",
    popup_enviando: "Enviando...",
    popup_cerrar: "Cerrar",
    popup_listo: "¡Listo! 🎉",
    popup_usa_codigo: "Usa este código en tu compra:",

    // Confirmación de pedido
    order_gracias: "¡Gracias por tu compra!",
    order_recibido: "Pedido recibido",
    order_pago_rechazado: "Pago no completado",
    order_pago_esperando:
      "Estamos esperando la confirmación de tu pago. Esta página se actualiza sola. Si cancelaste, puedes intentarlo de nuevo.",
    order_pago_rechazado_texto:
      "El pago no se completó y no se te cobró. Puedes intentarlo de nuevo con el mismo u otro método.",
    order_reintentar_pago: "Intentar de nuevo",
    order_seguir_comprando: "Seguir comprando",

    // Language toggle
    lang_toggle_label: "Idioma",
  },
  en: {
    // Header
    nav_vestidos: "Dresses",
    nav_enterizos: "Jumpsuits",
    nav_tops: "Tops",
    nav_mi_pedido: "My order",
    nav_ver_carrito: "View cart",
    nav_abrir_menu: "Open menu",

    // Footer
    footer_comprar: "Shop",
    footer_ayuda: "Help",
    footer_contactanos: "Contact us",
    footer_envios_pagos: "Shipping & payments",
    footer_cambios_devoluciones: "Exchanges & returns",
    footer_rastrea_pedido: "Track your order",
    footer_tratamiento_datos: "Privacy policy",
    footer_derechos: "All rights reserved.",

    // Home
    home_hero_title: "Activewear to move like you are",
    home_hero_subtitle:
      "Feminine, comfortable and versatile designs to train, go out, or simply be yourself.",
    home_hero_cta: "Shop the collection",
    home_proximamente: "Coming soon",
    home_mas_comprados: "Best sellers",
    category_empty: "You'll find products here soon.",

    // Product card / detail
    product_agotado: "Sold out",
    product_ver_producto: "View product",
    product_color: "Color",
    product_agregar_carrito: "Add to cart",
    product_agregado: "Added! Add another",
    product_foto_proximamente: "Photo coming soon",
    product_foto_anterior: "Previous photo",
    product_foto_siguiente: "Next photo",
    product_talla_unica: "One size",

    // Cart
    cart_title: "Your cart",
    cart_empty: "Your cart is empty",
    cart_ver_coleccion: "Shop the collection",
    cart_color: "Color",
    cart_quitar: "Remove",
    cart_subtotal: "Subtotal",
    cart_finalizar_compra: "Checkout",
    cart_cerrar: "Close",
    cart_cerrar_carrito: "Close cart",
    cart_envio_calcula: "Shipping is calculated at the next step.",
    footer_terminos: "Terms and conditions",
    product_mas_vendido: "Best seller",
    nav_buscar: "Search",
    nav_todo: "All",
    filtro_buscar_placeholder: "Search by name or color…",
    filtro_ordenar: "Sort by",
    filtro_orden_novedades: "Newest",
    filtro_orden_precio_asc: "Price: low to high",
    filtro_orden_precio_desc: "Price: high to low",
    filtro_orden_vendidos: "Best sellers",
    filtro_colores: "Color",
    filtro_solo_disponibles: "In stock only",
    filtro_limpiar: "Clear filters",
    filtro_filtros: "Filters",
    filtro_sin_resultados: "We couldn't find products with those filters.",
    filtro_resultados_uno: "product",
    filtro_resultados_varios: "products",
    filtro_categoria: "Category",
    filtro_todas: "All",
    buscar_titulo: "Search",
    todos_titulo: "All products",
    checkout_y_los: "and the",
    ship_label: "Shipping",
    ship_gratis: "Free",
    ship_a_cotizar: "TO BE QUOTED",
    ship_intl_rango: "Approximately between",
    ship_intl_nota: "We confirm the exact amount before you pay.",
    ship_faltan_prefix: "You're only",
    ship_faltan_sufijo: "away from free shipping",
    ship_ya_gratis: "You get free shipping!",
    ship_total_mas_envio: "Total without shipping. Shipping is added once we quote it.",
    ship_descuento_nota: "The discount code is applied when you confirm the order.",

    // Checkout
    checkout_title: "Checkout",
    checkout_contacto: "Contact",
    checkout_nombre: "Full name",
    checkout_correo: "Email",
    checkout_telefono: "Phone",
    checkout_direccion_envio: "Shipping address",
    checkout_direccion: "Address",
    checkout_apartamento: "Apartment, house, etc. (optional)",
    checkout_ciudad: "City",
    checkout_departamento: "State/Department",
    checkout_codigo_descuento: "Discount code",
    checkout_acepto_prefix: "I have read and accept the",
    checkout_politica_datos: "personal data processing policy",
    checkout_pagar_ahora: "Pay now",
    checkout_procesando: "Processing...",
    checkout_resumen: "Summary",
    checkout_envio_impuestos: "Shipping and taxes are calculated at confirmation.",
    checkout_carrito_vacio: "Your cart is empty",
    checkout_agrega_productos: "Add products before checking out.",
    checkout_pasarela_no_configurada:
      "The payment gateway isn't configured yet. Please contact us.",
    checkout_dev_mode: "Development mode: Wompi isn't connected with real keys yet. Order created as pending.",
    checkout_simular_pago: "Simulate approved payment",
    checkout_metodo_pago: "Payment method",
    checkout_pagar_tarjeta_pse: "Card / PSE",
    checkout_pagar_addi: "Addi — pay later",
    checkout_pago_tarjeta_desc: "Debit or credit card, PSE, Nequi",
    checkout_pago_addi_desc: "Buy today and pay in installments, no card needed",
    checkout_cedula: "ID number (cédula)",
    checkout_redirigiendo_addi: "Redirecting to Addi...",
    checkout_tipo_envio: "Shipping type",
    checkout_envio_nacional: "Domestic (Colombia)",
    checkout_envio_internacional: "International",
    checkout_pais: "Country",
    checkout_estado_provincia: "State / province (optional)",
    checkout_codigo_postal: "Postal code",
    checkout_telefono_intl: "Phone with country code (e.g. +1 555 123 4567)",
    checkout_intl_aviso:
      "We quote international shipping with DHL based on your destination. We'll email you the shipping cost and a payment link — you pay nothing until you confirm it.",
    checkout_solicitar_cotizacion: "Request shipping quote",
    checkout_envio_por_cotizar: "International shipping: to be quoted",

    // Order with international shipping pending a quote
    order_cotizacion_titulo: "We received your order!",
    order_cotizacion_texto:
      "We'll quote international shipping with DHL and email you the total cost and a payment link. Keep your order number.",

    // Payment page (international orders)
    pay_title: "Pay for your order",
    pay_envio_intl: "International shipping (DHL)",
    pay_boton: "Pay now",
    pay_no_cotizado:
      "This order doesn't have a shipping quote yet. We'll email you when it's ready to pay.",
    pay_no_disponible: "This order was already paid or isn't available for payment.",
    pay_sin_pasarela: "The payment gateway isn't configured yet. Please contact us.",

    // Rastrear pedido
    track_title: "Track your order",
    track_subtitle: "Enter your order number and the email you used to buy.",
    track_numero_pedido: "Order number, e.g. PAO-ABC123",
    track_correo: "Email",
    track_buscar: "Track order",
    track_buscando: "Searching...",
    track_pedido: "Order",
    track_enviado_con: "Shipped with",
    track_numero_guia: "Tracking number",
    track_whatsapp_ayuda:
      "Message us on WhatsApp with this number if you'd like help checking your shipment's exact status.",
    track_total: "Total",
    track_ayuda_prefix: "Need help with your order? Message us on",
    track_o_revisa: "or check our",
    track_pagina_info: "information page",

    // Popup
    popup_title: "5% off for you",
    popup_subtitle: "Leave us your email and get 5% off your first purchase.",
    popup_email_placeholder: "you@email.com",
    popup_cta: "I want my discount",
    popup_enviando: "Sending...",
    popup_cerrar: "Close",
    popup_listo: "All set! 🎉",
    popup_usa_codigo: "Use this code on your purchase:",

    // Order confirmation
    order_gracias: "Thanks for your purchase!",
    order_recibido: "Order received",
    order_pago_rechazado: "Payment not completed",
    order_pago_esperando:
      "We're waiting for your payment confirmation. This page updates by itself. If you cancelled, you can try again.",
    order_pago_rechazado_texto:
      "The payment wasn't completed and you were not charged. You can try again with the same or another method.",
    order_reintentar_pago: "Try again",
    order_seguir_comprando: "Keep shopping",

    // Language toggle
    lang_toggle_label: "Language",
  },
} as const;

export type DictionaryKey = keyof (typeof dictionary)["es"];

export function t(locale: Locale, key: DictionaryKey): string {
  return dictionary[locale][key] ?? dictionary.es[key];
}

export const CATEGORY_LABEL_KEY = {
  Vestidos: "nav_vestidos",
  Enterizos: "nav_enterizos",
  Tops: "nav_tops",
} as const satisfies Record<string, DictionaryKey>;

export function categoryProductCount(locale: Locale, count: number): string {
  if (locale === "en") return `${count} product${count === 1 ? "" : "s"}`;
  return `${count} producto${count === 1 ? "" : "s"}`;
}

const COLOR_NAME_EN: Record<string, string> = {
  rosa: "Pink",
  morado: "Purple",
  celeste: "Sky Blue",
  blanco: "White",
  negro: "Black",
  vinotinto: "Wine Red",
  café: "Brown",
  gris: "Gray",
  azul: "Blue",
  verde: "Green",
  amarillo: "Yellow",
  naranja: "Orange",
  beige: "Beige",
  rojo: "Red",
  fucsia: "Fuchsia",
  lila: "Lilac",
};

// Los nombres de color se guardan en español; para inglés usamos un
// diccionario de colores comunes en vez de agregar otro campo editable
// por producto — son palabras cerradas y predecibles.
export function translateColorName(locale: Locale, name: string): string {
  if (locale !== "en") return name;
  return COLOR_NAME_EN[name.trim().toLowerCase()] ?? name;
}
