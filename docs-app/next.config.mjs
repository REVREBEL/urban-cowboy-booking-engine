import { createMDX } from "fumadocs-mdx/next";
import { createNextStory } from "@fumadocs/story/next";
import { resolveDocsBasePath } from "../scripts/fumadocs/base-path.mjs";

// Pages builds use the project path by default. Local dev stays at `/` so the
// usual dev-server root works; set DOCS_BASE_PATH=/ for custom-domain roots.
const isDev = process.argv.includes("dev") || process.env.NODE_ENV === "development";
const basePath = resolveDocsBasePath(process.env, { isDev });
const config = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Client demos need the deployed base path for root-relative component assets.
  env: { NEXT_PUBLIC_DOCS_BASE_PATH: basePath },
};

const withMDX = createMDX();
const withStory = createNextStory();
export default withStory(withMDX(config));
