import { useCallback, useEffect, useMemo, useState } from "react";
import { Analytics } from "./components/Analytics";
import { Dashboard } from "./components/Dashboard";
import { DataPage } from "./components/DataPage";
import { Generator } from "./components/Generator";
import { Layout } from "./components/Layout";
import { SettingsPage } from "./components/SettingsPage";
import { apiGet } from "./lib/api";
import { currentModule, modules, type Lookup } from "./lib/modules";

type Bootstrap = {
  regions: any[];
  accounts: any[];
  products: any[];
  videos: any[];
  competitors: any[];
  templates: any[];
  libtv: any[];
  calendar: any[];
};

const emptyData: Bootstrap = {
  regions: [],
  accounts: [],
  products: [],
  videos: [],
  competitors: [],
  templates: [],
  libtv: [],
  calendar: []
};

function getLocationKey() {
  const pathname = window.location.pathname === "/" ? "/dashboard" : window.location.pathname;
  return `${pathname}${window.location.search}`;
}

export default function App() {
  const [locationKey, setLocationKey] = useState(getLocationKey());
  const [data, setData] = useState<Bootstrap>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const currentPath = locationKey.split("?")[0];
  const searchParams = new URLSearchParams(locationKey.includes("?") ? locationKey.slice(locationKey.indexOf("?")) : "");
  const active = currentModule(currentPath);
  const lookup: Lookup = useMemo(
    () => ({ regions: data.regions, accounts: data.accounts, products: data.products }),
    [data.accounts, data.products, data.regions]
  );

  const load = useCallback(async () => {
    try {
      setError("");
      const next = await apiGet<Bootstrap>("/api/bootstrap");
      setData(next);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "无法连接本地 API");
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setLocationKey(getLocationKey());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onPopState = () => setLocationKey(getLocationKey());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  let content: React.ReactNode;
  if (loading) {
    content = <div className="empty-state">正在连接本地数据库...</div>;
  } else if (error) {
    content = (
      <div className="panel">
        <div className="panel-heading">
          <h3>本地 API 未启动</h3>
          <span>请先运行 npm run dev</span>
        </div>
        <pre className="error-box">{error}</pre>
      </div>
    );
  } else if (active.key === "dashboard") {
    content = <Dashboard data={data} lookup={lookup} navigate={navigate} />;
  } else if (active.key === "analytics") {
    content = <Analytics videos={data.videos} lookup={lookup} />;
  } else if (active.key === "generator") {
    content = <Generator lookup={lookup} onChanged={load} />;
  } else if (active.key === "settings") {
    content = <SettingsPage />;
  } else {
    const rows = active.resource ? (data[active.resource as keyof Bootstrap] as any[]) : [];
    content = (
      <DataPage
        config={active}
        rows={rows}
        lookup={lookup}
        initialQuery={searchParams.get("q") ?? ""}
        onChanged={load}
      />
    );
  }

  return (
    <Layout active={active} collapsed={collapsed} setCollapsed={setCollapsed}>
      {content}
      <footer className="mt-10 border-t border-line pt-5 text-sm text-ink/48">
        {modules.length} 个页面 · 本地 SQLite · 第一阶段 MVP
      </footer>
    </Layout>
  );
}
