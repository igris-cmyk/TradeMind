export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background orbs */}
      <div className="gradient-orb w-96 h-96 -top-48 -left-48 fixed" />
      <div
        className="gradient-orb w-72 h-72 -bottom-36 -right-36 fixed"
        style={{ background: "radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent 70%)" }}
      />

      {/* Grid lines */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
