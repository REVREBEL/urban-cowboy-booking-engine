import { createMDX } from "fumadocs-mdx/next";
import { createNextStory } from "@fumadocs/story/next";

// Pages project path for this application. Set DOCS_BASE_PATH to an empty
// string only when serving from a custom domain root.
const basePath = process.env.DOCS_BASE_PATH ?? "/urban-cowboy-booking-engine";
const config = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
};

const withMDX = createMDX();
const withStory = createNextStory();
export default withStory(withMDX(config));
