interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Tier Maker
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and share tier lists with the community
          </p>
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-overlay">
          {children}
        </div>
      </div>
    </div>
  )
}
