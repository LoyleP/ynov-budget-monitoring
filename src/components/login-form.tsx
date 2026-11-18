"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fr } from "@/messages/fr";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    (_: LoginState, form: FormData) => login(_, form),
    { email: "" } as LoginState,
  );

  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <form action={action} id="login-form" className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold">{fr.login.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{fr.login.intro}</p>
          </div>
          <Input id="login-email" name="email" type="email" autoComplete="email" placeholder={fr.login.emailPlaceholder} aria-label={fr.login.email} defaultValue={state.email} autoFocus required />
          <Input id="login-code" name="code" type="password" autoComplete="current-password" placeholder={fr.login.code} aria-label={fr.login.code} required />
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <Button id="login-submit" type="submit" disabled={pending} className="w-full">
            {fr.login.verify}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
