"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addIntervenant } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fr } from "@/messages/fr";

const num = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").trim().replace(",", ".");
  const n = Number(t);
  return t === "" || !Number.isFinite(n) ? null : n;
};

export function AddIntervenantDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return setError(fr.intervenants.add.error);
    start(async () => {
      await addIntervenant(name, num(form.get("rate")), num(form.get("hours")));
      toast.success(fr.intervenants.add.added);
      setError("");
      setOpen(false);
    });
  }

  const t = fr.intervenants.add;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="intervenants-add-open" size="sm"><Plus />{t.button}</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={submit} id="intervenants-add-form" className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>{t.name}</span>
              <Input id="intervenants-add-name" name="name" placeholder={t.namePlaceholder} autoFocus aria-invalid={!!error} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1 text-sm">
                <span>{t.rate}</span>
                <Input id="intervenants-add-rate" name="rate" inputMode="decimal" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>{t.hours}</span>
                <Input id="intervenants-add-hours" name="hours" inputMode="decimal" />
              </label>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button id="intervenants-add-cancel" type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
            <Button id="intervenants-add-submit" type="submit" disabled={pending}>{t.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
