import { Menu, PanelLeftClose, Search } from "lucide-react";
import { useEffect } from "react";
import { modules, type ModuleConfig } from "../lib/modules";

type LayoutProps = {
  active: ModuleConfig;
  children: React.ReactNode;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function Layout({ active, children, collapsed, setCollapsed }: LayoutProps) {
  useEffect(() => {
    const selector = [
      ".overview-band",
      ".panel",
      ".stat-card",
      ".row-card",
      ".review-item",
      ".archive-result",
      ".account-dossier",
      ".product-chip",
      ".table-shell",
      ".toolbar"
    ].join(",");
    const surfaces = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    surfaces.forEach((surface, index) => {
      surface.classList.add("motion-surface");
      surface.style.setProperty("--motion-delay", `${Math.min(index * 42, 260)}ms`);
      if (reducedMotion) surface.classList.add("is-visible");
    });

    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    surfaces.forEach((surface) => {
      const rect = surface.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.96 && rect.bottom > 0) {
        surface.classList.add("is-visible");
        return;
      }
      observer.observe(surface);
    });
    return () => observer.disconnect();
  }, [active.path, children]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-20 border-r border-white/70 bg-white/75 shadow-[10px_0_40px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 ${
          collapsed ? "w-[78px]" : "w-[264px]"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-black/5 px-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-[#1d1d1f] to-[#3a3a3c] text-sm font-bold text-white shadow-lg shadow-black/10">
            TK
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">TK Content Growth OS</div>
              <div className="truncate text-xs text-ink/55">TikTok 饰品内容增长工作台</div>
            </div>
          )}
        </div>

        <nav className="space-y-1 px-3 py-4">
          {modules.map((item) => {
            const Icon = item.icon;
            const activeItem = active.path === item.path || (active.path === "/dashboard" && item.path === "/dashboard");
            return (
              <button
                className={`nav-item ${activeItem ? "nav-item-active" : ""}`}
                key={item.key}
                title={item.title}
                onClick={() => {
                  window.history.pushState({}, "", item.path);
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
                {!collapsed && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={`transition-all duration-500 ${collapsed ? "pl-[78px]" : "pl-[264px]"}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/70 bg-white/70 px-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button className="icon-button" onClick={() => setCollapsed(!collapsed)} title="折叠菜单">
              {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{active.title}</h1>
              <p className="text-sm text-ink/58">{active.description}</p>
            </div>
          </div>
          <div className="hidden min-w-[260px] items-center gap-2 rounded-full border border-black/5 bg-white/75 px-3 py-2 text-sm text-ink/52 shadow-sm md:flex">
            <Search size={16} />
            <span>本地数据 · SQLite · 手动管理优先</span>
          </div>
        </header>
        <section className="mx-auto max-w-[1500px] px-6 py-6">{children}</section>
      </main>
    </div>
  );
}
