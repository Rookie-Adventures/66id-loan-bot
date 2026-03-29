# 66ID 贷款机器人 — Cloudflare Workers v7

Telegram 贷款 Bot，运行在 Cloudflare Workers + KV 上。

## 文件结构

```
worker.js   ← 唯一入口文件，直接部署到 Cloudflare Workers
README.md
```

## 部署方法

1. 在 Cloudflare Workers 后台新建 Worker，把 `worker.js` 内容粘贴进去
2. 绑定 KV Namespace，变量名为 `BOT_KV`
3. 添加 Cron 触发器（每天一次），用于逾期提醒
4. 设置 Telegram Webhook：
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-worker>.workers.dev
   ```

## 主要改动记录

### v7（当前版本）
- 内部所有金额（借款、应还、逾期、统计）继续使用人民币数字计算
- **用户填写的还款金额** 支持自带单位文本（50U / 50 USDT / 350 RMB / 350 等），系统原样存储和显示，不做数值解析
- 去掉还款金额输入环节的 `isNaN` 校验，改为非空校验
- 还款确认消息和转发消息中金额不再强制加 `¥` 前缀

## 管理员指令速查

| 指令 | 说明 |
|------|------|
| `/approve 用户ID 金额` | 批准贷款 |
| `/renew 用户ID 天数` | 续期 |
| `/repaid 用户ID` | 标记已还款 |
| `/getuser 用户ID` | 查询用户详情 |
| `/loanlist` | 所有贷款用户总览 |
| `/stats` | 数据统计 |
| `/setconfig {...}` | 动态修改配置 |
| `/settext {...}` | 动态修改文案 |
| `/getconfig` | 查看当前配置 |
| `/broadcast 内容` | 群发消息 |
| `/liuliu` | 查看完整帮助 |
