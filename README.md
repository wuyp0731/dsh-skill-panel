# dsh-skill-panel（技能面板）

DeepSeek Harness Web UI 技能面板插件。在侧边栏提供「技能」入口，集中查看当前会话可见的已安装技能，支持分类、搜索和刷新。

## 功能

- **技能分类**：分为「预设技能」和「我的技能」，默认展开「我的技能」。
- **技能详情**：展示名称、描述、用途、`SKILL.md` 路径及「仅用户可调用」标记。
- **搜索与刷新**：按名称、描述或用途筛选技能，手动刷新技能列表。
- **中英文界面**：跟随 Harness 的语言设置。

「我的技能」指用户级技能目录中的技能；内置技能、项目技能及其他来源的技能归入「预设技能」。技能列表随当前会话变化，项目级技能取决于该会话的工作目录。

## 安装

插件仓库：<https://github.com/wuyp0731/dsh-skill-panel>

### 方式一：直接从 GitHub 安装（推荐）

在 DSH 会话中，让 Agent 使用插件管理器安装 GitHub 仓库：

```text
请使用 plugin_manager 安装 dsh-skill-panel 插件：
action = install_bundle
target = github:wuyp0731/dsh-skill-panel
```

插件管理器会拉取 GitHub 上的最新提交，安装并启用 bundle，无需手动修改 profile 配置。

也可以改用 CLI 完成同样的两步：

```powershell
# 1) 安装到 profile（默认 desktop，可用 $env:DSH_PROFILE 查看当前 profile）
dsh plugin --profile desktop add github:wuyp0731/dsh-skill-panel
```

然后在 profile 的 `package.json`（例如 `C:\Users\burni\.dsh\profiles\desktop\package.json`）的 `dsh.profile.bundles` 数组末尾追加 `"dsh-skill-panel"`，并重启 DSH。

### 方式二：从本地源码目录安装（开发 / 离线）

1. 获取插件。将仓库克隆到你希望存放插件的位置：

   ```sh
   git clone https://github.com/wuyp0731/dsh-skill-panel.git
   ```

   也可以在 GitHub 仓库页面选择 **Code → Download ZIP**，下载后解压。

2. 通过 DSH Agent 安装。将下面的占位符替换为克隆或解压后插件目录的绝对路径：

   ```text
   请使用 plugin_manager 安装 dsh-skill-panel 插件：
   action = install_bundle
   target = <插件目录的绝对路径>
   ```

   目标目录应直接包含 `package.json` 和 `cordis.patch.yml`。本地目录安装以 `link:` 方式链接，修改源码后无需重新安装依赖。

### 打开技能面板

安装成功后刷新 Harness Web 页面，点击左侧边栏的「技能」入口。先打开或选择一个会话，即可查看该会话可见的技能。

## 使用

- 点击「预设技能」或「我的技能」标题展开列表，再次点击可收起；同一时间只展开一组。
- 在搜索框输入关键词，按名称、描述或用途筛选。
- 点击「刷新」重新读取当前会话的技能目录。

面板通过 Harness 的技能接口读取元数据，不会执行技能，也不会加载 `SKILL.md` 正文。

## 更新与卸载

**更新**：

- 从 GitHub 安装的版本：让 DSH Agent 先 `remove_bundle`（`target: dsh-skill-panel`），再重新 `install_bundle`（`target: github:wuyp0731/dsh-skill-panel`），以拉取最新提交；随后刷新 Web 页面。
- 本地目录安装的版本：在插件源码目录执行 `git pull`，或下载并解压新版源码，再通过插件管理器重新安装；随后刷新 Web 页面。

如修改涉及 Host 端代码，还需重启 Harness。

**启用或停用**：在「设置 → 插件」中切换，也可以让 DSH Agent 调用 `plugin_manager` 的 `set_bundle`，目标为 `dsh-skill-panel`。

**卸载**：让 DSH Agent 使用插件管理器卸载 `dsh-skill-panel`（`remove_bundle`）。

## 开发

插件无需单独构建，使用 Harness 提供的运行环境和服务。

```text
dsh-skill-panel/
├── package.json        # 插件清单
├── cordis.patch.yml    # bundle 加载配置
├── index.js            # Host 端入口
├── client.js           # 技能面板、样式及界面字典
├── locale/
│   ├── zh.json         # 插件管理器中文信息
│   └── en.json         # 插件管理器英文信息
├── icon.svg            # 插件图标
└── README.md
```

- `client.js` 通过 `window.__ModuleLoader__.load` 注册客户端模块。
- 技能数据来自 `ctx.remote.skills.list({ sessionId })`。
- 界面文本使用 `ctx.locale`，样式使用 `--dsw-alias-*` 主题变量。
- 用户级技能目录根据 Host 提供的 home 路径识别；无法获取时，按路径中的 `/.dsh/skills/` 识别。

## 兼容性

适用于 DeepSeek Harness 0.2.x 的 Web 界面，依赖 Host 的 `skills` Remote，以及客户端的 `slots`、`sessions`、`remote` 和 `locale` 服务。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 侧边栏没有「技能」入口 | 确认插件已安装并启用，然后刷新页面 |
| 面板提示没有会话 | 先打开或选择一个会话 |
| 找不到项目技能 | 确认当前会话的工作目录对应目标项目，再点击「刷新」 |
| 分类不符合预期 | 检查技能路径是否位于用户级技能目录中 |
| 更新后界面未变化 | 通过插件管理器重新安装插件，再刷新页面；必要时重启 Harness |
| 从本地链接版本切换到 GitHub 版本时报 `ERR_PNPM_EPERM` | 卸载后 `node_modules\<包名>` 可能残留 junction；用 `cmd /c rmdir` 删除该链接目录后重试安装 |