# Storybook Canvas and Docs layout

Canvas and Docs use the full available width up to **1600px**, centered on wider displays.

The shared setting lives in `.storybook/StorybookLayout.tsx` as
`STORY_MAX_WIDTH`. The Canvas uses `StoryWidthContainer`, and generated
Autodocs pages use `DocumentationTemplate`. The existing
`.storybook/preview-head.html` also overrides Storybook's narrower Docs
content-width limit (including custom MDX documentation).

## Layout variants

- **Full-width composition:** Use `parameters: { layout: "fullscreen" }`
  (the global default), or omit the parameter. Ensure the component has
  responsive styles such as `w-full` if it should expand.
- **Small standalone controls and icons:** Set
  `parameters: { layout: "centered" }` at story or meta level.
  These intentionally bypass the full-width canvas decorator.
- **Autodocs:** Add `tags: ["autodocs"]`. The shared Docs template renders
  Title, Subtitle, Description, Primary, Controls, and Stories.

The max width is a container constraint, not a forced width for child components.
For example, a component using `w-[894px]` retains that fixed width until its
own styles are changed. This setting does not alter production booking pages.

## Shared preview padding and responsive card examples

The shared Canvas decorator adds **24px of internal padding**, including
inside Autodocs previews. Set `layout: "centered"` for small standalone
components; the default is `fullscreen`.

Avoid story-local `overflow-x-auto` decorators: they introduce nested
scrollbars in the Docs preview rather than letting responsive components
reflow. The `RoomListItem` story demonstrates a fluid card grid with
auto-fitting columns, replacing its old fixed 1790px Figma frame.
The `RoomsListBuilding` story uses the global decorator without a local
wrapper, so its responsive grid gets the same breathing room.

Responsive behavior must be implemented on the component itself, not only
in Storybook. The Storybook wrapper does not force fixed-width children
to shrink or change the production layout at different breakpoints.
