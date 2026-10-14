### Execution Scope and Usage Efficiency

For small, localized changes such as swapping icons, adjusting styling, modifying button labels, or updating a single component:

- Inspect only the directly relevant files and dependencies.
- Reuse existing components and design tokens.
- Make the smallest necessary change.
- Do not run the full test suite unless specifically requested.
- Do not launch a browser or perform visual verification unless explicitly requested.
- Do not run production builds or restart servers for simple UI changes unless required to diagnose a reported problem.
- Avoid repeated searches, redundant file reads, and unnecessary tool calls.
- Run one targeted verification when appropriate.
- Report any additional issues without attempting unrelated fixes.
- If broader investigation becomes necessary, explain why before proceeding.

For larger features, architectural changes, integrations, and critical fixes, use the full verification workflow appropriate to the task.

**Optimize for correctness with proportional effort, not maximum activity.**