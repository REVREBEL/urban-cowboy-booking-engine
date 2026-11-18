// COW-37 shell, route protection and shared-control contract.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const shell = read("src/dashboard/DashboardShell.tsx");
const app = read("src/dashboard/DashboardApp.tsx");
const panel = read("src/dashboard/D1ContentPanel.tsx");
const states = read("src/dashboard/states.tsx");
const dashboard = read("src/dashboard/Dashboard.tsx");
const boundary = read("src/dashboard/PanelErrorBoundary.tsx");
const resource = read("src/dashboard/useDashboardResource.ts");
const apiSource = read("src/dashboard/api.ts");
const navigationSource = read("src/dashboard/navigation.ts");

test("shell exposes a skip link, labelled nav and current-page state", () => {
  assert.match(shell, /href="#dashboard-main"/);
  assert.match(shell, /Skip to dashboard content/);
  assert.match(shell, /<nav aria-label="Dashboard sections"/);
  assert.match(shell, /<main id="dashboard-main"[^>]*tabIndex={-1}/);
  assert.match(shell, /aria-current={item.id === route \? "page" : undefined}/);
  assert.match(shell, /focus-visible:outline-2/);
});

test("shell uses the shared Button and introduces no local button theme", () => {
  assert.match(shell, /import \{ Button \} from "@\/components\/ui\/Button"/);
  assert.match(shell, /variant="outline" colorScheme="light" size="small" textCase="title"/);
  assert.doesNotMatch(shell, /btn-primary|btn-ghost|btn-secondary/);
  assert.doesNotMatch(shell, /<button\b/);
  assert.doesNotMatch(shell, /style=\{\{/);
});

test("route protection happens before the shell or any panel renders", () => {
  assert.match(app, /if \(!session\) return <Login \/>/);
  assert.ok(app.indexOf("if (!session)") < app.indexOf("<DashboardShell"), "session gate precedes shell");
  assert.match(app, /routeFromHash\(window\.location\.hash\)/);
  assert.match(app, /hashchange/);
  assert.match(app, /createDashboardApi\(\)/);
  assert.doesNotMatch(app, /fetch\(/);
});

test("panels use the centralized client and shared loading/error states", () => {
  assert.match(panel, /api\.getD1Module/);
  assert.match(panel, /LoadingPanel/);
  assert.match(panel, /ErrorPanel/);
  assert.match(panel, /EmptyPanel/);
  assert.doesNotMatch(panel, /fetch\(/);
  assert.match(states, /import \{ Button \} from "@\/components\/ui\/Button"/);
  assert.match(states, /role="alert"/);
  assert.match(states, /role="status"/);
});

test("the funnel panel uses shared controls for range and refresh actions", () => {
  assert.match(dashboard, /import \{ PillButton \} from "@\/components\/ui\/Pill"/);
  assert.match(dashboard, /<PillButton/);
  assert.match(dashboard, /aria-pressed|pressed=\{range === r\.key\}/);
  assert.match(dashboard, /<Button variant="outline" colorScheme="light" size="small" textCase="title" onClick=\{load\}/);
  assert.doesNotMatch(dashboard.slice(dashboard.indexOf("export function FunnelPanel")), /btn-ghost/);
});

test("panel errors use the shared ErrorPanel behind a route-aware boundary", () => {
  assert.match(dashboard, /import \{ ErrorPanel \} from "\.\/states"/);
  assert.match(dashboard, /<ErrorPanel message=\{error\} onRetry=\{load\} \/>/);
  assert.doesNotMatch(dashboard, /Vérifie côté Supabase/);
  assert.match(boundary, /extends Component<Props, State>/);
  assert.match(boundary, /static getDerivedStateFromError/);
  assert.match(boundary, /<ErrorPanel message=\{this\.state\.error\.message\} onRetry=\{this\.reset\} \/>/);
  assert.match(app, /<PanelErrorBoundary resetKey=\{route\}>/);
});

test("Worker API calls rely on Access cookies, not a Supabase token", () => {
  assert.match(apiSource, /credentials: "same-origin"/);
  assert.doesNotMatch(apiSource, /headers\.set\("authorization"/);
  assert.match(app, /Cloudflare Access at the edge/);
  assert.match(resource, /requestId = useRef\(0\)/);
  assert.match(resource, /id === requestId\.current/);
  assert.doesNotMatch(apiSource, /dashboard\.local/);
  assert.match(navigationSource, /Unknown dashboard route/);
});

test("the skip link moves focus without changing the router hash", () => {
  assert.match(shell, /const mainRef = useRef<HTMLElement>\(null\)/);
  assert.match(shell, /event\.preventDefault\(\)/);
  assert.match(shell, /mainRef\.current\?\.focus\(\)/);
  assert.match(shell, /ref=\{mainRef\}/);
});
