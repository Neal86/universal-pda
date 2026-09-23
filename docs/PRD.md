# Universal PDA — Product Requirements Document

**Version:** 0.1  
**Status:** Active Draft  
**Target:** Android / iOS / iPad / Android Industrial PDA  
**Source of truth:** GitHub repository `Neal86/universal-pda`  
**Development branch:** `develop`  
**Release branch:** `main`

---

## 1. 产品定位

Universal PDA 是一个跨平台企业移动作业客户端，面向仓库、物流、库存、订单和现场运营场景。

产品目标：

> One app for every ERP, WMS and business system.

Universal PDA 不绑定某一套 ERP/WMS。移动端通过统一 Connector Protocol 连接不同系统，并使用统一数据模型、统一扫码模型和统一 Workflow 运行。

首个真实 Connector 为 NiceC WMS，后续支持：

- Odoo
- SAP
- NetSuite
- Microsoft Dynamics
- Shopify
- WooCommerce
- OMS
- 自研 ERP / WMS
- Custom REST Gateway
- 后续 GraphQL / MCP Gateway

---

## 2. 产品原则

### 2.1 Vendor-neutral

Universal PDA Core 禁止直接依赖 NiceC、Odoo、SAP 等供应商数据模型。

移动端只认统一业务对象：

- Product
- Inventory
- Warehouse
- Location
- Order
- Inbound
- Outbound
- Shipment
- Task
- Return
- Customer
- Supplier
- User
- Notification

任何 vendor-specific 字段、认证方式、对象命名和 API 差异必须隔离在 Connector / Gateway 层。

### 2.2 Device-neutral

业务 Workflow 不能直接依赖 Zebra、Honeywell、Urovo、Chainway 等设备 SDK。

设备输入统一转换成 `NormalizedScanEvent`，业务层只处理标准事件。

### 2.3 GitHub-only development

- GitHub 是唯一代码源。
- 不使用 Lucas 或未提交的本地副本作为开发源。
- 所有功能、修复、重构、文档、CI、发布配置必须提交到 GitHub。
- `develop` 用于开发。
- `main` 保持可发布稳定状态。

### 2.4 Modular architecture

功能必须尽量拆分，避免代码污染和回归。

- 页面只做 UI 编排。
- 业务逻辑放在独立 Feature / Workflow。
- Connector 按厂商隔离。
- Device Adapter 按设备能力隔离。
- Storage / Offline / Network / Auth 分层。
- 新功能优先新增独立文件，不把无关逻辑塞入已有大文件。

---

## 3. 目标用户

### 3.1 仓库操作员

主要任务：

- 收货
- 上架
- 拣货
- 复核
- 打包
- 发货
- 移库
- 盘点
- 退货
- 异常处理

### 3.2 仓库主管

主要需求：

- Dashboard
- 任务状态
- 异常
- 待入库
- 待出库
- 库存状态
- 人员作业状态

### 3.3 企业管理人员

主要需求：

- 库存查询
- 订单状态
- 仓库状态
- Tasks
- Exceptions
- Notifications

---

## 4. 支持平台

V1 支持：

- Android Phone
- Android Tablet
- iPhone
- iPad
- Android Industrial PDA

工业 PDA 第一阶段：

- Keyboard Wedge / HID Scanner
- Camera Scanner
- Hardware Scan Key

后续设备能力：

- Zebra DataWedge
- Honeywell Intent / SDK
- Urovo
- Chainway
- Bluetooth Scanner
- RFID
- NFC
- Bluetooth / Network Printer

---

## 5. 首次启动与连接

首次启动显示：

```text
Universal PDA

Connect your business system

[ Universal Gateway ]
[ NiceC WMS ]
[ Odoo ]
[ SAP ]
[ Custom REST ]

+ Add Connection
```

连接字段：

- Connection Name
- Connector Type
- Gateway URL
- Scoped Mobile Access Token

保存前必须调用：

`GET /mobile/v1/capabilities`

只有连接测试成功才允许保存。

生产环境要求 HTTPS。localhost 开发环境可例外。

---

## 6. 多系统连接

一个 App 可以保存多个 Connection。

每个 Connection 独立拥有：

- Access Token
- Capability
- Active Workspace
- Offline Queue
- Connector Metadata
- 权限上下文

用户可以切换 Active Connection。

移除 Connection 时必须删除：

- Secure Token
- Connection Metadata
- 该 Connection 的 Offline Commands

---

## 7. 主导航

V1 主导航：

- Home
- Scan
- Tasks
- Inventory
- Settings

导航和 Workflow 必须根据 Capability 动态调整。

如果连接系统不支持某项能力，则隐藏或禁用对应功能。

---

## 8. Capability Model

接口：

`GET /mobile/v1/capabilities`

示例：

```json
{
  "systemName": "NiceC WMS",
  "organizationName": "Nice Choice Inc",
  "warehouseName": "Los Angeles",
  "features": [
    "dashboard",
    "tasks",
    "inventory",
    "scan",
    "receive",
    "putaway",
    "pick",
    "pack",
    "ship",
    "count",
    "move",
    "return"
  ]
}
```

Capability 决定：

- 可见菜单
- 可用 Workflow
- 可用操作
- 可用设备能力入口

---

## 9. Dashboard

接口：

`GET /mobile/v1/dashboard`

Dashboard 只显示真实 Connector 数据。

禁止生产路径使用 mock 数据。

示例：

- To Receive
- To Pick
- To Pack
- Ready to Ship
- Exceptions

---

## 10. Tasks

接口：

- `GET /mobile/v1/tasks?status=open`
- `POST /mobile/v1/tasks/:id/complete`

Task 类型包括：

- Receive
- Putaway
- Pick
- Pack
- Ship
- Count
- Move
- Return
- Exception
- Re-label

服务器负责：

- 权限
- 状态机
- Audit Log
- 并发冲突检查

---

## 11. Inventory

接口：

`GET /mobile/v1/inventory/search?q=<query>`

支持查询：

- SKU
- Barcode
- Product Name
- Location / Bin
- Lot
- Serial
- Pallet

显示：

- SKU
- Product
- Warehouse
- Location
- On Hand
- Available
- UOM
- Lot / Serial（如有）

---

## 12. 全局扫码

支持输入：

- Industrial PDA Hardware Scanner
- Camera Scanner
- Manual Barcode Entry

后续：

- RFID
- NFC
- Bluetooth Scanner

统一事件：

```ts
type NormalizedScanEvent = {
  value: string;
  source: 'camera' | 'keyboard-wedge' | 'vendor-sdk' | 'manual';
  symbology?: string;
  scannedAt: string;
};
```

---

## 13. Workflow

V1 Workflow：

- Identify
- Receive
- Putaway
- Pick
- Pack
- Ship
- Count
- Move
- Return

每个 Workflow 必须单独模块化。

目录示例：

```text
src/workflows/
  core/
  identify/
  receive/
  putaway/
  pick/
  pack/
  ship/
  count/
  move/
  returns/
```

---

## 14. Identify

用途：

扫描任意条码并自动识别对象。

可识别：

- Product
- Location
- Order
- Tote
- Pallet
- Shipment
- Return
- Serial
- Lot

返回对象摘要和下一步可执行操作。

---

## 15. Receive

流程：

```text
Scan PO / ASN / Inbound
→ Scan Product
→ Quantity
→ Exception Check
→ Confirm Receive
```

异常：

- Missing
- Overage
- Damaged
- Wrong SKU
- Wrong Quantity
- Unknown Barcode

---

## 16. Putaway

流程：

```text
Scan Product / Pallet
→ Show Suggested Location
→ Scan Destination Bin
→ Validate
→ Confirm Putaway
```

校验：

- Warehouse
- Product
- Source
- Destination
- Quantity

---

## 17. Pick

流程：

```text
Scan Order / Task
→ Scan Source Bin
→ Scan Product
→ Quantity Validation
→ Scan Tote
→ Next Item
```

异常：

- Wrong Bin
- Wrong Product
- Short Pick
- Over Pick
- Damaged
- Missing

---

## 18. Pack

流程：

```text
Scan Order / Tote
→ Scan Items
→ Verify Quantity
→ Package
→ Confirm Pack
```

后续扩展：

- Weight
- Dimensions
- Packing Slip
- Label Printer
- Shipping Label

---

## 19. Ship

流程：

```text
Scan Shipment
→ Verify Package
→ Tracking / Carrier
→ Confirm Ship
```

后续 Connector：

- UPS
- FedEx
- USPS
- Amazon
- ShipStation

---

## 20. Move

流程：

```text
Scan Product
→ Scan Source Bin
→ Quantity
→ Scan Destination Bin
→ Confirm Move
```

服务器必须验证：

- Available Inventory
- Permission
- Location Validity
- Inventory Lock
- Quantity

---

## 21. Count

模式：

- Cycle Count
- Full Count
- Spot Check

流程：

```text
Scan Location
→ Scan SKU
→ Enter Count
→ Compare System Quantity
→ Difference
→ Supervisor Approval if required
```

---

## 22. Return

流程：

```text
Scan Return / Order
→ Scan Product
→ Condition
→ Reason
→ Disposition
```

Condition：

- New
- Opened
- Used
- Damaged
- Defective
- Missing Parts

Disposition：

- Restock
- Refurbish
- Quarantine
- Dispose
- Return to Vendor

---

## 23. Offline Mode

所有 mutation 在发送前生成 `operationId`。

断网或可重试错误：

```text
Create operationId
→ Save SQLite
→ Show Saved Offline
→ Network Restored
→ Retry
→ Success
→ Remove Queue Item
```

Queue 必须持久化：

- Operation ID
- Connection ID
- Command Type
- Payload
- Attempts
- Next Attempt Time
- Last Error
- Created Time

Queue 禁止保存：

- Authorization Header
- ERP Password
- API Secret

---

## 24. Retry Policy

默认指数退避：

- 2 sec
- 4 sec
- 8 sec
- 16 sec
- 32 sec
- …

最大间隔：

- 5 minutes

最大自动重试：

- 8 attempts

超过后进入 Needs Attention 状态，不无限请求服务器。

---

## 25. Duplicate Protection

客户端扫码短时间防重复：

- 默认 1.2 秒窗口

服务器二次保护：

- 每个 mutation 必须带 `operationId`
- Connector / Server 必须支持 Idempotency

---

## 26. Connector Protocol v1

V1 标准接口：

```text
GET  /mobile/v1/capabilities
GET  /mobile/v1/dashboard
GET  /mobile/v1/tasks
POST /mobile/v1/tasks/:id/complete
GET  /mobile/v1/inventory/search
POST /mobile/v1/scan
POST /mobile/v1/devices/push-token
```

详细协议见：

`docs/CONNECTOR_PROTOCOL.md`

---

## 27. NiceC Connector

NiceC 是第一个真实 Connector。

要求：

- 不在通用 Core 中加入 NiceC 专属字段。
- NiceC 数据通过 Gateway 转换成 Universal PDA Protocol。
- NiceC Connector 必须支持真实数据，不使用 mock。
- V1 至少完成：
  - capabilities
  - dashboard
  - tasks
  - inventory search
  - identify
  - receive
  - putaway
  - pick
  - pack
  - ship
  - count
  - move
  - return

---

## 28. Security

移动 App 不保存：

- ERP Admin Password
- Database Password
- Vendor API Secret
- SAP / Odoo 管理员密码

移动 App 只保存：

- Scoped Mobile Access Token

Token 使用 OS Secure Storage：

- iOS Keychain
- Android Keystore

服务器必须具备：

- Token Expiry
- Token Revocation
- Tenant Isolation
- RBAC
- Rate Limit
- Audit Log
- Input Validation

---

## 29. Permission Model

典型角色：

- Worker
- Supervisor
- Manager
- Admin

最终权限必须由服务器判断，不能只依赖客户端 UI。

示例：

Worker：

- Scan
- Pick
- Pack
- Count
- No destructive inventory adjustment

Manager：

- Inventory Adjustment
- Exception Approval
- Override actions

---

## 30. 高风险操作

以下操作需要清楚的确认 UI：

- Inventory Adjustment
- Cancel Shipment
- Void Pick
- Force Complete
- Delete Task
- Large Quantity Adjustment

执行流程：

```text
Show exact action and purpose
→ User confirms
→ Server checks permission
→ Execute
→ Audit
```

---

## 31. Audit Log

所有业务写操作应记录：

- User
- Device
- Time
- Connection
- Workflow
- Action
- Object
- Before
- After
- operationId
- Result

---

## 32. Notifications

V1 支持 Push Notification 基础能力。

通知场景：

- New Task
- Urgent Order
- Exception
- Low Inventory
- Shipment Ready
- Receive Complete
- Pick Exception
- System Alert

后续支持 Deep Link 到：

- Task
- Order
- Shipment
- Inventory
- Exception

---

## 33. Industrial PDA UX

工业 PDA 页面要求：

- 大按钮
- 大字体
- 高对比
- 少层级
- 单手操作
- 戴手套可操作
- 扫码自动聚焦
- 尽量不弹软件键盘
- 扫码成功震动 / 声音
- 错误明显提示
- 连续扫码
- 长时间运行稳定

---

## 34. 本地存储

本地数据库使用 SQLite。

V1 表：

- `connections`
- `app_settings`
- `offline_commands`

后续：

- `cached_tasks`
- `cached_inventory`
- `workflow_sessions`
- `recent_scans`

---

## 35. 代码目录要求

```text
src/
  app/
  auth/
  connectors/
    core/
    nicec/
    odoo/
    sap/
    custom-rest/
  core/
  device/
    feedback/
    notifications/
    scanner/
      core/
      camera/
      keyboard-wedge/
  features/
  network/
  offline/
  storage/
  ui/
  workflows/
  shared/
```

禁止把不同业务集中到：

- App.tsx
- ScanScreen.tsx
- api.ts
- utils.ts

Route 文件只负责 Feature 组装。

---

## 36. 错误处理

必须覆盖：

- Network Offline
- Timeout
- 401 / 403
- 404
- 409 Conflict
- 429 Rate Limit
- 5xx
- Invalid Barcode
- Wrong Workflow State
- Permission Denied
- Duplicate Operation
- Stale Task
- Inventory Changed
- Connector Unsupported Feature

用户提示必须可读，并给出可恢复路径。

---

## 37. V1 上线验收标准

代码与产品能力：

- Android build
- iOS build
- Industrial PDA run
- Multi Connection
- Secure Token
- Capability
- Dashboard
- Tasks
- Inventory
- Camera Scan
- Hardware Scan
- Manual Scan
- Identify
- Receive
- Putaway
- Pick
- Pack
- Ship
- Count
- Move
- Return
- Offline Queue
- Retry
- Duplicate Protection
- Push Notification
- Error Handling
- Permission Model
- Audit Protocol
- EAS Build
- Privacy Policy
- Store Metadata

真实环境：

- NiceC Connector 使用真实 API
- Android 真机验证
- iPhone 真机验证
- 至少一台工业 Android PDA 验证
- 弱网 / 断网测试
- 连续扫码测试
- 后台恢复测试
- Token 删除测试
- Idempotency 测试
- 全 Workflow 测试

---

## 38. Store Release

上线前需要：

### Apple

- Apple Developer Program
- App Store Connect Record
- Signing
- Screenshots
- Privacy Policy URL
- Support URL
- Privacy Questionnaire
- TestFlight QA

### Google Play

- Play Console
- App Record
- Signing
- Store Listing
- Privacy Policy URL
- Data Safety Form
- Internal / Closed Test
- Production AAB

### Industrial PDA

可通过：

- MDM
- Managed Google Play
- Enterprise APK / AAB Distribution

---

## 39. 当前完成状态

当前 `develop` 已具备：

- Expo / React Native 基础
- Android / iOS App Identity
- Strict TypeScript
- 模块化目录
- Connector Core
- NiceC / Odoo / SAP / Custom Connector Definition
- Workflow Registry
- Identify / Receive / Putaway / Pick / Pack / Ship / Count / Move / Return 定义
- Camera Scanner
- Keyboard Wedge Scanner
- SecureStore Token
- SQLite Schema
- Multi Connection
- Offline Queue
- Retry Policy
- Dashboard
- Tasks
- Inventory
- Scan Feature
- Capability Provider
- Push Notification 基础
- EAS Build Profile
- Privacy / Architecture / Connector / Release Docs

最近验证结果：

- TypeScript typecheck: PASS
- ESLint: PASS
- Unit Tests: 7 / 7 PASS

---

## 40. 剩余上线关键路径

按优先顺序：

```text
真实 NiceC Connector
→ 完整真实 Workflow API
→ 真机 Android / iPhone / PDA 测试
→ EAS Project / Signing
→ Store Assets & Metadata
→ Release Candidate
→ main
→ App Store / Google Play
```

---

## 41. PRD 同步规则

任何新增、删除或修改以下内容时，必须同步更新本 PRD：

- 用户流程
- Workflow
- Connector Contract
- Device Capability
- Offline Behavior
- Permission
- Security
- Release Requirement
- Major UI Navigation
- Store-facing behavior

代码与 PRD 冲突时，不允许直接忽略。必须明确决定是：

1. 更新代码以符合 PRD；或
2. 更新 PRD 后再修改代码。

PRD 与代码必须保持同步。
