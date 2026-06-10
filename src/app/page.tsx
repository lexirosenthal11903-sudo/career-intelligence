export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--ink)" }}>
        Career Intelligence
      </h1>
      <p style={{ fontSize: "14px", color: "var(--ink-2)" }}>
        New foundation in place. Screens arrive in Phase 2.
      </p>
    </main>
  );
}
