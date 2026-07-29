import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { searchAll } from "@/server/search";
import { checkRateLimit } from "@/server/rate-limit";

const SEARCH_LIMIT = 60;
const SEARCH_WINDOW_MS = 60 * 1000; // 1 minute — generous since this fires per keystroke

const querySchema = z.string().trim().max(200);

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(`search:${session.user.id}`, SEARCH_LIMIT, SEARCH_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "För många sökningar, vänta en stund." }, { status: 429 });
  }

  const rawQuery = new URL(req.url).searchParams.get("q") ?? "";
  const parsed = querySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ogiltig sökfråga" }, { status: 400 });
  }

  const results = await searchAll(session.user.companyId, parsed.data);
  return NextResponse.json({ results });
}
