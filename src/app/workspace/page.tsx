import WorkspaceShell from "./WorkspaceShell";

/* Static shell (Track 2, Step B). Data wiring is Steps C–E.
   ?view=first renders the first-session / "the click" variant; default is the returning split. */
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return <WorkspaceShell variant={view === "first" ? "first" : "returning"} />;
}
