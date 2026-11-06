import type { ReactNode } from "react";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";

export const STORY_MAX_WIDTH = 1600;

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
