import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function authenticate(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-1 p-10 lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white"
            style={{ background: "linear-gradient(145deg, var(--accent-strong), var(--accent) 60%, #2a5fa8)" }}
          >
            N
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">Nawton AI OS</span>
        </div>

        <div className="relative flex max-w-md flex-col gap-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-primary text-balance">
            Företagets digitala hjärna.
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            En AI-agent som förstår er verksamhet, ger rekommendationer och utför arbete genom era system — inte bara en chatbot.
          </p>

          <div className="rounded-(--radius-lg) border border-border-hairline bg-surface-0/60 p-5 font-mono text-xs leading-relaxed text-text-secondary shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
            <p className="text-text-primary">God morgon Nawid.</p>
            <p className="mt-2">Idag:</p>
            <p>· 2 kunder väntar på offert</p>
            <p>· Ett projekt är försenat</p>
            <p>· Omsättning denna vecka: 34 200 kr</p>
          </div>
        </div>

        <p className="relative text-xs text-text-muted">MVP v1 · Dashboard · AI Chat · CRM · Projekt</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface-0 px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1.5 lg:items-start items-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-base font-semibold text-white lg:hidden">
              N
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Välkommen tillbaka</h2>
            <p className="text-sm text-text-muted">Logga in för att fortsätta</p>
          </div>

          <form action={authenticate} className="flex flex-col gap-3.5 rounded-(--radius-lg) border border-border-hairline bg-surface-1 p-6">
            <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? "/"} />

            {params.error ? (
              <div className="rounded-(--radius-md) bg-status-critical/16 px-3 py-2 text-xs text-status-critical">
                Fel e-post eller lösenord.
              </div>
            ) : null}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">E-post</span>
              <input
                name="email"
                type="email"
                required
                defaultValue="nawid@nawton.se"
                className="h-9 rounded-(--radius-md) border border-border-strong bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">Lösenord</span>
              <input
                name="password"
                type="password"
                required
                defaultValue="nawton1234"
                className="h-9 rounded-(--radius-md) border border-border-strong bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-9 rounded-(--radius-md) bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Logga in
            </button>

            <p className="mt-1 text-center text-xs text-text-muted">
              Demo-konto ifyllt automatiskt — kör <code className="text-text-secondary">npm run db:seed</code> först.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
