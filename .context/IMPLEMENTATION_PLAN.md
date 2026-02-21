# 实施计划

## 概览
- 项目：Visual Knowledge Deconstructor
- Milestone 总数：6
- 创建日期：2026-02-21

---

## Milestone 1：项目初始化与基础框架

**目标**：Next.js 项目跑起来，所有技术栈依赖安装配置完成，能在浏览器看到基础页面骨架。

### 任务
- [x] 1.1 使用 `create-next-app` 初始化 Next.js 项目（App Router + TypeScript）
  - 文件：`package.json`、`tsconfig.json`、`next.config.ts`、`app/layout.tsx`、`app/page.tsx`
- [x] 1.2 安装并配置 Tailwind CSS 4 + shadcn/ui
  - 文件：`app/globals.css`、`components.json`、`lib/utils.ts`
- [x] 1.3 安装 React Flow（@xyflow/react）、Jotai、Vercel AI SDK
  - 文件：`package.json`
- [x] 1.4 配置环境变量模板
  - 文件：`.env.local`（gitignore）、`.env.example`
- [x] 1.5 搭建首页布局骨架（标题 + 文本输入区域占位 + 导图区域占位）
  - 文件：`app/page.tsx`、`app/globals.css`

### 验收标准
- `pnpm dev` 启动无报错
- 浏览器访问 localhost 能看到页面骨架
- Tailwind 样式生效、shadcn/ui 组件可用

---

## Milestone 2：文本输入与概念抽取

**目标**：用户粘贴文本后，调用大模型 API 抽取概念，展示带 checkbox 的概念列表供用户勾选。

### 任务
- [x] 2.1 创建文本输入组件（Textarea + 提交按钮）
  - 文件：`components/text-input.tsx`
- [x] 2.2 创建概念抽取 API Route，调用智谱 GLM-4 抽取概念
  - 文件：`app/api/extract/route.ts`
- [x] 2.3 设计 Prompt：以新手视角识别文本中晦涩难懂的概念和专业名词，返回 JSON 数组
  - 文件：`lib/prompts.ts`
- [x] 2.4 创建概念列表组件（checkbox 勾选 + "开始解构"按钮）
  - 文件：`components/concept-list.tsx`
- [x] 2.5 使用 Jotai 管理应用状态（输入文本、概念列表、已选概念、当前步骤）
  - 文件：`store/atoms.ts`
- [x] 2.6 串联首页交互流程：输入 → 抽取 → 展示列表 → 勾选
  - 文件：`app/page.tsx`

### 验收标准
- 粘贴一段中文文本后点击提交，能返回概念列表
- 概念以 checkbox 形式展示，可勾选/取消
- 勾选后点击"开始解构"按钮，状态正确传递

---

## Milestone 3：思维导图生成

**目标**：用户勾选概念并点击"开始解构"后，调用大模型获取大白话解释，以 React Flow 节点图渲染。

### 任务
- [x] 3.1 创建概念解释 API Route，为每个勾选概念生成大白话解释
  - 文件：`app/api/explain/route.ts`
- [x] 3.2 设计解释 Prompt：针对概念在原文语境下生成通俗解释
  - 文件：`lib/prompts.ts`（追加）
- [x] 3.3 定义节点和边的数据结构与类型
  - 文件：`types/graph.ts`
- [x] 3.4 实现自动布局算法（将节点从中心向外辐射排列，避免重叠）
  - 文件：`lib/layout.ts`
- [x] 3.5 创建自定义 React Flow 节点组件（显示概念名称 + 解释内容）
  - 文件：`components/concept-node.tsx`
- [x] 3.6 创建思维导图画布组件，集成 React Flow
  - 文件：`components/mind-map.tsx`
- [x] 3.7 用 Jotai 管理节点/边状态，串联"开始解构" → API 调用 → 渲染导图
  - 文件：`store/atoms.ts`（追加）、`app/page.tsx`（更新）

### 验收标准
- 勾选概念后点击"开始解构"，能看到 React Flow 渲染的节点图
- 中心节点为原文摘要，子节点为各概念及其解释
- 节点布局清晰不重叠，连线正确
- 画布支持拖拽、缩放、平移

---

## Milestone 4：递归展开

**目标**：点击任意概念节点，调用大模型继续拆解，动态衍生子概念分支，导图自动扩展。

### 任务
- [x] 4.1 创建递归展开 API Route，对单个概念进一步拆解子概念并解释
  - 文件：`app/api/expand/route.ts`
- [x] 4.2 设计递归展开 Prompt：在已有语境下深入拆解某个概念
  - 文件：`lib/prompts.ts`（追加）
- [x] 4.3 节点点击交互：点击节点触发展开，已展开节点标记状态
  - 文件：`components/concept-node.tsx`（更新）、`store/atoms.ts`（更新）
- [x] 4.4 动态添加子节点和边，重新计算布局，平滑过渡
  - 文件：`lib/layout.ts`（更新）、`components/mind-map.tsx`（更新）
- [x] 4.5 端到端测试完整流程：输入 → 抽取 → 勾选 → 生成导图 → 递归展开
  - 文件：无新文件，验证整体流程

### 验收标准
- 点击节点后新分支正确出现，连线指向父节点
- 多次递归展开后布局依然清晰
- 已展开节点有视觉标识，不会重复展开
- 整体交互流畅无卡顿

---

## Milestone 5：交互体验完善（P1）

**目标**：补齐加载状态、错误处理、响应式布局，达到生产可用的体验水准。

### 任务
- [x] 5.1 所有 API 调用增加 loading 状态（骨架屏/spinner/节点内 loading 动画）
  - 文件：`components/text-input.tsx`、`components/concept-list.tsx`、`components/concept-node.tsx`、`components/mind-map.tsx`
- [x] 5.2 API 调用失败时的错误提示（Toast 通知 + 重试按钮）
  - 文件：`components/error-toast.tsx`、各 API 调用处
- [x] 5.3 API Route 增加输入校验、超时处理、错误码规范
  - 文件：`app/api/extract/route.ts`、`app/api/explain/route.ts`、`app/api/expand/route.ts`
- [x] 5.4 响应式布局适配（移动端文本输入全屏、导图区域可切换）
  - 文件：`app/page.tsx`、`components/mind-map.tsx`

### 验收标准
- API 调用期间有明确的加载反馈
- 断网或 API 异常时有友好的错误提示和重试入口
- 移动端基本可用，布局不错乱

---

## Milestone 6：增值功能（P2）

**目标**：导出图片/Markdown、localStorage 历史记录、暗色模式切换。

### 任务
- [x] 6.1 思维导图导出为 PNG 图片（html-to-image 或 React Flow 内置方案）
  - 文件：`lib/export.ts`、`components/export-button.tsx`
- [x] 6.2 思维导图导出为 Markdown 文本
  - 文件：`lib/export.ts`（追加）
- [x] 6.3 localStorage 历史记录：保存最近解构记录，支持回看
  - 文件：`store/history.ts`、`components/history-panel.tsx`
- [x] 6.4 暗色模式切换（Tailwind dark mode + shadcn/ui 主题）
  - 文件：`components/theme-toggle.tsx`、`app/layout.tsx`（更新）、`app/globals.css`（更新）

### 验收标准
- 能将当前导图导出为 PNG 和 Markdown
- 历史记录面板展示最近的解构记录，点击可恢复
- 暗色/亮色模式切换正常，所有组件适配
