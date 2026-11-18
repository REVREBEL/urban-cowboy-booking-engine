import { createMDX } from "fumadocs-mdx/next";
import { createNextStory } from "@fumadocs/story/next";

const basePath = process.env.DOCS_BASE_PATH ?? "";
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
