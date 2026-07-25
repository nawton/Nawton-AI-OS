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
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-semibold text-white">
            N
          </div>
          <h1 className="text-lg font-semibold text-text-primary">Nawton AI OS</h1>
          <p className="text-sm text-text-muted">Logga in för att fortsätta</p>
        </div>

        <form action={authenticate} className="flex flex-col gap-3 rounded-(--radius-lg) border border-border-hairline bg-surface-1 p-6">
          <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? "/"} />

          {params.error ? (
            <div className="rounded-(--radius-md) bg-[color-mix(in_oklab,var(--status-critical)_16%,transparent)] px-3 py-2 text-xs text-[#f08a8a]">
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
              className="h-9 rounded-(--radius-md) border border-border-strong bg-surface-2 px-3 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary">Lösenord</span>
            <input
              name="password"
              type="password"
              required
              defaultValue="nawton1234"
              className="h-9 rounded-(--radius-md) border border-border-strong bg-surface-2 px-3 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>

          <button
            type="submit"
            className="mt-2 h-9 rounded-(--radius-md) bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Logga in
          </button>

          <p className="mt-1 text-center text-xs text-text-muted">
            Demo-konto ifyllt automatiskt — kör <code>npm run db:seed</code> först.
          </p>
        </form>
      </div>
    </div>
  );
}
