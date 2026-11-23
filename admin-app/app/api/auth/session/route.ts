import { getAdminSession } from "../../../../lib/session.ts";
import { sessionResponse } from "../session-response.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  return sessionResponse(await getAdminSession());
}
