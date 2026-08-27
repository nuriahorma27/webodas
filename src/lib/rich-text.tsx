import React from "react";

/**
 * Los textos se guardan como HTML sencillo (negrita, cursiva, subrayado,
 * tachado y color). `parseInline` los pinta. Si el texto es antiguo y usa
 * marcadores (**, //, {{color|...}}) también se entiende.
 */

const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "SPAN", "BR", "DIV", "P"]);

function sanitize(html: string): string {
  if (typeof document === "undefined") return stripTags(html);
  const tmpl = document.createElement("div");
  tmpl.innerHTML = html;
  const walk = (node: Element) => {
    [...node.children].forEach((child) => {
      if (!ALLOWED.has(child.tagName)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }
      // Solo se conserva color / font-weight / font-style / text-decoration
      const style = (child as HTMLElement).style;
      const keep: string[] = [];
      if (style.color) keep.push(`color:${style.color}`);
      if (style.fontWeight) keep.push(`font-weight:${style.fontWeight}`);
      if (style.fontStyle) keep.push(`font-style:${style.fontStyle}`);
      if (style.textDecoration || style.textDecorationLine)
        keep.push(`text-decoration:${style.textDecoration || style.textDecorationLine}`);
      child.removeAttribute("class");
      child.removeAttribute("style");
      if (keep.length) child.setAttribute("style", keep.join(";"));
      [...child.attributes].forEach((a) => {
        if (a.name !== "style") child.removeAttribute(a.name);
      });
      walk(child);
    });
  };
  walk(tmpl);
  return tmpl.innerHTML;
}

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "");
}

/* ---- compatibilidad con el formato antiguo de marcadores ---- */

type Rule = { re: RegExp; wrap: (inner: React.ReactNode, m: RegExpExecArray, key: string) => React.ReactNode };
const RULES: Rule[] = [
  {
    re: /\{\{\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s*\|([\s\S]+?)\}\}/,
    wrap: (inner, m, key) => (
      <span key={key} style={{ color: m[1] }}>
        {inner}
      </span>
    ),
  },
  { re: /\*\*([\s\S]+?)\*\*/, wrap: (inner, _m, key) => <strong key={key}>{inner}</strong> },
  { re: /\/\/([\s\S]+?)\/\//, wrap: (inner, _m, key) => <em key={key}>{inner}</em> },
  {
    re: /__([\s\S]+?)__/,
    wrap: (inner, _m, key) => (
      <span key={key} style={{ textDecoration: "underline" }}>
        {inner}
      </span>
    ),
  },
  {
    re: /~~([\s\S]+?)~~/,
    wrap: (inner, _m, key) => (
      <span key={key} style={{ textDecoration: "line-through" }}>
        {inner}
      </span>
    ),
  },
];

function parseMarkers(text: string, keyBase: string): React.ReactNode[] {
  for (let i = 0; i < RULES.length; i++) {
    const { re, wrap } = RULES[i];
    const m = re.exec(text);
    if (!m || m.index === undefined) continue;
    const before = text.slice(0, m.index);
    const after = text.slice(m.index + m[0].length);
    const innerRaw = m[m.length - 1];
    return [
      ...parseMarkers(before, keyBase + "b"),
      wrap(parseMarkers(innerRaw, keyBase + "i"), m, keyBase + "w" + i),
      ...parseMarkers(after, keyBase + "a"),
    ];
  }
  return text ? [text] : [];
}

export function parseInline(text?: string | null): React.ReactNode {
  if (!text) return text ?? "";
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <span dangerouslySetInnerHTML={{ __html: sanitize(text) }} />;
  }
  if (/\*\*|\/\/|__|~~|\{\{/.test(text)) {
    return <>{parseMarkers(text, "r")}</>;
  }
  return text;
}
