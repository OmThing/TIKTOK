import { Menu, PanelLeftClose, Search } from "lucide-react";
import { modules, type ModuleConfig } from "../lib/modules";

type LayoutProps = {
  active: ModuleConfig;
  children: React.ReactNode;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function Layout({ active, children, collapsed, setCollapsed }: LayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-20 border-r border-line bg-[#fffffb] transition-all duration-200 ${
          collapsed ? "w-[78px]" : "w-[264px]"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-line px-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-sm font-bold text-white">TK</div>
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

      <main className={`transition-all duration-200 ${collapsed ? "pl-[78px]" : "pl-[264px]"}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-paper/92 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="icon-button" onClick={() => setCollapsed(!collapsed)} title="折叠菜单">
              {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{active.title}</h1>
              <p className="text-sm text-ink/58">{active.description}</p>
            </div>
          </div>
          <div className="hidden min-w-[260px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink/52 md:flex">
            <Search size={16} />
            <span>本地数据 · SQLite · 手动管理优先</span>
          </div>
        </header>
        <section className="mx-auto max-w-[1500px] px-6 py-6">{children}</section>
      </main>
    </div>
  );
}
