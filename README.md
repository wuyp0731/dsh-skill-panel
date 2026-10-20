# dsh-skill-panel（技能面板）

一个 DeepSeek Harness Web UI 插件：在左侧边栏提供「技能」入口，点击后在主区域以卡片形式列出当前会话可见的全部已安装 skill，并分为「预设技能」和「我的技能」两类。

位置：`D:\Desktop\dsh_workspace\dsh-skill-panel`

## 功能

- 侧边栏星形图标，排在「插件」下方、「定时任务」上方（`order: 5`）。
- 主区域两个卡片头，点击展开/收起，默认展开「我的技能」：
  - **预设技能**：内置（bundled）、项目 `.dsh/skills` / `.agents/skills`、自定义目录、运行时插件注册的技能；
  - **我的技能**：`<DSH_HOME>/skills` 下的技能，Windows 上即 `C:\Users\burni\.dsh\skills\`。
- 一次只展开一个卡片；再次点击当前卡片头会收起（两个都合上）。
- 每个技能显示 `/名称`、描述、`whenToUse`、完整的 `SKILL.md` 路径、「仅用户可调用」标记。
- 搜索框按名称/描述/用途过滤两个卡片，数量徽标实时更新；「刷新」重新读取目录。
- 中英文界面，跟随 Harness 语言设置。

## 目录结构

```
dsh-skill-panel/
├── package.json        # bundle 清单 + dsh.client 声明
├── cordis.patch.yml    # Loader 行（插入 dsh-skill-panel）
├── index.js            # Host 半：纯 UI 插件，apply 为空
├── client.js           # Client 半：侧边栏图标 + 主面板 + 样式 + 字典
├── locale/
│   ├── zh.json         # 插件管理器中的中文标题与描述
│   └── en.json         # 插件管理器中的英文标题与描述
├── icon.svg            # 插件图标（原创）
└── README.md
```

没有构建步骤，没有依赖：`client.js` 是浏览器端 ESM 工厂（`window.__ModuleLoader__.load`），`index.js` 是 Host 端 ESM 插件。

## 分类规则

「我的技能」= 技能的 `SKILL.md` 绝对路径位于 `<Host home>/.dsh/skills` 之下（来自 `ctx.remote.$host.home`，兼容 home 是用户目录或 `.dsh` 目录本身）；路径之外的技能全部归入「预设技能」。拿不到 Host home 时兜底匹配路径中的 `/.dsh/skills/`。

## 数据来源

面板通过 Host 的 `ctx.remote.skills.list({ sessionId })` 读取目录（与官方「技能引用」插件同一数据源），按当前主视图会话的视图解析：

- 用户级技能（`<DSH_HOME>/skills`）对所有会话可见；
- 项目级技能依赖会话的 cwd，所以没有打开会话时面板会提示先选择一个会话；
- 技能内容不会加载，只读取名称、描述、路径等元数据。

## 安装

### 方式一：通过 DSH Agent 的插件管理器（推荐）

在 DSH 会话中让 Agent 执行插件管理器的 `install_bundle`，目标指向本目录的绝对路径：

```
用 plugin_manager 安装插件：action = install_bundle，target = D:\Desktop\dsh_workspace\dsh-skill-panel
```

安装成功后返回 `application: applied`，刷新 Web 页面即可在侧边栏看到「技能」图标。该方式会自动完成 pnpm 链接、写入 profile 的 bundle 列表并应用 `cordis.patch.yml`。

### 方式二：CLI 手动安装

先确认当前 profile（默认 `desktop`）：

```powershell
$env:DSH_PROFILE   # 例如 desktop
```

1. 把包链接进 profile：

   ```powershell
   dsh plugin --profile desktop add D:\Desktop\dsh_workspace\dsh-skill-panel
   ```

2. 在 profile 的 `package.json` 中登记 bundle。文件位于
   `C:\Users\burni\.dsh\profiles\desktop\package.json`，在 `dsh.profile.bundles`
   数组末尾追加：

   ```json
   "dsh-skill-panel"
   ```

3. 重启 DSH，然后刷新 Web 页面。

> `dsh plugin` 是 pnpm 的透传命令，只负责安装依赖；bundle 的启用与否由
> `dsh.profile.bundles` 决定，两步都不能少。

## 启用、停用与卸载

- **停用 / 启用**：在「设置 → 插件」页面切换，或让 Agent 调用
  `plugin_manager` 的 `set_bundle`（`target: dsh-skill-panel`，`enabled: false/true`）。
- **卸载**：让 Agent 调用 `plugin_manager` 的 `remove_bundle`（`target: dsh-skill-panel`），
  或在 CLI 中：

  ```powershell
  dsh plugin --profile desktop remove dsh-skill-panel
  ```

  随后从 profile 的 `dsh.profile.bundles` 中删除 `"dsh-skill-panel"` 并重启。

## 开发与热更新

本插件以 pnpm `link:` 方式安装，修改的是本目录中的源文件，无需重新构建：

- **Client 半（`client.js`）**：修改后重新执行一次「卸载 + 安装」
  （`remove_bundle` → `install_bundle`），让 Host 重建模块图，然后刷新页面；
- **Host 半（`index.js`）**：重启 DSH 生效；
- 桌面端页面与插件共享同一工作区，安装脚本会直接链接本目录。

调试约定：

- 界面文本统一走 Client locale 服务（`ctx.locale`），字典在 `client.js` 顶部；
- 样式只使用 `--dsw-alias-*` 主题 token，避免硬编码颜色；
- 资源注册都在 `apply(ctx)` 内通过 `ctx.effect` / `ctx.slots.inject` 完成，可随插件卸载回收。

## 兼容性

- DeepSeek Harness 0.2.x Web（`dsh.client.platform: "web"`）；
- 依赖 Host 的 `skills` Remote（`ctx.remote.skills`）以及 Client 服务
  `slots`、`sessions`、`remote`、`locale`；
- 插槽：`sidebar.panellist`（id `skills`）与 `main`（key `skills`）。

## 故障排查

| 现象 | 处理 |
|---|---|
| 侧边栏没有技能图标 | 刷新页面；确认 profile 的 `dsh.profile.bundles` 含 `dsh-skill-panel`；查看浏览器控制台是否有 slot 崩溃信息 |
| 面板提示没有会话 | 先打开/选择一个会话——项目级技能依赖会话 cwd |
| 分类不符合预期 | 展开技能行核对 `SKILL.md` 的实际路径；「我的技能」按 `<DSH_HOME>/skills` 前缀判断 |
| 修改代码后界面没变 | 重新「卸载 + 安装」重建模块图，再刷新页面 |
