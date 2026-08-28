/**
 * Common project starting points, used by the "new project" picker to create the
 * project and seed its first interview turn.
 */
export type ProjectTypeOption = { label: string; message: string };

export const PROJECT_TYPE_OPTIONS: ProjectTypeOption[] = [
  { label: "Static website", message: "I'm building a static website." },
  { label: "Static site with a blog", message: "I'm building a static website with a blog." },
  {
    label: "Site with a backend/database",
    message: "I'm building a website with a backend and a database.",
  },
  { label: "Phone app", message: "I'm building a mobile phone app." },
  { label: "Desktop app", message: "I'm building a desktop app." },
];
