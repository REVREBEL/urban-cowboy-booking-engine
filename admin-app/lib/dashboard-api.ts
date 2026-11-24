/**
 * Adapter that lets the existing React dashboard panels run inside the admin
 * app. Browser calls stay on the admin origin; the server-side API proxy adds
 * the verified Access assertion when it calls the shared booking Worker.
 */
import { createDashboardApi, type DashboardApi } from "../../src/dashboard/api.ts";

export function createAdminDashboardApi(): DashboardApi {
  return createDashboardApi();
}
