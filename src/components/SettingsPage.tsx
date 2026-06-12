import { Database, KeyRound, ListChecks } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="panel xl:col-span-2">
        <div className="panel-heading">
          <h3>本地运行说明</h3>
          <span>第一阶段只使用本地 API 和 SQLite</span>
        </div>
        <div className="settings-list">
          <div>
            <Database size={19} />
            <span>数据库</span>
            <strong>prisma/dev.db</strong>
          </div>
          <div>
            <KeyRound size={19} />
            <span>DeepSeek API</span>
            <strong>.env 中配置 DEEPSEEK_API_KEY</strong>
          </div>
          <div>
            <ListChecks size={19} />
            <span>MVP 范围</span>
            <strong>手动录入、CRUD、复制、基础复盘、模拟生成</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h3>后续阶段</h3>
          <span>已经预留数据边界</span>
        </div>
        <ul className="rule-list">
          <li>CSV 导入 TikTok 数据和 GMV 表格。</li>
          <li>DeepSeek API 自动生成脚本、Tags、复刻版本。</li>
          <li>图表分析、爆款模板自动提取。</li>
          <li>Electron 或 Tauri 打包为桌面软件。</li>
        </ul>
      </section>
    </div>
  );
}
