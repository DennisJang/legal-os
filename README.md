# legal-os
legal-os Repository

## Feeding Repository Context to an LLM 🧠
When you want a powerful model like Gemini (Deep Think mode) to understand **the whole codebase**, you need to give it structured, concise context rather than dumping every file. Here's a workflow that works well:

1. **Start with high‑level docs**
   - Open `README.md`, `package.json`, `turbo.json`, etc. and copy relevant sections.
   - These files explain project goals, packages, and workspace layout.

2. **Generate a trimmed directory tree**
   Run `tree` with depth/paths and wrap the output in a Markdown codeblock. For example:
   ```bash
   tree -L 2              # top‑level folders only
   tree apps/web/src -L 3 # focus on a subproject
   ```
   The model then sees the shape of the repository without being overwhelmed.

3. **Highlight key files and their roles**
   - `apps/web/app/layout.tsx` – root layout for the Next.js web app.
   - `packages/ui/src/button.tsx` – shared UI components.
   - `supabase/functions/*` – serverless functions used by backend tasks.
   A brief sentence or two about each major file or directory helps the model build a mental map.

4. **Share important scripts and commands**
   Paste the `scripts` section of `package.json` or list `pnpm run` commands so the model knows how to build/test/deploy.

5. **Optionally add git history snippets**
   `git log --oneline --grep=feat -n 10` can show recent feature commits.

6. **Chunk large files or directories**
   If a file is huge, include only the parts relevant to the question you're asking.

> **Note:** Always trim or summarise before sending to avoid hitting length limits. The goal is to give the model a coherent snapshot of structure and intent, not every line of code.

---

This README section serves both as a guide for humans and a convenient template to copy when you're preparing inputs for any deep‑thinking LLM.
