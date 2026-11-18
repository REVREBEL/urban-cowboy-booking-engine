import type { ReactNode } from "react";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import {
  STORY_MAX_WIDTH,
  STORY_MAX_WIDTH_CSS_VAR,
} from "../src/styles/documentation-layout.ts";

/** Re-exported from the shared token so both docs systems use one value. */
export { STORY_MAX_WIDTH, STORY_MAX_WIDTH_CSS_VAR };

/** Set the CSS token consumed by Docs from the shared TypeScript value. */
export function applyStorybookWidthToken() {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty(
      STORY_MAX_WIDTH_CSS_VAR,
      String(STORY_MAX_WIDTH) + "px",
    );
  }
}

export function StoryWidthContainer({ children, padding = 24 }: { children: ReactNode; padding?: number }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: STORY_MAX_WIDTH,
        marginInline: "auto",
        boxSizing: "border-box",
        padding,
      }}
    >
      {children}
    </div>
  );
}

/** Shared layout for generated component documentation. */
export function DocumentationTemplate() {
  return (
    <StoryWidthContainer padding={0}>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <Stories />
    </StoryWidthContainer>
  );
}
