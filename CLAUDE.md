# Development Guidelines

## READ THIS
- Use styled Shadcn componnet, lets say you want to create a button go style it in the component/ui/button.tsx then use it across the project.
- use huge-icons Instead of lucid icons.
- keep the same design system across the website.
- Use Multi language solution by default, The supported languages are :English, Spanish, Arabic, French, bengladish, indonesia,  Portugase, German, Japenaise, south korea
- each language must bee in its route expect the default (english) in in the main route e.g. HOST/fr HOST/id ...
- You must Render All page staticly whenevr you can.
- Implement The SEO best Practice acrosse The pages.
- Do not use em-dahes to much.
- The copyText in the pages must be close to Human language and not AI.
- use npx tsc for testing TypeScript Errors instead of next build

## Code Structure
- Break features into small, focused files — one responsibility per file
- Organize by: `components/`, `hooks/`, `lib/`, `utils/`, `types/`, `services/`
- Never put multiple unrelated things in one file

## Comments
- Add JSDoc to every exported function
- Comment the WHY, not the what — explain non-obvious decisions
- Example: `// Using ISR here because this data updates every hour, not on every request`

## Next.js Best Practices
- Use App Router by default
- Default to server components — add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Always create `loading.tsx` and `error.tsx` alongside `page.tsx`
- Use `layout.tsx` for shared UI, never duplicate structure across pages

## TypeScript
- Strict mode always — no `any`
- Define shared types in `/types` folder
- Use `interface` for object shapes, `type` for unions/aliases

## Before Writing Code
1. State which files you'll create or modify
2. Explain the structure briefly
3. Then write the code without asking me to confirm
