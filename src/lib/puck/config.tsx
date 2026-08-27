import type { Config } from "@measured/puck";
import { ImageUploadField } from "@/components/image-upload-field";
import { ColorField } from "@/components/color-field";
import { SiteCarousel } from "@/components/site-carousel";
import { StylePicker, LIST_STYLE_ICONS, AGENDA_STYLE_ICONS } from "@/components/style-picker";
import { CardStrip } from "@/components/card-strip";
import { FormatToggle, formatStyle, type TextFormat } from "@/components/format-toggle";
import { NudgeField, offsetTransform, type Offset } from "@/components/nudge-field";
import { RangeField } from "@/components/range-field";
import { RichEditor } from "@/components/rich-editor";
import { RsvpForm } from "@/components/rsvp-form";
import { SiteNav } from "@/components/site-nav";
import { QuestionsEditor } from "@/components/questions-editor";
import { SiteGiftCards } from "@/components/site-gift-cards";
import { parseInline } from "@/lib/rich-text";

/* ---------- fuentes disponibles ---------- */

const FONTS: Record<string, string> = {
  "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif",
  "Playfair Display": "'Playfair Display', Georgia, serif",
  "EB Garamond": "'EB Garamond', Georgia, serif",
  Lora: "'Lora', Georgia, serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
  Poppins: "'Poppins', system-ui, sans-serif",
  "Work Sans": "'Work Sans', system-ui, sans-serif",
};

const fontOptions = Object.keys(FONTS).map((f) => ({ label: f, value: f }));

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Playfair+Display:wght@400;500;600&family=EB+Garamond:wght@400;500&family=Lora:wght@400;500&family=Montserrat:wght@400;500;600&family=Poppins:wght@400;500;600&family=Work+Sans:wght@400;500;600&display=swap";

const SIZE_SCALE: Record<string, number> = {
  Pequeño: 0.85,
  Normal: 1,
  Grande: 1.2,
  Enorme: 1.45,
};
const sizeOptions = Object.keys(SIZE_SCALE).map((s) => ({ label: s, value: s }));

// Tamaño de las imágenes dentro de un bloque (ancho máximo y alto en px).
const IMG_SIZE: Record<string, { w: number; h: number }> = {
  s: { w: 200, h: 220 },
  m: { w: 300, h: 320 },
  l: { w: 420, h: 440 },
  full: { w: 9999, h: 520 },
};
const imgSizeOptions = [
  { label: "Pequeña", value: "s" },
  { label: "Mediana", value: "m" },
  { label: "Grande", value: "l" },
  { label: "Completa", value: "full" },
];

// Cada "tipo" de texto define su tamaño y grosor automáticamente.
const TEXT_VARIANTS: Record<
  string,
  {
    tag: string;
    size: number;
    weight: number;
    font: string;
    spacing: string;
    line: number;
    color: string;
  }
> = {
  h1: { tag: "h1", size: 48, weight: 600, font: "var(--wf-heading)", spacing: "0.01em", line: 1.15, color: "var(--wf-accent)" },
  h2: { tag: "h2", size: 32, weight: 600, font: "var(--wf-heading)", spacing: "0.02em", line: 1.2, color: "var(--wf-accent)" },
  h3: { tag: "h3", size: 21, weight: 500, font: "var(--wf-heading)", spacing: "0.14em", line: 1.3, color: "var(--wf-text)" },
  p: { tag: "p", size: 18, weight: 400, font: "var(--wf-body)", spacing: "0", line: 1.7, color: "var(--wf-text)" },
  small: { tag: "p", size: 14, weight: 400, font: "var(--wf-body)", spacing: "0.02em", line: 1.6, color: "var(--wf-text)" },
};

const VARIANT_LABEL: Record<string, string> = {
  h1: "Título grande",
  h2: "Título",
  h3: "Subtítulo",
  p: "Texto",
  small: "Texto pequeño",
};

/* ---------- estilos base (usan variables del tema) ---------- */

const section: React.CSSProperties = {
  padding: "72px 24px",
  maxWidth: 900,
  margin: "0 auto",
  textAlign: "center",
  fontFamily: "var(--wf-body)",
  color: "var(--wf-text)",
};

const heading: React.CSSProperties = {
  fontFamily: "var(--wf-heading)",
  color: "var(--wf-accent)",
  fontSize: "calc(34px * var(--wf-scale, 1))",
  fontWeight: 500,
  letterSpacing: "0.02em",
  marginBottom: 24,
};

const body: React.CSSProperties = {
  fontSize: "calc(19px * var(--wf-scale, 1))",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

// Campos de color reutilizables para todas las secciones.
const colorFields = {
  colorText: {
    type: "custom" as const,
    label: "Color del texto",
    render: ({ onChange, value }: { onChange: (v: string) => void; value: unknown }) => (
      <ColorField value={value as string} onChange={onChange} label="Color del texto" />
    ),
  },
  colorBg: {
    type: "custom" as const,
    label: "Color de fondo",
    render: ({ onChange, value }: { onChange: (v: string) => void; value: unknown }) => (
      <ColorField value={value as string} onChange={onChange} label="Color de fondo" />
    ),
  },
};

const colorDefaults = { colorText: "", colorBg: "" };

// --- Bloques de texto libres: cualquier sección puede tener varios
//     títulos / párrafos de distintos tipos, como en "Texto". ---
type TextBlock = {
  variant: string;
  content: string;
  align?: "left" | "center" | "right";
  colorText?: string;
  format?: TextFormat;
};

const textBlocksField = {
  type: "array" as const,
  label: "Textos",
  getItemSummary: (t: TextBlock) =>
    (t.content ? t.content.replace(/<[^>]+>/g, "").slice(0, 24) : "Texto") +
    (t.variant && t.variant !== "p" ? ` · ${VARIANT_LABEL[t.variant] ?? ""}` : ""),
  arrayFields: {
    variant: {
      type: "select" as const,
      label: "Tipo",
      options: [
        { label: "Título grande", value: "h1" },
        { label: "Título", value: "h2" },
        { label: "Subtítulo", value: "h3" },
        { label: "Texto", value: "p" },
        { label: "Texto pequeño", value: "small" },
      ],
    },
    content: {
      type: "custom" as const,
      label: "Contenido",
      render: ({ onChange, value }: { onChange: (v: string) => void; value: unknown }) => (
        <RichEditor value={value as string} onChange={onChange} label="Contenido" />
      ),
    },
    align: {
      type: "radio" as const,
      label: "Alineación",
      options: [
        { label: "Izq.", value: "left" },
        { label: "Centro", value: "center" },
        { label: "Der.", value: "right" },
      ],
    },
    colorText: {
      type: "custom" as const,
      label: "Color de la letra",
      render: ({ onChange, value }: { onChange: (v: string) => void; value: unknown }) => (
        <ColorField value={value as string} onChange={onChange} label="Color de la letra" />
      ),
    },
    format: {
      type: "custom" as const,
      label: "Formato",
      render: ({ onChange, value }: { onChange: (v: TextFormat) => void; value: unknown }) => (
        <FormatToggle value={value as TextFormat} onChange={onChange} />
      ),
    },
  },
  defaultItemProps: {
    variant: "p",
    content: "Nuevo texto",
    format: {},
    align: "center" as const,
    colorText: "",
  },
};

function TextBlocks({
  texts,
  onDark,
  gap = 14,
}: {
  texts?: TextBlock[];
  onDark?: boolean;
  gap?: number;
}) {
  return (
    <div style={{ display: "grid", gap }}>
      {(texts ?? []).map((t, i) => {
        const V = TEXT_VARIANTS[t.variant] ?? TEXT_VARIANTS.p;
        const Tag = (V.tag ?? "p") as React.ElementType;
        return (
          <Tag
            key={i}
            style={{
              textAlign: (t.align ?? "center") as React.CSSProperties["textAlign"],
              fontFamily: V.font,
              fontSize: `calc(${V.size}px * var(--wf-scale, 1))`,
              fontWeight: V.weight,
              letterSpacing: V.spacing,
              lineHeight: V.line,
              color: t.colorText || (onDark ? "#fff" : V.color),
              whiteSpace: "pre-wrap",
              margin: 0,
              ...formatStyle(t.format),
            }}
          >
            {parseInline(t.content)}
          </Tag>
        );
      })}
    </div>
  );
}

// Convierte los campos antiguos (titulo/subtitulo/texto) a bloques.
function legadoATextos(p: {
  titulo?: string;
  subtitulo?: string;
  texto?: string;
}): TextBlock[] {
  const out: TextBlock[] = [];
  if (p.titulo) out.push({ variant: "h2", content: p.titulo, align: "center" });
  if (p.subtitulo) out.push({ variant: "h3", content: p.subtitulo, align: "center" });
  if (p.texto) out.push({ variant: "p", content: p.texto, align: "center" });
  return out;
}

/* ---------- tipos ---------- */

type RootProps = {
  fontHeading: string;
  fontBody: string;
  colorText: string;
  colorBackground: string;
  colorAccent: string;
  size: string;
  navEnabled: string;
  navTitle: string;
  navLinks: { label: string; href: string }[];
};

type Props = {
  Hero: {
    coupleNames: string;
    date: string;
    subtitle: string;
    image?: string;
    align: string;
    textColor: string;
    colorBg: string;
    imageMode: string;
    imageSize: string;
    imageOffset: Offset;
    overlay: number;
  };
  RichText: {
    texts: {
      variant: string;
      content: string;
      format: TextFormat;
      align: string;
      colorText: string;
    }[];
    colorBg: string;
    image?: string;
    imageMode: string;
    imageSize: string;
    imageOffset: Offset;
    overlay: number;
  };
  MediaText: {
    title: string;
    text: string;
    image?: string;
    imagePosition: string;
    buttonLabel: string;
    buttonUrl: string;
    colorText: string;
    colorBg: string;
  };
  Carousel: { title: string; images: { src: string; caption: string; linkUrl: string }[] };
  List: {
    estilo: string;
    title: string;
    colorText: string;
    colorBg: string;
    items: {
      image?: string;
      imgSide: string;
      eyebrow: string;
      itemTitle: string;
      text: string;
      linkLabel: string;
      linkUrl: string;
    }[];
  };
  Countdown: { title: string; targetDate: string; colorText: string; colorBg: string };
  Gallery: { images: { src: string }[]; columnas: string; colorText: string; colorBg: string };
  Schedule: {
    title: string;
    estilo: string;
    image?: string;
    colorText: string;
    colorBg: string;
    items: { time: string; label: string; note: string }[];
  };
  Location: {
    title: string;
    venue: string;
    address: string;
    mapsUrl: string;
    colorText: string;
    colorBg: string;
  };
  CTA: {
    title: string;
    text: string;
    buttonLabel: string;
    buttonUrl: string;
    align: string;
    colorText: string;
    colorBg: string;
  };
  GiftList: {
    textos: {
      variant: string;
      content: string;
      align?: "left" | "center" | "right";
      colorText?: string;
      format?: TextFormat;
    }[];
    mostrar: "tarjetas" | "boton";
    buttonLabel: string;
    buttonUrl: string;
    // legado (webs guardadas antes de la migración)
    titulo?: string;
    subtitulo?: string;
    texto?: string;
    colorText: string;
    colorBg: string;
  };
  FAQ: { title: string; items: { q: string; a: string }[]; colorText: string; colorBg: string };
  RSVP: {
    title: string;
    text: string;
    buttonLabel: string;
    buttonUrl: string;
    colorText: string;
    colorBg: string;
    packEstandar: string;
    questions: {
      label: string;
      qtype: string;
      options: string;
      condLabel: string;
      condValue: string;
    }[];
  };
};

/* ---------- config ---------- */

export const puckConfig: Config<Props, RootProps> = {
  categories: {
    Principales: {
      title: "Principales",
      components: ["Hero", "RichText", "MediaText", "List", "Schedule", "CTA"],
    },
    "Bloques de boda": {
      title: "Bloques de boda",
      components: ["GiftList", "Gallery", "Countdown", "Location", "FAQ", "RSVP"],
    },
  },
  root: {
    fields: {
      fontHeading: { type: "select", label: "Tipografía de títulos", options: fontOptions },
      fontBody: { type: "select", label: "Tipografía de texto", options: fontOptions },
      size: { type: "select", label: "Tamaño general del texto", options: sizeOptions },
      colorAccent: {
        type: "custom",
        label: "Color principal (títulos)",
        render: ({ onChange, value }) => (
          <ColorField value={value as string} onChange={onChange} label="Color principal" />
        ),
      },
      colorText: {
        type: "custom",
        label: "Color del texto",
        render: ({ onChange, value }) => (
          <ColorField value={value as string} onChange={onChange} label="Color del texto" />
        ),
      },
      colorBackground: {
        type: "custom",
        label: "Color de fondo",
        render: ({ onChange, value }) => (
          <ColorField value={value as string} onChange={onChange} label="Color de fondo" />
        ),
      },
      navEnabled: {
        type: "radio",
        label: "Barra de navegación arriba",
        options: [
          { label: "No", value: "no" },
          { label: "Sí", value: "si" },
        ],
      },
      navTitle: { type: "text", label: "Nombre en la barra (izquierda)" },
      navLinks: {
        type: "array",
        label: "Enlaces de la barra",
        getItemSummary: (l) => l.label || "Enlace",
        arrayFields: {
          label: { type: "text", label: "Texto" },
          href: { type: "text", label: "Destino (p. ej. #agenda o una URL)" },
        },
        defaultItemProps: { label: "Sección", href: "#" },
      },
    },
    defaultProps: {
      fontHeading: "Cormorant Garamond",
      fontBody: "Work Sans",
      size: "Normal",
      colorText: "#3d3a34",
      colorBackground: "#ffffff",
      colorAccent: "#8a6d3b",
      navEnabled: "no",
      navTitle: "",
      navLinks: [
        { label: "La boda", href: "#agenda" },
        { label: "Cómo llegar", href: "#ubicacion" },
        { label: "Confirmar", href: "#rsvp" },
      ],
    },
    render: ({
      children,
      fontHeading,
      fontBody,
      colorText,
      colorBackground,
      colorAccent,
      size,
      navEnabled,
      navTitle,
      navLinks,
    }) => (
      <div
        style={
          {
            "--wf-heading": FONTS[fontHeading] ?? FONTS["Cormorant Garamond"],
            "--wf-body": FONTS[fontBody] ?? FONTS["Work Sans"],
            "--wf-text": colorText,
            "--wf-bg": colorBackground,
            "--wf-accent": colorAccent,
            "--wf-scale": SIZE_SCALE[size] ?? 1,
            background: colorBackground,
            color: colorText,
            fontFamily: FONTS[fontBody] ?? FONTS["Work Sans"],
          } as React.CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        {navEnabled === "si" && <SiteNav title={navTitle} links={navLinks ?? []} />}
        {children}
      </div>
    ),
  },

  components: {
    Hero: {
      label: "Portada",
      fields: {
        subtitle: { type: "text", label: "Línea superior (pequeña)" },
        coupleNames: { type: "text", label: "Título grande" },
        date: { type: "text", label: "Línea inferior" },
        align: {
          type: "radio",
          label: "Alineación",
          options: [
            { label: "Centro", value: "center" },
            { label: "Izquierda", value: "left" },
          ],
        },
        textColor: {
          type: "custom",
          label: "Color del texto",
          render: ({ onChange, value }) => (
            <ColorField value={value as string} onChange={onChange} label="Color del texto" />
          ),
        },
        colorBg: colorFields.colorBg,
        imageMode: {
          type: "select",
          label: "Foto",
          options: [
            { label: "Sin foto", value: "none" },
            { label: "De fondo", value: "background" },
            { label: "A la izquierda", value: "left" },
            { label: "A la derecha", value: "right" },
          ],
        },
        imageSize: {
          type: "select",
          label: "Tamaño de la foto (izquierda/derecha)",
          options: imgSizeOptions,
        },
        imageOffset: {
          type: "custom",
          label: "Mover la foto",
          render: ({ onChange, value }) => (
            <NudgeField value={value as Offset} onChange={onChange} label="Mover la foto" />
          ),
        },
        overlay: {
          type: "custom",
          label: "Oscurecer la foto",
          render: ({ onChange, value }) => (
            <RangeField
              value={value as number}
              onChange={onChange}
              label="Oscurecer la foto (para leer el texto)"
              max={80}
            />
          ),
        },
        image: {
          type: "custom",
          label: "Imagen",
          render: ({ onChange, value }) => (
            <ImageUploadField value={value as string} onChange={onChange} label="Imagen" />
          ),
        },
      },
      defaultProps: {
        coupleNames: "Ana & Leo",
        date: "12 de septiembre de 2026",
        subtitle: "¡Nos casamos!",
        image: "",
        align: "center",
        textColor: "",
        colorBg: "",
        imageMode: "background",
        imageSize: "full",
        imageOffset: { x: 0, y: 0 },
        overlay: 35,
      },
      render: ({ coupleNames, date, subtitle, image, align, textColor, colorBg, imageMode, imageSize, imageOffset, overlay }) => {
        const mode = imageMode ?? "background";
        const hasImg = Boolean(image) && mode !== "none";
        const onDark = hasImg && mode === "background";
        const isz = IMG_SIZE[imageSize] ?? IMG_SIZE.full;
        const fullImg = (imageSize ?? "full") === "full";
        const imgTransform = offsetTransform(imageOffset);
        const bgPos = `calc(50% + ${imageOffset?.x ?? 0}px) calc(50% + ${imageOffset?.y ?? 0}px)`;
        const ov = (overlay ?? 35) / 100;

        const texts = (
          <>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--wf-body)",
                fontSize: "calc(15px * var(--wf-scale, 1))",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              {parseInline(subtitle)}
            </p>
          )}
          {coupleNames && (
            <h1
              style={{ fontSize: "calc(64px * var(--wf-scale, 1))", fontWeight: 500, margin: "12px 0" }}
            >
              {parseInline(coupleNames)}
            </h1>
          )}
          {date && (
            <p style={{ fontSize: "calc(22px * var(--wf-scale, 1))", letterSpacing: "0.1em" }}>
              {parseInline(date)}
            </p>
          )}
          </>
        );

        const textColumn = (
          <div
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: align === "left" ? "flex-start" : "center",
              justifyContent: "center",
              textAlign: align === "left" ? "left" : "center",
              color: textColor || (onDark ? "#fff" : "var(--wf-accent)"),
              padding: "64px clamp(24px, 6vw, 72px)",
              fontFamily: "var(--wf-heading)",
              minHeight: 420,
            }}
          >
            {texts}
          </div>
        );

        // Foto a un lado: media pantalla imagen, media texto.
        if (hasImg && (mode === "left" || mode === "right")) {
          return (
            <div style={{ background: colorBg || "var(--wf-bg)" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: fullImg ? 0 : 40,
                maxWidth: fullImg ? undefined : 1100,
                margin: fullImg ? undefined : "0 auto",
                padding: fullImg ? 0 : "48px 24px",
                flexDirection: mode === "right" ? "row-reverse" : "row",
              }}
            >
              <div style={{ flex: fullImg ? "1 1 320px" : "1 1 260px", minWidth: 240, textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  style={{
                    width: "100%",
                    maxWidth: fullImg ? "100%" : isz.w,
                    height: fullImg ? 460 : isz.h,
                    objectFit: "cover",
                    borderRadius: fullImg ? 0 : 4,
                    transform: imgTransform,
                  }}
                />
              </div>
              {textColumn}
            </div>
            </div>
          );
        }

        // Foto de fondo (o sin foto).
        return (
          <div
            style={{
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
              alignItems: align === "left" ? "flex-start" : "center",
              justifyContent: "center",
              textAlign: align === "left" ? "left" : "center",
              color: textColor || (onDark ? "#fff" : "var(--wf-accent)"),
              padding: "24px clamp(24px, 8vw, 96px)",
              backgroundImage: onDark
                ? `linear-gradient(rgba(0,0,0,${ov}),rgba(0,0,0,${ov})), url(${image})`
                : undefined,
              backgroundColor: onDark ? undefined : colorBg || "var(--wf-bg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              fontFamily: "var(--wf-heading)",
            }}
          >
            {texts}
          </div>
        );
      },
    },

    RichText: {
      label: "Texto",
      fields: {
        texts: {
          type: "array",
          label: "Textos de la sección",
          getItemSummary: (t) =>
            (t.content ? t.content.slice(0, 24) : "Texto") +
            (t.variant && t.variant !== "p" ? ` · ${VARIANT_LABEL[t.variant] ?? ""}` : ""),
          arrayFields: {
            variant: {
              type: "select",
              label: "Tipo",
              options: [
                { label: "Título grande", value: "h1" },
                { label: "Título", value: "h2" },
                { label: "Subtítulo", value: "h3" },
                { label: "Texto", value: "p" },
                { label: "Texto pequeño", value: "small" },
              ],
            },
            content: {
              type: "custom",
              label: "Contenido",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Contenido" />
              ),
            },
            align: {
              type: "radio",
              label: "Alineación",
              options: [
                { label: "Izq.", value: "left" },
                { label: "Centro", value: "center" },
                { label: "Der.", value: "right" },
              ],
            },
            colorText: {
              type: "custom",
              label: "Color de la letra",
              render: ({ onChange, value }) => (
                <ColorField value={value as string} onChange={onChange} label="Color de la letra" />
              ),
            },
            format: {
              type: "custom",
              label: "Formato de todo el texto",
              render: ({ onChange, value }) => (
                <FormatToggle value={value as TextFormat} onChange={onChange} />
              ),
            },
          },
          defaultItemProps: { variant: "p", content: "Nuevo texto", format: {}, align: "center", colorText: "" },
        },
        colorBg: {
          type: "custom",
          label: "Color de fondo de la sección",
          render: ({ onChange, value }) => (
            <ColorField value={value as string} onChange={onChange} label="Color de fondo" />
          ),
        },
        imageMode: {
          type: "select",
          label: "Foto",
          options: [
            { label: "Sin foto", value: "none" },
            { label: "A la izquierda", value: "left" },
            { label: "A la derecha", value: "right" },
            { label: "De fondo", value: "background" },
          ],
        },
        imageSize: { type: "select", label: "Tamaño de la foto", options: imgSizeOptions },
        imageOffset: {
          type: "custom",
          label: "Mover la foto",
          render: ({ onChange, value }) => (
            <NudgeField value={value as Offset} onChange={onChange} label="Mover la foto" />
          ),
        },
        overlay: {
          type: "custom",
          label: "Oscurecer la foto",
          render: ({ onChange, value }) => (
            <RangeField value={value as number} onChange={onChange} label="Oscurecer la foto de fondo" max={80} />
          ),
        },
        image: {
          type: "custom",
          label: "Imagen",
          render: ({ onChange, value }) => (
            <ImageUploadField value={value as string} onChange={onChange} label="Imagen" />
          ),
        },
      },
      defaultProps: {
        texts: [
          { variant: "h2", content: "Título de la sección", format: {}, align: "center", colorText: "" },
          { variant: "p", content: "Escribe aquí tu texto.", format: {}, align: "center", colorText: "" },
        ],
        colorBg: "",
        image: "",
        imageMode: "none",
        imageSize: "m",
        imageOffset: { x: 0, y: 0 },
        overlay: 40,
      },
      render: ({ texts, colorBg, image, imageMode, imageSize, imageOffset, overlay }) => {
        const mode = imageMode ?? "none";
        const hasImg = Boolean(image) && mode !== "none";
        const isz = IMG_SIZE[imageSize] ?? IMG_SIZE.m;
        const fullImg = (imageSize ?? "m") === "full";
        const imgTransform = offsetTransform(imageOffset);
        const bgPos = `calc(50% + ${imageOffset?.x ?? 0}px) calc(50% + ${imageOffset?.y ?? 0}px)`;
        const onDark = hasImg && mode === "background" && fullImg;
        const ov = (overlay ?? 40) / 100;

        const textEl = (
          <div style={{ display: "grid", gap: 14 }}>
            {(texts ?? []).map((t, i) => {
              const V = TEXT_VARIANTS[t.variant] ?? TEXT_VARIANTS.p;
              const Tag = (V.tag ?? "p") as React.ElementType;
              return (
                <Tag
                  key={i}
                  style={{
                    textAlign: (t.align ?? "center") as React.CSSProperties["textAlign"],
                    fontFamily: V.font,
                    fontSize: `calc(${V.size}px * var(--wf-scale, 1))`,
                    fontWeight: V.weight,
                    letterSpacing: V.spacing,
                    lineHeight: V.line,
                    color: t.colorText || (onDark ? "#fff" : V.color),
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    ...formatStyle(t.format),
                  }}
                >
                  {parseInline(t.content)}
                </Tag>
              );
            })}
          </div>
        );

        // Foto de fondo a pantalla completa: texto encima con capa oscura.
        if (hasImg && mode === "background" && fullImg) {
          return (
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 340,
                padding: "72px 24px",
                backgroundImage: `linear-gradient(rgba(0,0,0,${ov}),rgba(0,0,0,${ov})), url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: bgPos,
              }}
            >
              <div style={{ maxWidth: 760, width: "100%" }}>{textEl}</div>
            </div>
          );
        }

        // Foto de fondo pero más pequeña: imagen centrada con márgenes, texto debajo.
        if (hasImg && mode === "background") {
          return (
            <div
              style={{
                background: colorBg || "transparent",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                style={{
                  width: "100%",
                  maxWidth: isz.w,
                  height: isz.h,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginBottom: 28,
                  transform: imgTransform,
                }}
              />
              <div style={{ maxWidth: 760, margin: "0 auto" }}>{textEl}</div>
            </div>
          );
        }

        // Foto a un lado: dos columnas que se apilan en móvil.
        if (hasImg) {
          return (
            <div style={{ background: colorBg || "transparent" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 40,
                  maxWidth: 1000,
                  margin: "0 auto",
                  padding: "56px 24px",
                  flexDirection: mode === "right" ? "row-reverse" : "row",
                }}
              >
                <div style={{ flex: fullImg ? "1 1 300px" : "0 1 auto", minWidth: 240, textAlign: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    style={{
                      width: "100%",
                      maxWidth: fullImg ? "100%" : isz.w,
                      height: fullImg ? 400 : isz.h,
                      objectFit: "cover",
                      borderRadius: 4,
                      transform: imgTransform,
                    }}
                  />
                </div>
                <div style={{ flex: "1 1 300px", minWidth: 260 }}>{textEl}</div>
              </div>
            </div>
          );
        }

        // Solo texto.
        return (
          <div
            style={{
              background: colorBg || "transparent",
              padding: colorBg ? "40px 24px" : "20px 24px",
            }}
          >
            <div style={{ maxWidth: 760, margin: "0 auto" }}>{textEl}</div>
          </div>
        );
      },
    },

    MediaText: {
      label: "Foto + texto",
      fields: {
        title: {
          type: "custom",
          label: "Título",
          render: ({ onChange, value }) => (
            <RichEditor value={value as string} onChange={onChange} label="Título" singleLine />
          ),
        },
        text: {
          type: "custom",
          label: "Texto",
          render: ({ onChange, value }) => (
            <RichEditor value={value as string} onChange={onChange} label="Texto" />
          ),
        },
        imagePosition: {
          type: "radio",
          label: "Posición de la foto",
          options: [
            { label: "Izquierda", value: "left" },
            { label: "Derecha", value: "right" },
          ],
        },
        image: {
          type: "custom",
          label: "Imagen",
          render: ({ onChange, value }) => (
            <ImageUploadField value={value as string} onChange={onChange} label="Imagen" />
          ),
        },
        buttonLabel: { type: "text", label: "Texto del botón (opcional)" },
        buttonUrl: { type: "text", label: "Enlace del botón" },
        ...colorFields,
      },
      defaultProps: {
        title: "Nuestro alojamiento recomendado",
        text: "Hemos reservado un bloque de habitaciones en el Hotel del Prado a 10 minutos de la finca. Menciona «Boda Ana y Leo» al reservar.",
        image: "",
        imagePosition: "left",
        buttonLabel: "",
        buttonUrl: "",
        ...colorDefaults,
      },
      render: ({ title, text, image, imagePosition, buttonLabel, buttonUrl, colorText, colorBg }) => (
        <div style={{ background: colorBg || "transparent" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 40,
            maxWidth: 1000,
            margin: "0 auto",
            padding: "64px 24px",
            flexDirection: imagePosition === "right" ? "row-reverse" : "row",
            fontFamily: "var(--wf-body)",
            color: colorText || "var(--wf-text)",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 4 }}
              />
            ) : (
              <div style={{ width: "100%", height: 380, background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)", borderRadius: 4 }} />
            )}
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <h2 style={{ ...heading, marginBottom: 16 }}>{parseInline(title)}</h2>
            <p style={body}>{parseInline(text)}</p>
            {buttonLabel && (
              <a
                href={buttonUrl || "#"}
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  padding: "10px 24px",
                  background: "var(--wf-accent)",
                  color: "#fff",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                }}
              >
                {buttonLabel}
              </a>
            )}
          </div>
        </div>
        </div>
      ),
    },

    Carousel: {
      label: "Carrusel de fotos",
      fields: {
        title: { type: "text", label: "Título (opcional)" },
        images: {
          type: "array",
          label: "Fotos",
          getItemSummary: (item) => item.caption || "Foto",
          arrayFields: {
            src: {
              type: "custom",
              render: ({ onChange, value }) => (
                <ImageUploadField value={value as string} onChange={onChange} label="Foto" />
              ),
            },
            caption: { type: "text", label: "Texto sobre la foto (opcional)" },
            linkUrl: { type: "text", label: "Enlace al pulsar (opcional)" },
          },
          defaultItemProps: { src: "", caption: "", linkUrl: "" },
        },
      },
      defaultProps: {
        title: "",
        images: [
          { src: "", caption: "", linkUrl: "" },
          { src: "", caption: "", linkUrl: "" },
          { src: "", caption: "", linkUrl: "" },
        ],
      },
      render: ({ title, images }) => (
        <div style={{ padding: "48px 0", fontFamily: "var(--wf-body)", color: "var(--wf-text)" }}>
          {title && <h2 style={{ ...heading, textAlign: "center" }}>{parseInline(title)}</h2>}
          <SiteCarousel slides={images ?? []} />
        </div>
      ),
    },

    List: {
      label: "Listado de items",
      fields: {
        estilo: {
          type: "custom",
          label: "Estilo del listado",
          render: ({ onChange, value }) => (
            <StylePicker
              value={value as string}
              onChange={onChange}
              label="Estilo del listado"
              options={[
                { value: "tarjetas", label: "Carrusel de tarjetas", icon: LIST_STYLE_ICONS.carrusel },
                { value: "lista-fotos", label: "Lista con fotos", icon: LIST_STYLE_ICONS["lista-fotos"] },
                { value: "lista-linea", label: "Lista con línea", icon: LIST_STYLE_ICONS["lista-linea"] },
                { value: "cronologia", label: "Cronología", icon: LIST_STYLE_ICONS.cronologia },
              ]}
            />
          ),
        },
        title: { type: "text", label: "Título (opcional)" },
        ...colorFields,
        items: {
          type: "array",
          label: "Items",
          getItemSummary: (item) => item.itemTitle || "Item",
          arrayFields: {
            image: {
              type: "custom",
              render: ({ onChange, value }) => (
                <ImageUploadField value={value as string} onChange={onChange} label="Imagen" />
              ),
            },
            imgSide: {
              type: "radio",
              label: "Foto (en «Lista con fotos»)",
              options: [
                { label: "Izquierda", value: "left" },
                { label: "Derecha", value: "right" },
              ],
            },
            eyebrow: {
              type: "custom",
              label: "Etiqueta / hora",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Etiqueta / hora" singleLine />
              ),
            },
            itemTitle: {
              type: "custom",
              label: "Título",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Título" singleLine />
              ),
            },
            text: {
              type: "custom",
              label: "Texto",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Texto" />
              ),
            },
            linkLabel: { type: "text", label: "Texto del enlace" },
            linkUrl: { type: "text", label: "Enlace (URL)" },
          },
          defaultItemProps: {
            image: "",
            imgSide: "left",
            eyebrow: "",
            itemTitle: "Nuevo item",
            text: "Descripción del item.",
            linkLabel: "",
            linkUrl: "",
          },
        },
      },
      defaultProps: {
        estilo: "tarjetas",
        title: "",
        ...colorDefaults,
        items: [
          {
            image: "",
            imgSide: "left",
            eyebrow: "VIERNES",
            itemTitle: "Cena de bienvenida",
            text: "Para quienes lleguéis la víspera, cena informal en el pueblo.",
            linkLabel: "Ver sitio",
            linkUrl: "",
          },
          {
            image: "",
            imgSide: "right",
            eyebrow: "SÁBADO",
            itemTitle: "La boda",
            text: "Ceremonia y celebración en la Finca Los Olivos.",
            linkLabel: "Cómo llegar",
            linkUrl: "",
          },
          {
            image: "",
            imgSide: "left",
            eyebrow: "DOMINGO",
            itemTitle: "Brunch de despedida",
            text: "Nos despedimos con un brunch tranquilo antes de la vuelta.",
            linkLabel: "",
            linkUrl: "",
          },
        ],
      },
      render: ({ estilo, title, items, colorText, colorBg }) => {
        const list = items ?? [];
        const st = estilo ?? "tarjetas";
        const wrap = (children: React.ReactNode) => (
          <div
            style={{
              padding: "56px 24px",
              fontFamily: "var(--wf-body)",
              color: colorText || "var(--wf-text)",
              background: colorBg || undefined,
            }}
          >
            {title && <h2 style={{ ...heading, textAlign: "center", color: colorText || heading.color }}>{parseInline(title)}</h2>}
            {children}
          </div>
        );
        const linkSpan = (label: string) =>
          label ? (
            <span
              style={{
                display: "inline-block",
                marginTop: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--wf-accent)",
              }}
            >
              {label} →
            </span>
          ) : null;
        const eyebrowP = (t: string) =>
          t ? (
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--wf-accent)",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              {parseInline(t)}
            </p>
          ) : null;
        const itemTitleH = (t: string) => (
          <h3
            style={{
              fontFamily: "var(--wf-heading)",
              fontSize: "calc(23px * var(--wf-scale, 1))",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            {parseInline(t)}
          </h3>
        );
        const bodyP = (t: string) => (
          <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.82, whiteSpace: "pre-wrap" }}>
            {parseInline(t)}
          </p>
        );
        if (st === "tarjetas") {
          return wrap(<CardStrip cards={list} />);
        }

        if (st === "lista-fotos") {
          return wrap(
            <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 48 }}>
              {list.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 32,
                    alignItems: "center",
                    flexDirection: c.imgSide === "right" ? "row-reverse" : "row",
                  }}
                >
                  <div style={{ flex: "1 1 240px", minWidth: 220 }}>
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt=""
                        style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 240,
                          borderRadius: 4,
                          background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: "1 1 240px", minWidth: 220 }}>
                    {eyebrowP(c.eyebrow)}
                    {itemTitleH(c.itemTitle)}
                    {bodyP(c.text)}
                    {c.linkUrl ? (
                      <a href={c.linkUrl} style={{ textDecoration: "none" }}>
                        {linkSpan(c.linkLabel)}
                      </a>
                    ) : (
                      linkSpan(c.linkLabel)
                    )}
                  </div>
                </div>
              ))}
            </div>,
          );
        }

        // lista-linea y cronologia: columna con línea vertical uniendo los items
        const cron = st === "cronologia";
        return wrap(
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {list.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: cron ? 20 : 24 }}>
                {cron && (
                  <div
                    style={{
                      flex: "0 0 64px",
                      textAlign: "right",
                      fontFamily: "var(--wf-heading)",
                      fontSize: 18,
                      paddingTop: 2,
                      color: "var(--wf-accent)",
                    }}
                  >
                    {parseInline(c.eyebrow)}
                  </div>
                )}
                <div style={{ position: "relative", flex: "0 0 20px" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 6,
                      top: 6,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "var(--wf-accent)",
                    }}
                  />
                  {i < list.length - 1 && (
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        top: 14,
                        bottom: -20,
                        width: 1,
                        background: "color-mix(in srgb, var(--wf-text) 25%, transparent)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 28 }}>
                  {!cron && eyebrowP(c.eyebrow)}
                  {itemTitleH(c.itemTitle)}
                  {bodyP(c.text)}
                  {c.linkUrl ? (
                    <a href={c.linkUrl} style={{ textDecoration: "none" }}>
                      {linkSpan(c.linkLabel)}
                    </a>
                  ) : (
                    linkSpan(c.linkLabel)
                  )}
                </div>
              </div>
            ))}
          </div>,
        );
      },
    },

    Countdown: {
      label: "Cuenta atrás",
      fields: {
        title: { type: "text", label: "Título" },
        targetDate: { type: "text", label: "Fecha objetivo (AAAA-MM-DD)" },
        ...colorFields,
      },
      defaultProps: {
        title: "Cuenta atrás",
        targetDate: "2026-09-12",
        ...colorDefaults,
      },
      render: ({ title, targetDate, colorText, colorBg }) => {
        const days = Math.max(
          0,
          Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000),
        );
        return (
          <div style={{ background: colorBg || "color-mix(in srgb, var(--wf-accent) 8%, transparent)" }}>
            <div style={{ ...section, color: colorText || undefined }}>
              <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
              <p style={{ fontSize: "calc(48px * var(--wf-scale, 1))", fontFamily: "var(--wf-heading)" }}>
                {days} días
              </p>
            </div>
          </div>
        );
      },
    },

    Gallery: {
      label: "Galería",
      fields: {
        images: {
          type: "array",
          label: "Fotos",
          getItemSummary: (_it, i) => `Foto ${(i ?? 0) + 1}`,
          arrayFields: {
            src: {
              type: "custom",
              render: ({ onChange, value }) => (
                <ImageUploadField value={value as string} onChange={onChange} label="Foto" />
              ),
            },
          },
          defaultItemProps: { src: "" },
        },
        columnas: {
          type: "select",
          label: "Fotos por fila",
          options: [
            { label: "Automático", value: "auto" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ],
        },
        ...colorFields,
      },
      defaultProps: { images: [{ src: "" }, { src: "" }], columnas: "auto", ...colorDefaults },
      render: ({ images, columnas, colorBg }) => {
        const list = images ?? [];
        const cols =
          columnas && columnas !== "auto"
            ? `repeat(${columnas}, 1fr)`
            : `repeat(auto-fit, minmax(220px, 1fr))`;
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: list.length === 1 ? "1fr" : cols,
              gap: 8,
              padding: 8,
              background: colorBg || undefined,
            }}
          >
            {list.map((it, i) =>
              it.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={it.src}
                  alt=""
                  style={{ width: "100%", height: 320, objectFit: "cover" }}
                />
              ) : (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    height: 320,
                    background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)",
                  }}
                />
              ),
            )}
          </div>
        );
      },
    },

    Schedule: {
      label: "Agenda del día",
      fields: {
        estilo: {
          type: "custom",
          label: "Estilo de la agenda",
          render: ({ onChange, value }) => (
            <StylePicker
              value={value as string}
              onChange={onChange}
              label="Estilo de la agenda"
              options={[
                { value: "lista", label: "Lista simple", icon: AGENDA_STYLE_ICONS.lista },
                { value: "linea", label: "Línea cronológica", icon: AGENDA_STYLE_ICONS.linea },
                { value: "foto", label: "Con foto al lado", icon: AGENDA_STYLE_ICONS.foto },
              ]}
            />
          ),
        },
        title: { type: "text", label: "Título" },
        image: {
          type: "custom",
          label: "Imagen (solo en «Con foto al lado»)",
          render: ({ onChange, value }) => (
            <ImageUploadField value={value as string} onChange={onChange} label="Imagen" />
          ),
        },
        items: {
          type: "array",
          label: "Momentos",
          getItemSummary: (it) => `${it.time} · ${it.label}`,
          arrayFields: {
            time: {
              type: "custom",
              label: "Hora",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Hora" singleLine />
              ),
            },
            label: {
              type: "custom",
              label: "Descripción",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Descripción" singleLine />
              ),
            },
            note: {
              type: "custom",
              label: "Detalle (opcional)",
              render: ({ onChange, value }) => (
                <RichEditor value={value as string} onChange={onChange} label="Detalle" singleLine />
              ),
            },
          },
          defaultItemProps: { time: "12:00", label: "Ceremonia", note: "" },
        },
        ...colorFields,
      },
      defaultProps: {
        title: "Agenda del día",
        estilo: "lista",
        image: "",
        ...colorDefaults,
        items: [
          { time: "12:30", label: "Ceremonia civil", note: "" },
          { time: "13:30", label: "Cóctel en los jardines", note: "" },
          { time: "15:30", label: "Banquete", note: "" },
          { time: "19:00", label: "Barra libre y fiesta", note: "" },
        ],
      },
      render: ({ title, estilo, image, items, colorText, colorBg }) => {
        const list = items ?? [];
        const st = estilo ?? "lista";

        const simpleList = (
          <div style={{ display: "grid", gap: 16, maxWidth: 440, margin: "0 auto" }}>
            {list.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  borderBottom: "1px solid color-mix(in srgb, var(--wf-text) 15%, transparent)",
                  paddingBottom: 8,
                  fontSize: "calc(18px * var(--wf-scale, 1))",
                }}
              >
                <span style={{ fontWeight: 600 }}>{parseInline(it.time)}</span>
                <span style={{ textAlign: "right" }}>
                  {parseInline(it.label)}
                  {it.note && (
                    <span style={{ display: "block", fontSize: 13, opacity: 0.7 }}>{parseInline(it.note)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

        const timeline = (
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            {list.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 18, textAlign: "left" }}>
                <div
                  style={{
                    flex: "0 0 62px",
                    textAlign: "right",
                    fontFamily: "var(--wf-heading)",
                    fontSize: 18,
                    color: "var(--wf-accent)",
                    paddingTop: 1,
                  }}
                >
                  {parseInline(it.time)}
                </div>
                <div style={{ position: "relative", flex: "0 0 18px" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 4,
                      top: 5,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "var(--wf-accent)",
                    }}
                  />
                  {i < list.length - 1 && (
                    <span
                      style={{
                        position: "absolute",
                        left: 8,
                        top: 13,
                        bottom: -18,
                        width: 1,
                        background: "color-mix(in srgb, var(--wf-text) 25%, transparent)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 22 }}>
                  <p style={{ fontWeight: 600, fontSize: "calc(17px * var(--wf-scale, 1))" }}>{parseInline(it.label)}</p>
                  {it.note && <p style={{ fontSize: 13, opacity: 0.7 }}>{parseInline(it.note)}</p>}
                </div>
              </div>
            ))}
          </div>
        );

        const inner = st === "linea" ? timeline : simpleList;

        if (st === "foto") {
          return (
            <div style={{ background: colorBg || undefined }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 40,
                alignItems: "center",
                maxWidth: 1000,
                margin: "0 auto",
                padding: "64px 24px",
                fontFamily: "var(--wf-body)",
                color: colorText || "var(--wf-text)",
              }}
            >
              <div style={{ flex: "1 1 260px", minWidth: 240 }}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 4 }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 380,
                      borderRadius: 4,
                      background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)",
                    }}
                  />
                )}
              </div>
              <div style={{ flex: "1 1 300px", minWidth: 260 }}>
                <h2 style={{ ...heading, textAlign: "left", color: colorText || heading.color }}>
                  {parseInline(title)}
                </h2>
                {timeline}
              </div>
            </div>
            </div>
          );
        }

        return (
          <div style={{ background: colorBg || undefined }}>
            <div style={{ ...section, color: colorText || section.color }}>
              <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
              {inner}
            </div>
          </div>
        );
      },
    },

    Location: {
      label: "Cómo llegar",
      fields: {
        title: { type: "text", label: "Título" },
        venue: { type: "text", label: "Lugar" },
        address: { type: "text", label: "Dirección" },
        mapsUrl: { type: "text", label: "Enlace de Google Maps" },
        ...colorFields,
      },
      defaultProps: {
        title: "Cómo llegar",
        venue: "Finca Los Olivos",
        address: "Ctra. de la Sierra km 4, Madrid",
        mapsUrl: "",
        ...colorDefaults,
      },
      render: ({ title, venue, address, mapsUrl, colorText, colorBg }) => (
        <div style={{ background: colorBg || undefined }}>
        <div style={{ ...section, color: colorText || section.color }}>
          <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
          <p style={{ ...body, fontWeight: 600 }}>{parseInline(venue)}</p>
          <p style={body}>{parseInline(address)}</p>
          {mapsUrl && (
            <p style={{ marginTop: 16 }}>
              <a href={mapsUrl} style={{ color: "var(--wf-accent)" }}>
                Ver en el mapa
              </a>
            </p>
          )}
        </div>
        </div>
      ),
    },

    CTA: {
      label: "Sección con botón",
      fields: {
        title: {
          type: "custom",
          label: "Título",
          render: ({ onChange, value }) => (
            <RichEditor value={value as string} onChange={onChange} label="Título" singleLine />
          ),
        },
        text: {
          type: "custom",
          label: "Texto",
          render: ({ onChange, value }) => (
            <RichEditor value={value as string} onChange={onChange} label="Texto" />
          ),
        },
        buttonLabel: { type: "text", label: "Texto del botón" },
        buttonUrl: { type: "text", label: "Enlace del botón (URL o #seccion)" },
        align: {
          type: "radio",
          label: "Alineación",
          options: [
            { label: "Izquierda", value: "left" },
            { label: "Centro", value: "center" },
          ],
        },
        ...colorFields,
      },
      defaultProps: {
        title: "Lista de regalos",
        text: "Si quieres tener un detalle con nosotros, aquí tienes nuestra lista.",
        buttonLabel: "Ver la lista",
        buttonUrl: "#regalos",
        align: "center",
        ...colorDefaults,
      },
      render: ({ title, text, buttonLabel, buttonUrl, align, colorText, colorBg }) => (
        <div style={{ background: colorBg || "color-mix(in srgb, var(--wf-accent) 8%, transparent)" }}>
          <div
            style={{
              ...section,
              color: colorText || section.color,
              textAlign: align === "left" ? "left" : "center",
            }}
          >
            <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
            <p style={body}>{parseInline(text)}</p>
            {buttonLabel && (
              <a
                href={buttonUrl || "#"}
                style={{
                  display: "inline-block",
                  marginTop: 24,
                  padding: "12px 28px",
                  background: "var(--wf-accent)",
                  color: "#fff",
                  textDecoration: "none",
                  letterSpacing: "0.1em",
                  fontFamily: "var(--wf-body)",
                }}
              >
                {buttonLabel}
              </a>
            )}
          </div>
        </div>
      ),
    },

    GiftList: {
      label: "Lista de regalos",
      fields: {
        textos: textBlocksField,
        mostrar: {
          type: "radio",
          label: "Qué mostrar",
          options: [
            { label: "Las tarjetas de regalos", value: "tarjetas" },
            { label: "Solo un botón que lleva a la lista", value: "boton" },
          ],
        },
        buttonLabel: { type: "text", label: "Texto del botón (vacío = sin botón)" },
        buttonUrl: {
          type: "text",
          label: "Enlace del botón (deja /lista/ana-y-leo para abrir vuestra lista real)",
        },
        ...colorFields,
      },
      defaultProps: {
        textos: [
          { variant: "h2", content: "Lista de regalos", format: {}, align: "center", colorText: "" },
          {
            variant: "h3",
            content: "Vuestra presencia es nuestro mejor regalo",
            format: {},
            align: "center",
            colorText: "",
          },
          {
            variant: "p",
            content:
              "…pero si además queréis tener un detalle, aquí van algunas ideas. Cualquier aportación, por pequeña que sea, nos hace mucha ilusión.",
            format: {},
            align: "center",
            colorText: "",
          },
        ],
        mostrar: "tarjetas",
        buttonLabel: "Ver la lista de regalos",
        buttonUrl: "/lista/ana-y-leo",
        ...colorDefaults,
      },
      render: ({ textos, mostrar, titulo, subtitulo, texto, buttonLabel, buttonUrl, colorText, colorBg }) => {
        const blocks = textos && textos.length ? textos : legadoATextos({ titulo, subtitulo, texto });
        return (
        <div style={{ background: colorBg || undefined }}>
          <div style={{ ...section, color: colorText || section.color }}>
            <TextBlocks texts={blocks} />

            {(mostrar ?? "tarjetas") === "tarjetas" && <SiteGiftCards />}

            {buttonLabel && (
              <a
                href={buttonUrl || "/lista/ana-y-leo"}
                target={(buttonUrl || "/lista/ana-y-leo").startsWith("#") ? undefined : "_blank"}
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 28,
                  padding: "12px 28px",
                  background: "var(--wf-accent)",
                  color: "#fff",
                  textDecoration: "none",
                  letterSpacing: "0.1em",
                  fontFamily: "var(--wf-body)",
                }}
              >
                {buttonLabel}
              </a>
            )}
          </div>
        </div>
        );
      },
    },

    FAQ: {
      label: "Preguntas frecuentes",
      fields: {
        title: { type: "text", label: "Título" },
        items: {
          type: "array",
          label: "Preguntas",
          arrayFields: {
            q: { type: "text", label: "Pregunta" },
            a: { type: "textarea", label: "Respuesta" },
          },
          defaultItemProps: { q: "¿Hay aparcamiento?", a: "Sí, gratuito en la finca." },
        },
        ...colorFields,
      },
      defaultProps: {
        title: "Preguntas frecuentes",
        ...colorDefaults,
        items: [{ q: "¿Hay aparcamiento?", a: "Sí, gratuito en la finca." }],
      },
      render: ({ title, items, colorText, colorBg }) => (
        <div style={{ background: colorBg || undefined }}>
        <div style={{ ...section, color: colorText || section.color }}>
          <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
          <div style={{ display: "grid", gap: 20, textAlign: "left", maxWidth: 560, margin: "0 auto" }}>
            {items.map((it, i) => (
              <div key={i}>
                <p style={{ fontSize: "calc(19px * var(--wf-scale, 1))", fontWeight: 600 }}>{parseInline(it.q)}</p>
                <p style={body}>{parseInline(it.a)}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      ),
    },

    RSVP: {
      label: "Confirmación (RSVP)",
      fields: {
        title: { type: "text", label: "Título" },
        text: {
          type: "custom",
          label: "Texto",
          render: ({ onChange, value }) => (
            <RichEditor value={value as string} onChange={onChange} label="Texto" />
          ),
        },
        buttonLabel: { type: "text", label: "Texto del botón (si no hay formulario)" },
        buttonUrl: { type: "text", label: "Enlace del botón" },
        packEstandar: {
          type: "radio",
          label: "Pack de preguntas estándar (nombre, apellidos, asistencia, acompañante)",
          options: [
            { label: "Añadido", value: "si" },
            { label: "Sin pack", value: "no" },
          ],
        },
        questions: {
          type: "custom",
          label: "Preguntas",
          render: ({ onChange, value }) => (
            <QuestionsEditor value={value as never} onChange={onChange} />
          ),
        },
        ...colorFields,
      },
      defaultProps: {
        title: "¿Nos acompañas?",
        text: "Confírmanos tu asistencia antes del 1 de agosto.",
        buttonLabel: "Confirmar asistencia",
        buttonUrl: "",
        packEstandar: "si",
        ...colorDefaults,
        questions: [
          { label: "Menú", qtype: "opcion", options: "Normal, Vegetariano, Sin gluten, Infantil", condLabel: "", condValue: "" },
          { label: "Alergias / intolerancias", qtype: "texto", options: "", condLabel: "", condValue: "" },
          { label: "¿Necesitas autobús?", qtype: "si-no", options: "", condLabel: "", condValue: "" },
          { label: "¿En qué parada?", qtype: "opcion", options: "Centro, Estación, Hotel", condLabel: "¿Necesitas autobús?", condValue: "Sí" },
        ],
      },
      render: ({ title, text, buttonLabel, buttonUrl, colorText, colorBg, questions, packEstandar }) => (
        <div style={{ background: colorBg || "color-mix(in srgb, var(--wf-accent) 8%, transparent)" }}>
        <div style={{ ...section, color: colorText || section.color }}>
          <h2 style={{ ...heading, color: colorText || heading.color }}>{parseInline(title)}</h2>
          <p style={body}>{parseInline(text)}</p>
          {(packEstandar !== "no") || (questions && questions.length > 0) ? (
            <RsvpForm questions={questions} buttonLabel={buttonLabel} pack={packEstandar !== "no"} />
          ) : (
            <a
              href={buttonUrl || "#"}
              style={{
                display: "inline-block",
                marginTop: 24,
                padding: "12px 28px",
                background: "var(--wf-accent)",
                color: "#fff",
                textDecoration: "none",
                letterSpacing: "0.1em",
                fontFamily: "var(--wf-body)",
              }}
            >
              {buttonLabel}
            </a>
          )}
        </div>
        </div>
      ),
    },
  },
};

export const emptyData = {
  root: {
    props: {
      fontHeading: "Cormorant Garamond",
      fontBody: "Work Sans",
      size: "Normal",
      colorText: "#3d3a34",
      colorBackground: "#ffffff",
      colorAccent: "#8a6d3b",
    },
  },
  content: [],
};

// Plantilla de arranque para el prototipo.
export const plantillaEditorial = {
  root: {
    props: {
      fontHeading: "Cormorant Garamond",
      fontBody: "Work Sans",
      size: "Normal",
      colorText: "#3d3a34",
      colorBackground: "#fbf9f6",
      colorAccent: "#8a6d3b",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "hero-1",
        coupleNames: "Ana & Leo",
        date: "12 de septiembre de 2026",
        subtitle: "¡Nos casamos!",
        image: "",
        align: "center",
        textColor: "",
      },
    },
    {
      type: "RichText",
      props: {
        id: "story",
        colorBg: "",
        image: "",
        imageMode: "none",
        imageSize: "m",
        imageOffset: { x: 0, y: 0 },
        texts: [
          { variant: "h2", content: "Nuestra historia", format: {}, align: "center", colorText: "" },
          {
            variant: "p",
            content:
              "Nos conocimos una tarde de octubre en la biblioteca. Diez años después, seguimos eligiendo la misma mesa.",
            format: {},
            align: "center",
            colorText: "",
          },
        ],
      },
    },
    {
      type: "List",
      props: {
        id: "list-1",
        estilo: "tarjetas",
        title: "El fin de semana",
        columns: "3",
        items: [
          {
            image: "",
            eyebrow: "VIERNES",
            itemTitle: "Cena de bienvenida",
            text: "Para quienes lleguéis la víspera, cena informal en el pueblo.",
            linkLabel: "Ver sitio",
            linkUrl: "https://maps.google.com",
          },
          {
            image: "",
            eyebrow: "SÁBADO",
            itemTitle: "La boda",
            text: "Ceremonia y celebración en la Finca Los Olivos.",
            linkLabel: "Cómo llegar",
            linkUrl: "https://maps.google.com",
          },
          {
            image: "",
            eyebrow: "DOMINGO",
            itemTitle: "Brunch de despedida",
            text: "Nos despedimos con un brunch tranquilo antes de la vuelta.",
            linkLabel: "",
            linkUrl: "",
          },
        ],
      },
    },
    { type: "Countdown", props: { id: "cd-1", title: "Cuenta atrás", targetDate: "2026-09-12" } },
    {
      type: "Schedule",
      props: {
        id: "sch-1",
        title: "Agenda del día",
        items: [
          { time: "12:30", label: "Ceremonia civil" },
          { time: "13:30", label: "Cóctel en los jardines" },
          { time: "15:30", label: "Banquete" },
          { time: "19:00", label: "Barra libre y fiesta" },
        ],
      },
    },
    {
      type: "Location",
      props: {
        id: "loc-1",
        title: "Cómo llegar",
        venue: "Finca Los Olivos",
        address: "Ctra. de la Sierra km 4, Madrid",
        mapsUrl: "https://maps.google.com",
      },
    },
    {
      type: "RSVP",
      props: {
        id: "rsvp-1",
        title: "¿Nos acompañas?",
        text: "Confírmanos tu asistencia antes del 1 de agosto de 2026.",
        buttonLabel: "Confirmar asistencia",
        buttonUrl: "",
        questions: [
          { label: "Menú", qtype: "opcion", options: "Normal, Vegetariano, Sin gluten, Infantil" },
          { label: "Alergias / intolerancias", qtype: "texto", options: "" },
          { label: "¿Necesitas autobús?", qtype: "si-no", options: "" },
        ],
      },
    },
  ],
};

// --- Plantilla "Jardín": botánica, tonos verdes ---
export const plantillaJardin = {
  root: {
    props: {
      fontHeading: "EB Garamond",
      fontBody: "Work Sans",
      size: "Normal",
      colorText: "#33372f",
      colorBackground: "#f6f7f1",
      colorAccent: "#4b6b43",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "j-hero",
        subtitle: "Nos casamos",
        coupleNames: "Marta & Julen",
        date: "6 de junio de 2026",
        image: "",
        align: "left",
        textColor: "",
        colorBg: "",
        imageMode: "right",
        imageSize: "full",
        imageOffset: { x: 0, y: 0 },
      },
    },
    {
      type: "MediaText",
      props: {
        id: "j-mt",
        title: "Nuestra historia",
        text: "Empezamos plantando un huerto juntos. Cinco años después seguimos cuidándolo, y ahora también esto.",
        image: "",
        imagePosition: "left",
        buttonLabel: "",
        buttonUrl: "",
        colorText: "",
        colorBg: "",
      },
    },
    {
      type: "List",
      props: {
        id: "j-list",
        estilo: "lista-fotos",
        title: "El día",
        colorText: "",
        colorBg: "",
        items: [
          { image: "", imgSide: "left", eyebrow: "12:00", itemTitle: "Ceremonia en el jardín", text: "Bajo los olivos centenarios.", linkLabel: "", linkUrl: "" },
          { image: "", imgSide: "right", eyebrow: "14:00", itemTitle: "Comida al aire libre", text: "Mesa larga entre los árboles.", linkLabel: "", linkUrl: "" },
          { image: "", imgSide: "left", eyebrow: "18:00", itemTitle: "Fiesta", text: "Hasta que el cuerpo aguante.", linkLabel: "", linkUrl: "" },
        ],
      },
    },
    {
      type: "Schedule",
      props: {
        id: "j-sch",
        title: "Agenda",
        estilo: "linea",
        image: "",
        colorText: "",
        colorBg: "",
        items: [
          { time: "12:00", label: "Ceremonia", note: "" },
          { time: "13:00", label: "Aperitivo", note: "" },
          { time: "14:30", label: "Banquete", note: "" },
          { time: "18:00", label: "Baile", note: "" },
        ],
      },
    },
    { type: "Gallery", props: { id: "j-gal", images: [{ src: "" }, { src: "" }, { src: "" }], columnas: "auto", colorText: "", colorBg: "" } },
    {
      type: "Location",
      props: { id: "j-loc", title: "Cómo llegar", venue: "Jardines de la Vega", address: "Camino del Río s/n, Aranjuez", mapsUrl: "https://maps.google.com", colorText: "", colorBg: "" },
    },
    {
      type: "RSVP",
      props: { id: "j-rsvp", title: "¿Vienes?", text: "Confírmanos antes del 1 de mayo.", buttonLabel: "Confirmar", buttonUrl: "", colorText: "", colorBg: "", questions: [{ label: "Menú", qtype: "opcion", options: "Normal, Vegetariano, Vegano" }, { label: "Alergias", qtype: "texto", options: "" }] },
    },
  ],
};

// --- Plantilla "Moderna": sans-serif, alto contraste ---
export const plantillaModerna = {
  root: {
    props: {
      fontHeading: "Montserrat",
      fontBody: "Work Sans",
      size: "Normal",
      colorText: "#1c1a17",
      colorBackground: "#ffffff",
      colorAccent: "#1c1a17",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "m-hero",
        subtitle: "12.09.2026",
        coupleNames: "ANA + LEO",
        date: "Madrid",
        image: "",
        align: "left",
        textColor: "",
        colorBg: "#111111",
        imageMode: "none",
        imageSize: "full",
        imageOffset: { x: 0, y: 0 },
      },
    },
    {
      type: "RichText",
      props: {
        id: "m-story",
        colorBg: "",
        image: "",
        imageMode: "none",
        imageSize: "m",
        imageOffset: { x: 0, y: 0 },
        texts: [
          { variant: "h1", content: "La historia", format: {}, align: "left", colorText: "" },
          {
            variant: "p",
            content:
              "Diez años, dos ciudades y un montón de billetes de tren. Ahora, por fin, la misma dirección.",
            format: {},
            align: "left",
            colorText: "",
          },
        ],
      },
    },
    {
      type: "List",
      props: {
        id: "m-list",
        estilo: "cronologia",
        title: "El plan",
        colorText: "",
        colorBg: "",
        items: [
          { image: "", imgSide: "left", eyebrow: "12:30", itemTitle: "Ceremonia", text: "Puntualidad, por favor.", linkLabel: "", linkUrl: "" },
          { image: "", imgSide: "left", eyebrow: "14:00", itemTitle: "Cóctel", text: "", linkLabel: "", linkUrl: "" },
          { image: "", imgSide: "left", eyebrow: "16:00", itemTitle: "Comida", text: "", linkLabel: "", linkUrl: "" },
          { image: "", imgSide: "left", eyebrow: "19:00", itemTitle: "Fiesta", text: "", linkLabel: "", linkUrl: "" },
        ],
      },
    },
    { type: "Countdown", props: { id: "m-cd", title: "Faltan", targetDate: "2026-09-12", colorText: "", colorBg: "#111111" } },
    {
      type: "Location",
      props: { id: "m-loc", title: "Dónde", venue: "Espacio Nómada", address: "Calle de la Industria 12, Madrid", mapsUrl: "https://maps.google.com", colorText: "", colorBg: "" },
    },
    {
      type: "RSVP",
      props: { id: "m-rsvp", title: "Confirma", text: "Antes del 1 de agosto.", buttonLabel: "Voy", buttonUrl: "", colorText: "", colorBg: "", questions: [{ label: "Menú", qtype: "opcion", options: "Normal, Vegetariano" }, { label: "¿Autobús?", qtype: "si-no", options: "" }] },
    },
  ],
};

export const TEMPLATES: Record<string, { nombre: string; desc: string; data: unknown }> = {
  editorial: { nombre: "Editorial", desc: "Serif, mucho blanco, minimalista.", data: plantillaEditorial },
  jardin: { nombre: "Jardín", desc: "Botánica, tonos verdes, foto grande.", data: plantillaJardin },
  moderna: { nombre: "Moderna", desc: "Sans-serif, alto contraste, directa.", data: plantillaModerna },
  cero: { nombre: "Desde cero", desc: "Empieza con una página en blanco.", data: emptyData },
};
