"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "ti-layout-dashboard", exact: true },
  { href: "/admin/projects", label: "Projects", icon: "ti-photo" },
  { href: "/admin/types", label: "Categories", icon: "ti-category" },
  { href: "/admin/services", label: "Services", icon: "ti-tools" },
  { href: "/admin/hero", label: "Hero video", icon: "ti-video" },
  { href: "/admin/gallery", label: "Gallery", icon: "ti-layout-grid" },
  { href: "/admin/circle-gallery", label: "Circle gallery", icon: "ti-circle-dot" },
  { href: "/admin/review", label: "Client review", icon: "ti-quote" },
  { href: "/admin/messages", label: "Messages", icon: "ti-mail" },
  { href: "/admin/settings", label: "Settings", icon: "ti-settings" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-ink-line bg-ink-soft">
      <div className="flex items-center gap-2.5 border-b border-ink-line px-5 py-5">
        <LogoMark className="h-7 text-brand" />
        <div>
          <div className="font-serif text-lg leading-none text-cream">Insider</div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-cream/40">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brand/15 text-brand"
                  : "text-cream/60 hover:bg-cream/5 hover:text-cream"
              )}
            >
              <i className={`ti ${item.icon} text-lg`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-line p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/60 hover:text-cream"
        >
          <i className="ti ti-external-link text-lg" /> View site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/60 hover:text-cream"
          >
            <i className="ti ti-logout text-lg" /> Sign out
          </button>
        </form>
        <div className="truncate px-3 pt-2 text-[11px] text-cream/35">{email}</div>
      </div>
    </aside>
  );
}
