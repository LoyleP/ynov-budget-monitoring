"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

type Props = {
  id: string;
  value: number | null;
  label: string;
  save: (value: number | null) => Promise<unknown>;
  placeholder?: string;
  className?: string;
};

const parse = (s: string) => {
  const t = s.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : undefined;
};

/** Inline numeric cell: saves on blur / Enter, with an undo toast. */
export function EditableNumber({ id, value, label, save, placeholder = "–", className }: Props) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const [synced, setSynced] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const cancelled = useRef(false);
  const [, start] = useTransition();

  if (synced !== value) {
    setSynced(value);
    setText(value === null ? "" : String(value));
  }

  function commit() {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const next = parse(text);
    if (next === undefined) return setInvalid(true);
    setInvalid(false);
    if (next === value) return;
    const previous = value;
    start(async () => {
      await save(next);
      toast.success(fr.common.saved, {
        action: {
          label: fr.common.undo,
          onClick: () => start(async () => void (await save(previous))),
        },
      });
    });
  }

  return (
    <Input
      id={id}
      inputMode="decimal"
      aria-label={label}
      aria-invalid={invalid}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          setText(value === null ? "" : String(value));
          setInvalid(false);
          e.currentTarget.blur();
        }
      }}
      className={cn("h-7 w-24 text-right tabular-nums", className)}
    />
  );
}
