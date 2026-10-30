# ShopBoard — AI Agent Instructions

## 1. Project Overview

ShopBoard is an educational frontend web application built as part of the CorePro Software Development Using AI program.

The project focuses on building a clean, responsive, accessible web interface using Vite and vanilla web technologies.

Follow the requirements provided in each development task. Do not assume or implement additional features unless explicitly requested or approved.

## 2. Tech Stack

- Vite (Vanilla JavaScript)
- HTML5
- CSS3
- JavaScript (ES Modules)

Use the existing project setup and dependencies.

Do not introduce additional frameworks, libraries, or tools without prior approval.

## 3. Coding Standards

### HTML
- Use semantic HTML first.
- Prefer appropriate HTML5 elements such as header, nav, main, section, article, and form.
- Every input must have an associated label.
- Use native HTML validation whenever appropriate.
- Maintain accessible and understandable markup.

### CSS
- Follow a mobile-first approach.
- Use min-width media queries for responsive layouts.
- Never use !important.
- Keep CSS clean, readable, and organized.
- Avoid unnecessary duplication.

### JavaScript
- Use vanilla JavaScript and ES Modules.
- Keep functions simple and focused.
- Use meaningful variable and function names.
- Avoid unnecessary complexity.
- Maintain readable and maintainable code.

### General
- Explain every change.
- Follow consistent formatting.
- Prefer simple solutions over unnecessary abstractions.
- Preserve existing working functionality.

## 4. AI Workflow

Follow this workflow for development tasks:

1. Understand the requested task and its requirements.
2. Briefly explain the implementation plan.
3. Make small, focused changes independently.
4. Stay within the approved project scope.
5. Request approval before:
   - Making major architectural changes.
   - Deleting files or existing functionality.
   - Installing new dependencies.
   - Adding features outside the requirements.
6. Verify the implementation.
7. Explain what was changed and why.

Do not make destructive or significant changes without explicit approval.

## 5. Project Structure

Preserve the existing Vite Vanilla project structure.

Main project files:

- index.html — Main HTML entry point.
- src/main.js — JavaScript application logic.
- src/style.css — Application styling.
- public/ — Public static assets.
- AGENTS.md — AI development instructions.
- package.json — Project configuration and dependencies.

Guidelines:

- Keep the structure simple and organized.
- Maintain clear responsibilities for each file.
- Avoid unnecessary folders or files.
- Create additional files or directories only when justified by project requirements.
- Do not reorganize existing files without a clear reason.
- Keep the structure maintainable and easy to extend.

## 6. Dependencies & Scope

- Follow the approved technology stack.
- Use existing dependencies whenever possible.
- Avoid unnecessary external libraries.
- Do not install new dependencies without approval.
- Do not implement additional functionality without approval.
- Additional tools or features may be suggested, but must be explained and approved before implementation.
- Do not introduce a backend, database, authentication service, or payment system unless explicitly requested.
- Keep the implementation aligned with the current assignment requirements.

## 7. Testing & Verification

After every significant implementation or modification:

1. Verify that the development server runs using:

   npm run dev

2. Verify that the production build succeeds using:

   npm run build

3. Check for JavaScript errors in the browser console when browser access is available.

4. Verify that forms use appropriate labels and native HTML validation.

5. Check responsive behavior on mobile and desktop screen sizes.

6. Confirm that existing functionality remains operational.

7. Explain the verification results and any remaining issues.

Never claim that a test passed unless it was actually executed.

If a test cannot be performed, explicitly state that it was not verified.

Do not introduce additional testing frameworks without approval.
