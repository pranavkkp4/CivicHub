import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="page-shell relative min-h-screen overflow-hidden bg-transparent pb-10 pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(197,106,67,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(117,151,164,0.18),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-6rem] top-[24rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(95,138,99,0.18),transparent_70%)] blur-3xl" />
      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
