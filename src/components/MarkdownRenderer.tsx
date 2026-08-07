import React from "react";

interface MarkdownRendererProps {
  content: string;
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-bold italic text-deep-earth">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<strong key={key++} className="font-semibold text-deep-earth">{match[3]}</strong>);
    } else if (match[4] || match[5]) {
      parts.push(<em key={key++} className="italic text-muted-brown">{match[4] || match[5]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      let textColor = "text-accent-amber-deep";
      let borderColor = "border-accent-amber";
      let dotColor = "bg-accent-amber";

      if (text.toLowerCase().includes("strength")) {
        textColor = "text-accent-sage";
        borderColor = "border-accent-sage";
        dotColor = "bg-accent-sage";
      } else if (text.toLowerCase().includes("opportunit") || text.toLowerCase().includes("growth")) {
        textColor = "text-accent-sky";
        borderColor = "border-accent-sky";
        dotColor = "bg-accent-sky";
      } else if (text.toLowerCase().includes("greeting") || text.toLowerCase().includes("welcome")) {
        textColor = "text-accent-amber-deep";
        borderColor = "border-accent-amber";
        dotColor = "bg-accent-amber";
      } else if (text.toLowerCase().includes("final") || text.toLowerCase().includes("teacher")) {
        textColor = "text-accent-rose";
        borderColor = "border-accent-rose";
        dotColor = "bg-accent-rose";
      }

      elements.push(
        <div key={key++} className={`flex items-center gap-3 mt-7 mb-3 pb-2 border-b-2 ${borderColor}`}>
          <div className={`w-3 h-3 rounded-full ${dotColor} flex-shrink-0 shadow-sm`} />
          <h2 className={`text-base font-bold tracking-wide uppercase ${textColor}`}>{text}</h2>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-2xl font-display font-bold text-deep-earth mb-4">
          {parseInline(line.slice(2).trim())}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-muted-brown mt-4 mb-1">
          {parseInline(line.slice(4).trim())}
        </h3>
      );
      i++;
      continue;
    }

    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="border-sand my-5" />);
      i++;
      continue;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        const itemText = lines[i].trim().slice(2);
        listItems.push(
          <li key={key++} className="flex gap-2.5 text-deep-earth/90 leading-relaxed">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-accent-amber to-accent-coral flex-shrink-0" />
            <span>{parseInline(itemText)}</span>
          </li>
        );
        i++;
      }
      elements.push(<ul key={key++} className="space-y-2.5 my-3 pl-1">{listItems}</ul>);
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(
      <p key={key++} className="text-deep-earth/90 leading-relaxed mb-3">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}
