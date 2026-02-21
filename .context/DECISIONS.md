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
