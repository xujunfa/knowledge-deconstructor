# 决策日志

## [DEC-001] AI SDK 版本适配
- **日期**：2026-02-21
- **里程碑**：2 — 文本输入与概念抽取
- **背景**：Vercel AI SDK v6 API 变更
- **决策**：使用 `maxOutputTokens` 替代 `maxTokens`（v6 breaking change）
- **理由**：项目安装的是 ai@6.0.95，v6 移除了 `maxTokens` 参数

## [DEC-002] Toast 通知方案
- **日期**：2026-02-21
- **里程碑**：5 — 交互体验完善
- **背景**：需要错误提示和操作反馈
- **备选方案**：
  1. shadcn/ui toast（已废弃）
  2. Sonner（shadcn/ui 推荐替代）
- **决策**：使用 Sonner
- **理由**：shadcn/ui 官方已将 toast 标记为 deprecated，推荐 sonner

## [DEC-003] ReactFlowProvider 包裹
- **日期**：2026-02-21
- **里程碑**：6 — 增值功能
- **背景**：ExportButton 需要 `useReactFlow()` hook
- **决策**：将 MindMap 拆为 MindMapInner + 外层 ReactFlowProvider 包裹
- **理由**：`useReactFlow()` 必须在 ReactFlowProvider 内部使用

## [DEC-004] 智谱 API Base URL 配置
- **日期**：2026-02-21
- **类型**：Bugfix
- **背景**：@ai-sdk/anthropic SDK 调用智谱 API 返回 500 错误
- **根因**：SDK 拼接路径为 `baseURL + /messages`，缺少 `/v1` 导致请求 404
- **决策**：`ANTHROPIC_BASE_URL` 设为 `https://open.bigmodel.cn/api/anthropic/v1`
- **理由**：智谱 API 兼容 Anthropic 格式的正确端点为 `/api/anthropic/v1/messages`

## [DEC-005] 思维导图边线连接策略
- **日期**：2026-02-21
- **类型**：Bugfix + 视觉优化
- **背景**：径向布局下节点重叠，边线不可见或路径扭曲
- **问题分析**：
  - 固定半径 280px < 节点宽度 240px → 节点重叠
  - Handle 固定 top/bottom → 水平节点边线绕远路
- **决策**：
  1. 动态半径：`Math.max(420, count * 100)`
  2. 4 方向 Handle（top/bottom/left/right）
  3. 角度计算函数 `handleForAngle()` 选择最近连接点
  4. 边线类型：`bezier`（替代 `smoothstep`）
  5. Handle 不可见（`opacity-0`）
- **理由**：
  - 动态半径避免节点重叠，随节点数量缩放
  - 4 方向 Handle 确保径向边线从最近侧连接
  - Bezier 曲线更符合思维导图视觉习惯
  - 隐藏 Handle 避免视觉噪音
