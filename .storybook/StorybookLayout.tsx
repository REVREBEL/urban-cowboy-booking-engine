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

export function StoryWidthContainer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: STORY_MAX_WIDTH,
        marginInline: "auto",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

/** Shared layout for generated component documentation. */
export function DocumentationTemplate() {
  return (
    <StoryWidthContainer>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <Stories />
    </StoryWidthContainer>
  );
}
