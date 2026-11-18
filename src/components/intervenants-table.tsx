"use client";

import { useMemo, useState } from "react";
import { CircleAlert, Search } from "lucide-react";
import { updateIntervenant } from "@/app/actions";
import { EditableNumber } from "@/components/editable-number";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Intervenant } from "@/lib/queries";
import { fr } from "@/messages/fr";

const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function IntervenantsTable({ items, editable, id }: { items: Intervenant[]; editable: boolean; id: string }) {
  const [q, setQ] = useState("");
  const dupes = useMemo(() => {
    const c = new Map<string, number>();
    items.forEach((i) => c.set(norm(i.name), (c.get(norm(i.name)) ?? 0) + 1));
    return c;
  }, [items]);
  const shown = items.filter((i) => norm(i.name).includes(norm(q)));

  return (
    <div>
      <div className="sticky top-12 z-20 -mx-4 bg-background px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"><div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
        <Input id={`${id}-search`} aria-label={fr.common.search} placeholder={fr.common.search} value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
      </div></div>
      <div className="[--table-head-top:6rem]">
        <Table id={`${id}-table`}>
          <TableHeader>
            <TableRow>
              <TableHead>{fr.intervenants.name}</TableHead>
              <TableHead className="text-right">{fr.intervenants.rate}</TableHead>
              {editable && <TableHead className="text-right">{fr.intervenants.hours}</TableHead>}
              {editable && <TableHead className="text-right">{fr.intervenants.cost}</TableHead>}
              {editable && <TableHead className="text-right" title={fr.intervenants.altRateHint}>{fr.intervenants.altRate}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((i) => (
              <TableRow key={i.id} id={`${id}-row-${i.id}`}>
                <TableCell className="font-medium">
                  {i.name}
                  {(dupes.get(norm(i.name)) ?? 0) > 1 && <Badge variant="outline" className="ml-2"><CircleAlert />{fr.intervenants.duplicate}</Badge>}
                </TableCell>
                <TableCell className={editable ? "text-right" : "text-right"}>
                  {editable ? (
                    <div className="flex items-center justify-end gap-2">
                      {i.rate === null && <span className="text-xs text-muted-foreground">{i.rateNote ? fr.intervenants.quote : fr.intervenants.noRate}</span>}
                      <EditableNumber id={`${id}-${i.id}-rate`} label={`${fr.intervenants.rate} ${i.name}`} value={i.rate} save={(v) => updateIntervenant(i.id, "rate", v)} className="w-20" />
                    </div>
                  ) : (
                    <span className="tabular-nums">{i.rate === null ? "–" : eur.format(i.rate)}</span>
                  )}
                </TableCell>
                {editable && (
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <EditableNumber id={`${id}-${i.id}-hours`} label={`${fr.intervenants.hours} ${i.name}`} value={i.hours} save={(v) => updateIntervenant(i.id, "hours", v)} className="w-20" />
                    </div>
                  </TableCell>
                )}
                {editable && <TableCell className="text-right tabular-nums">{i.rate !== null && i.hours ? eur.format(i.rate * i.hours) : "–"}</TableCell>}
                {editable && <TableCell className="text-right tabular-nums text-muted-foreground">{i.altRate === null ? "" : eur.format(i.altRate)}</TableCell>}
              </TableRow>
            ))}
            {shown.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">{fr.intervenants.noResult}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
