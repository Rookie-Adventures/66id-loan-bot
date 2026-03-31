// ================================================================
// 66ID 贷款机器人 — Cloudflare Workers 完整版 v11
// ================================================================


const DEFAULT = {
  BOT_TOKEN:        "8604621639:AAEMH_W5NDU1Z2pVIvtl3fiXIIjqrO2-3U0",
  FORWARD_TARGETS:  ["8333517664"],
  ADMIN_IDS:        ["8333517664"],
  CUSTOMER_SERVICE: "https://t.me/liuliuidid_bot",
  CHANNEL_LINK:     "https://t.me/liuLiuid",
  ENERGY_BOT:       "https://t.me/trx20gasbot",
  PAYMENT_ADDRESS:  "TG6kiaNUUgA56wy2mXbBo4E9TgpUbXoKWw",
  QR_FILE_ID:       "",
  QR_FILE_ID_2:     "",
  LOAN_DAYS:        7,
  DAILY_RATE:       0.1,
};

let CONFIG = { ...DEFAULT };
const API = `https://api.telegram.org/bot${DEFAULT.BOT_TOKEN}`;

async function loadConfig(env) {
  try {
    const raw = await env.BOT_KV.get("config");
    if (raw) {
      const kv = JSON.parse(raw);
      CONFIG = { ...DEFAULT, ...kv };
      if (kv.FORWARD_TARGETS) CONFIG.FORWARD_TARGETS = kv.FORWARD_TARGETS;
      if (kv.ADMIN_IDS)       CONFIG.ADMIN_IDS       = kv.ADMIN_IDS;
    }
  } catch {}
}

// ================================================================
// 文案
// ================================================================
const DEFAULT_TEXT = {
  welcome: `👋 👋 欢迎使用 六六🍎ID 贷款助手！
急用钱，请认准 六六🍎ID贷！！
我们在ID贷领域深耕多年，积累了丰富服务经验和口碑。
为了提供更安全便捷的服务，已使用公群担保，经营有保障。
我们承诺会始终坚持安全可靠高额度低利息让用户用的放心的服务。
📋 资料简单：登录 ID 即可（不影响正常使用）
⚡ 审核快，最快 5 分钟到账
💸 提前还款利息减半
🎁 老客户享提额度 + 降息福利。
💳 支持下款方式：
💵USDT 🍀微信 🌺支付宝


🔒 安全无套路，拒绝高息陷阱！
✅ 高额度 · 低利息 · 安全可靠`,

  loan_info: `贷款须知✨
本群业务为苹果手机ID贷款咨询业务


1. 未成年可贷，不做多机，备用机的也别来，只限本人借款。没有偿还能力的不要来，救急不救穷。


2. 12起做，iOS更新系统到17.5以上，面容坏了可做，电池不到10天可做，根据手机实际情况降额度（如低配、更换零件）额度表仅供参考，实际额度以客服审核估价为准。


3. 贷款找业务员提交资料，确定要借款则进入会议核对环节，配合审核员审核，如拒不配合或者辱骂本群审核员，则有权锁机一个礼拜、抹除数据作为惩罚并赔偿误工费。审核过程中审核人员已经上好ID，你由于自身原因停止借款或者验证非本人操作的按浪费人力物力财力缴纳误工费否则锁机协商处理。


4. 恶意骗贷（含在别的公群借钱不还）、代操作、官解机、隐藏机、多个人操作、虚假身份信息、非本人操作、双设备、技术操作；恶意隐瞒没有提前告知，出现以上情况，一旦发现，有权锁机并抹除数据视情况恶劣程度罚500-1000。


5. 到期不归还贷款，逾期将会被清除手机数据，设置丢失模式，手机锁死，被泄露个人资料，被催收骚扰等，我方概不负责！


6. 贷款周期7天（含当天），到期无力偿还可选择续期（周续/天续）。逾期天息为总欠款×10%，例：总还款350÷7=50元/天，及时缴清否则有权锁机处理。


💳 下款方式：USDT / 微信 / 支付宝
🏦 唯一还款地址：
<code>TG6kiaNUUgA56wy2mXbBo4E9TgpUbXoKWw</code>
（微信/支付宝需我方确认后进款才算）


⚠️ 苹果ID借款注意事项：
1. 登陆ID后禁止乱试密码/密保或拿去做其他业务！
2. 借款途中导致ID停用，公群不承担责任，可协助提供解除教程。
3. ID停用属于百分之一风控，按教程绝大部分可解除。


🛡 担保公群：https://t.me/+j6LNmLkLlvg1YTA1
📢 下款群组：https://t.me/liuLiuid`,

  agree_prompt: `📋 请确认您已阅读并同意以上贷款须知。


点击下方按钮开始申请 👇`,

  duplicate_apply: `⚠️ 您已提交过申请，请耐心等待专员联系。
如有疑问请联系在线客服：https://t.me/liuliuidid_bot`,

  repay_info: `💰 还款说明


贷款周期7天（含当天），到期无力偿还可选择续期。


📌 逾期规则：
• 天息 = 总欠款金额 × 10%
• 例：总还款350元 ÷ 7 = 50元/天
• 到期必须还款，逾期有权锁机处理


请选择您的操作：`,

  promote: `🎉 六六ID贷 优惠活动


━━━━━━━━━━━━━━
⚡️ 活动一：24小时极速还款
借款后24小时内完成还款，即享🔥利息减半！


━━━━━━━━━━━━━━
🎁 活动二：推荐奖励计划


👥 推荐 3 位 → 3个月TG会员（6.8 USDT / 58 RMB）
👥 推荐 5 位 → 6个月TG会员（12.8 USDT / 88 RMB）
👥 推荐 10 位 → 12个月TG会员（18.8 USDT / 139 RMB）


可选择会员或折现
━━━━━━━━━━━━━━
🛡 由红星公共群担保支持
🔗 红星群：https://t.me/+j6LNmLkLlvg1YTA1
📢 官方频道：https://t.me/liuLiuid`,

  energy: `⚡️ TRX能量 / TG会员代购


━━━━━━━━━━━━━━
🔋 TRX能量租用
转账 2.5 TRX 到指定地址
即可免费转一次 USDT（省手续费）


━━━━━━━━━━━━━━
✈️ Telegram 会员价格


3个月 → 15 USDT
6个月 → 20 USDT
12个月 → 35 USDT


━━━━━━━━━━━━━━
点击下方按钮前往购买 👇`,
};

let TEXT = { ...DEFAULT_TEXT };

async function loadText(env) {
  try {
    const raw = await env.BOT_KV.get("text");
    if (raw) TEXT = { ...DEFAULT_TEXT, ...JSON.parse(raw) };
  } catch {}
}

// ================================================================
// HTTP 工具
// ================================================================
async function tgPost(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function sendMsg(chatId, text, keyboard = null) {
  const body = { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (keyboard) body.reply_markup = keyboard;
  return tgPost("sendMessage", body);
}
async function sendPhoto(chatId, fileId, caption = "", keyboard = null) {
  const body = { chat_id: chatId, photo: fileId, caption, parse_mode: "HTML" };
  if (keyboard) body.reply_markup = keyboard;
  return tgPost("sendPhoto", body);
}
async function sendDocument(chatId, filename, csvContent, caption = "") {
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const encoder  = new TextEncoder();
  const body = [
    `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${filename}"\r\nContent-Type: text/csv\r\n\r\n${csvContent}`,
    `--${boundary}--`,
  ].join("\r\n");
  const res = await fetch(`${API}/sendDocument`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: encoder.encode(body),
  });
  return res.json();
}
async function answerCb(id) {
  return tgPost("answerCallbackQuery", { callback_query_id: id });
}

// ================================================================
// KV 工具
// ================================================================
async function getState(chatId, env) {
  const raw = await env.BOT_KV.get(`state_${chatId}`);
  return raw ? JSON.parse(raw) : null;
}
async function setState(chatId, state, env) {
  await env.BOT_KV.put(`state_${chatId}`, JSON.stringify(state), { expirationTtl: 86400 });
}
async function clearState(chatId, env) {
  await env.BOT_KV.delete(`state_${chatId}`);
}
async function saveApply(chatId, data, env) {
  await env.BOT_KV.put(`apply_${chatId}`, JSON.stringify(data), { expirationTtl: 31536000 });
}
async function getApply(chatId, env) {
  const raw = await env.BOT_KV.get(`apply_${chatId}`);
  return raw ? JSON.parse(raw) : null;
}
async function getLoan(userId, env) {
  const raw = await env.BOT_KV.get(`loan_${userId}`);
  return raw ? JSON.parse(raw) : null;
}
async function saveLoan(userId, data, env) {
  await env.BOT_KV.put(`loan_${userId}`, JSON.stringify(data), { expirationTtl: 31536000 });
}
async function addLoanUser(userId, env) {
  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  if (!users.includes(String(userId))) {
    users.push(String(userId));
    await env.BOT_KV.put("loan_users", JSON.stringify(users));
  }
}
async function getStats(env) {
  const raw = await env.BOT_KV.get("stats");
  return raw ? JSON.parse(raw) : { visitors: 0, applied: 0, approved: 0, total_amount: 0 };
}
async function saveStats(stats, env) {
  await env.BOT_KV.put("stats", JSON.stringify(stats));
}
async function addUser(chatId, env) {
  const raw   = await env.BOT_KV.get("all_users");
  const users = raw ? JSON.parse(raw) : [];
  if (!users.includes(String(chatId))) {
    users.push(String(chatId));
    await env.BOT_KV.put("all_users", JSON.stringify(users));
  }
}
async function getAllUsers(env) {
  const raw = await env.BOT_KV.get("all_users");
  return raw ? JSON.parse(raw) : [];
}

// 保存用户信息（名字/用户名），每次发消息时更新
async function saveUserInfo(chatId, from, env) {
  const info = {
    first_name: from.first_name || "",
    last_name:  from.last_name  || "",
    username:   from.username   || "",
    updatedAt:  getToday(),
  };
  await env.BOT_KV.put(`userinfo_${chatId}`, JSON.stringify(info));
}
async function getUserInfo(chatId, env) {
  const raw = await env.BOT_KV.get(`userinfo_${chatId}`);
  return raw ? JSON.parse(raw) : null;
}

// ================================================================
// 工具函数
// ================================================================
function getNow() {
  const d = new Date(Date.now() + 7 * 3600000);
  return d.toISOString().replace("T", " ").substring(0, 16) + " (GMT+7)";
}
function getToday() {
  return new Date(Date.now() + 7 * 3600000).toISOString().substring(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().substring(0, 10);
}
function diffDays(dateStr) {
  const today = new Date(getToday() + "T00:00:00Z");
  const end   = new Date(dateStr   + "T00:00:00Z");
  return Math.floor((today - end) / 86400000);
}
function isAdmin(userId) {
  return CONFIG.ADMIN_IDS.includes(String(userId));
}
async function sendLong(chatId, msg) {
  while (msg.length > 0) {
    await sendMsg(chatId, msg.slice(0, 4000));
    msg = msg.slice(4000);
  }
}
function escCsv(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseUnit(str) {
  const s = (str || "").toUpperCase();
  if (s === "U" || s === "USDT") return "USDT";
  if (s === "R" || s === "RMB")  return "RMB";
  return null;
}

// ================================================================
// 主菜单
// ================================================================
async function sendMainMenu(chatId) {
  return sendMsg(chatId, TEXT.welcome, {
    inline_keyboard: [
      [
        { text: "📋 贷款说明",        callback_data: "menu_loaninfo"   },
        { text: "📊 申请额度",        callback_data: "menu_apply"      },
        { text: "⏰ 还款",            callback_data: "menu_repay"      },
      ],
      [
        { text: "🚩 推广有礼",        callback_data: "menu_promote"    },
        { text: "👤 在线客服",        url: CONFIG.CUSTOMER_SERVICE     },
      ],
      [
        { text: "📢 下款频道",        url: CONFIG.CHANNEL_LINK         },
        { text: "⚡️ TRX能量/TG会员", callback_data: "menu_energy"     },
      ],
    ],
  });
}

// ================================================================
// 转发函数
// ================================================================
async function forwardApply(chatId, data, userId) {
  const caption =
    `🔔 新申请\n📊 ID贷款申请\n\n` +
    `👤 用户ID：<code>${userId}</code>\n` +
    `📲 型号：${data.model  || "-"}\n` +
    `📍 地区：${data.region || "-"}\n` +
    `🕐 时间：${data.time}\n\n` +
    `✅ 批准指令：<code>/ok ${userId} 本金 单位 利息 天数</code>\n` +
    `例：<code>/ok ${userId} 300 R 50 7</code>`;
  for (const target of CONFIG.FORWARD_TARGETS) {
    await sendMsg(target, caption);
    for (const key of ["shot1", "shot2", "shot3", "shot4"]) {
      if (data[key]) await sendPhoto(target, data[key]);
    }
  }
}

async function forwardRepay(chatId, data) {
  const caption =
    `💳 还款申请\n\n` +
    `👤 用户ID：<code>${chatId}</code>\n` +
    `💰 金额：${data.amount}\n` +
    `🍎 Apple ID：${data.appleid}\n` +
    `🕐 时间：${getNow()}`;
  for (const target of CONFIG.FORWARD_TARGETS) {
    await sendMsg(target, caption);
    if (data.shot) await sendPhoto(target, data.shot, `还款截图 - 用户 ${chatId}`);
  }
}

// ================================================================
// 回调处理
// ================================================================
async function handleCallback(cb, env) {
  const chatId = cb.message.chat.id;
  const data   = cb.data;
  await answerCb(cb.id);

  if (data === "menu_loaninfo") return sendMsg(chatId, TEXT.loan_info);

  if (data === "menu_apply") {
    const existing = await getApply(chatId, env);
    if (existing && !existing.approved) return sendMsg(chatId, TEXT.duplicate_apply);
    await sendMsg(chatId, TEXT.loan_info);
    return sendMsg(chatId, TEXT.agree_prompt, {
      inline_keyboard: [[{ text: "✅ 我已阅读并同意，开始申请", callback_data: "apply_start" }]],
    });
  }

  if (data === "apply_start") {
    await setState(chatId, { step: "apply_model", type: "man" }, env);
    return sendMsg(chatId, "📋 申请额度\n\n第 1 步\n\n请输入您的<b>手机型号</b>（如：iPhone 14 Pro）：");
  }

  if (data === "apply_stage2_normal") {
    const state = await getState(chatId, env);
    if (!state || state.step !== "apply_stage2") return sendMainMenu(chatId);
    await setState(chatId, { ...state, step: "apply_region" }, env);
    return sendMsg(chatId, `✅ 型号已记录\n\n第 2 步\n\n请输入您<b>现在所在地区</b>（国内/海外）：`);
  }

  if (data === "apply_stage2_installment") {
    await clearState(chatId, env);
    return sendMsg(chatId,
      `❌ 很抱歉，分期未结清的设备暂不符合申请条件。\n\n如有疑问，请联系在线客服：\n${CONFIG.CUSTOMER_SERVICE}`
    );
  }

  if (data === "menu_repay") {
    return sendMsg(chatId, TEXT.repay_info, {
      inline_keyboard: [
        [
          { text: "💰 结清还款", callback_data: "repay_clear" },
          { text: "🔄 续期申请", callback_data: "repay_renew" },
        ],
        [{ text: "👤 联系客服", url: CONFIG.CUSTOMER_SERVICE }],
      ],
    });
  }

  if (data === "repay_clear") {
    const addressText =
      `💳 还款地址\n\n` +
      `① USDT 收款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
      `② 微信 / 支付宝：请先联系客服确认再付款\n\n` +
      `付款完成后点击【已付款】上传凭证 👇`;
    const keyboard = {
      inline_keyboard: [[{ text: "✅ 已付款，上传凭证", callback_data: "repay_upload" }]],
    };
    if (CONFIG.QR_FILE_ID)   await sendPhoto(chatId, CONFIG.QR_FILE_ID,   "① USDT 收款码");
    if (CONFIG.QR_FILE_ID_2) await sendPhoto(chatId, CONFIG.QR_FILE_ID_2, "② 微信/支付宝 收款码");
    return sendMsg(chatId, addressText, keyboard);
  }

  if (data === "repay_upload") {
    await setState(chatId, { step: "repay_screenshot" }, env);
    return sendMsg(chatId, "💳 还款凭证\n\n请上传<b>还款截图</b>（转账记录）：");
  }

  if (data === "repay_renew") {
    return sendMsg(chatId, `🔄 续期申请\n\n请直接联系客服办理续期：\n${CONFIG.CUSTOMER_SERVICE}`);
  }

  if (data === "menu_promote") return sendMsg(chatId, TEXT.promote);

  if (data === "menu_energy") {
    return sendMsg(chatId, TEXT.energy, {
      inline_keyboard: [[{ text: "⚡️ 前往购买", url: CONFIG.ENERGY_BOT }]],
    });
  }
}

// ================================================================
// 消息处理（状态机）
// ================================================================
async function handleMessage(msg, env) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text   = msg.text  || "";
  const photo  = msg.photo || null;

  await addUser(chatId, env);
  await saveUserInfo(chatId, msg.from, env);

  const stats = await getStats(env);
  stats.visitors = (stats.visitors || 0) + 1;
  await saveStats(stats, env);

  if (text === "/start") {
    await clearState(chatId, env);
    return sendMainMenu(chatId);
  }

  if (isAdmin(userId)) {
    if (text === "/cid" || text.startsWith("/cid ")) return cmdCid(chatId, text, env);
    if (text === "/cyq")                              return cmdStats(chatId, env);
    if (text.startsWith("/ok"))                       return cmdApprove(chatId, text, env);
    if (text.startsWith("/xq"))                       return cmdRenew(chatId, text, env);
    if (text.startsWith("/nb"))                       return cmdRepaid(chatId, text, env);
    if (text.startsWith("/pause"))                    return cmdPause(chatId, text, env);
    if (text.startsWith("/getuser"))                  return cmdGetUser(chatId, text, env);
    if (text === "/loanlist")                         return cmdLoanList(chatId, env);
    if (text === "/export")                           return cmdExport(chatId, env);
    if (text.startsWith("/setconfig "))               return cmdSetConfig(chatId, text.slice(10), env);
    if (text.startsWith("/settext "))                 return cmdSetText(chatId, text.slice(9), env);
    if (text.startsWith("/broadcast "))               return cmdBroadcast(chatId, text.slice(11), env);
    if (text === "/getconfig")                        return cmdGetConfig(chatId, env);
    if (text === "/liuliu")                           return cmdLiuliu(chatId);
    if (text === "/ql000000")                         return cmdClearAll(chatId, env);
  }

  const state = await getState(chatId, env);
  if (!state) return sendMainMenu(chatId);
  const step = state.step;

  if (step === "apply_model") {
    if (!text.trim()) return sendMsg(chatId, "⚠️ 请输入手机型号");
    await setState(chatId, { ...state, step: "apply_stage2", model: text.trim() }, env);
    return sendMsg(chatId,
      "📋 申请额度\n\n补充问题：\n\n这台手机是<b>全款</b>还是<b>分期</b>中的设备？",
      {
        inline_keyboard: [[
          { text: "✅ 全款", callback_data: "apply_stage2_normal"      },
          { text: "❌ 分期", callback_data: "apply_stage2_installment" },
        ]],
      }
    );
  }

  if (step === "apply_stage2") {
    return sendMsg(chatId,
      "⚠️ 请点击上方按钮选择全款/分期👆",
      {
        inline_keyboard: [[
          { text: "✅ 全款", callback_data: "apply_stage2_normal"      },
          { text: "❌ 分期", callback_data: "apply_stage2_installment" },
        ]],
      }
    );
  }

  if (step === "apply_region") {
    if (!text.trim()) return sendMsg(chatId, "⚠️ 请输入所在地区");
    await setState(chatId, { ...state, step: "apply_shot1", region: text.trim() }, env);
    return sendMsg(chatId, `✅ 地区已记录\n\n第 3 步（截图 1/4）\n\n请上传手机<b>设置主页</b>截图：\n\n（如果您在此步感到困惑，请直接联系<a href="https://t.me/liuliuidid_bot">@liuliuidid_bot</a>，您的贷款专员）`);
  }
  if (step === "apply_shot1") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送截图（图片）");
    const fid = photo[photo.length - 1].file_id;
    await setState(chatId, { ...state, step: "apply_shot2", shot1: fid }, env);
    return sendMsg(chatId, "✅ 已收到（1/4）\n\n第 4 步（截图 2/4）\n\n请上传<b>关于本机</b>截图：\n\n（如果您在此步感到困惑，请直接联系<a href=\"https://t.me/liuliuidid_bot\">@liuliuidid_bot</a>，您的贷款专员）");
  }
  if (step === "apply_shot2") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送截图（图片）");
    const fid = photo[photo.length - 1].file_id;
    await setState(chatId, { ...state, step: "apply_shot3", shot2: fid }, env);
    return sendMsg(chatId, "✅ 已收到（2/4）\n\n第 5 步（截图 3/4）\n\n请上传<b>蜂窝网络</b>底部截图：\n\n（如果您在此步感到困惑，请直接联系<a href=\"https://t.me/liuliuidid_bot\">@liuliuidid_bot</a>，您的贷款专员）");
  }
  if (step === "apply_shot3") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送截图（图片）");
    const fid = photo[photo.length - 1].file_id;
    await setState(chatId, { ...state, step: "apply_shot4", shot3: fid }, env);
    return sendMsg(chatId, "✅ 已收到（3/4）\n\n第 6 步（截图 4/4）\n\n请上传<b>电池用量过去10天</b>截图：\n\n（如果您在此步感到困惑，请直接联系<a href=\"https://t.me/liuliuidid_bot\">@liuliuidid_bot</a>，您的贷款专员）");
  }
  if (step === "apply_shot4") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送截图（图片）");
    const fid   = photo[photo.length - 1].file_id;
    const final = { ...state, shot4: fid, applied: true, approved: false, time: getNow() };
    await clearState(chatId, env);
    await saveApply(chatId, final, env);
    const s = await getStats(env);
    s.applied = (s.applied || 0) + 1;
    await saveStats(s, env);
    await forwardApply(chatId, final, userId);
    return sendMsg(chatId, `🎉 申请提交成功！\n\n资料已提交，专员将尽快与您联系。\n如有疑问请联系：${CONFIG.CUSTOMER_SERVICE}`);
  }

  if (step === "repay_screenshot") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送还款截图（图片）");
    const fid = photo[photo.length - 1].file_id;
    await setState(chatId, { ...state, step: "repay_amount", shot: fid }, env);
    return sendMsg(chatId, "✅ 截图已收到\n\n请输入<b>还款金额</b>（支持：350 / 50U / 50 USDT / 350 RMB）：");
  }
  if (step === "repay_amount") {
    const val = text.trim();
    if (!val) return sendMsg(chatId, "⚠️ 请输入还款金额（如：350、50U、50 USDT、350 RMB）");
    await setState(chatId, { ...state, step: "repay_appleid", amount: val }, env);
    return sendMsg(chatId, `✅ 金额：${val}\n\n请输入您的 <b>Apple ID</b>（邮箱格式）：`);
  }
  if (step === "repay_appleid") {
    const final = { ...state, appleid: text.trim() };
    await clearState(chatId, env);
    await forwardRepay(chatId, final);
    return sendMsg(chatId,
      `✅ 还款信息已提交！\n\n💰 金额：${final.amount}\n🍎 Apple ID：${text.trim()}\n\n客服将在30分钟内确认\n${CONFIG.CUSTOMER_SERVICE}`
    );
  }

  return sendMainMenu(chatId);
}

// ================================================================
// 管理员指令
// ================================================================

async function cmdCid(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length === 1) {
    return sendMsg(chatId,
      `🪪 您的 Telegram 用户ID\n\n` +
      `<code>${chatId}</code>\n\n` +
      `直接点击上方数字即可复制`
    );
  }
  const keyword = parts.slice(1).join(" ").toLowerCase();
  const rawLoan = await env.BOT_KV.get("loan_users");
  const loanUsers = rawLoan ? JSON.parse(rawLoan) : [];
  const allUsers  = await getAllUsers(env);
  const allIds    = [...new Set([...loanUsers, ...allUsers])];

  const results = [];
  for (const uid of allIds) {
    const apply    = await getApply(uid, env);
    const userinfo = await getUserInfo(uid, env);
    const model     = (apply?.model      || "").toLowerCase();
    const region    = (apply?.region     || "").toLowerCase();
    const firstName = (userinfo?.first_name || "").toLowerCase();
    const lastName  = (userinfo?.last_name  || "").toLowerCase();
    const username  = (userinfo?.username   || "").toLowerCase();
    const fullName  = `${firstName} ${lastName}`.trim();

    if (
      uid.includes(keyword) ||
      model.includes(keyword) ||
      region.includes(keyword) ||
      firstName.includes(keyword) ||
      lastName.includes(keyword) ||
      username.includes(keyword)
    ) {
      const nameTag = userinfo
        ? ` | ${fullName || "-"}${userinfo.username ? " (@" + userinfo.username + ")" : ""}`
        : "";
      results.push(`ID: <code>${uid}</code>${nameTag}  型号:${apply?.model||"-"}  地区:${apply?.region||"-"}`);
    }
  }

  if (results.length === 0) return sendMsg(chatId, `❌ 未找到匹配 "${keyword}" 的用户\n\n可按用户ID片段、姓名、用户名、手机型号、地区搜索`);
  return sendLong(chatId, `🔍 查询结果（关键词：${keyword}）共 ${results.length} 条\n\n` + results.join("\n"));
}


async function cmdApprove(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 6) {
    return sendMsg(chatId,
      "❌ 格式：/ok 用户ID 本金 单位 利息 天数\n\n" +
      "单位：R 或 RMB = 人民币，U 或 USDT = USDT\n\n" +
      "示例：\n" +
      "<code>/ok 123456789 300 R 50 7</code>  → 人民币 本金300 利息50 7天 应还350\n" +
      "<code>/ok 123456789 300 U 50 7</code>  → USDT 本金300 利息50 7天 应还350"
    );
  }

  const targetId = parts[1];
  const amount   = parseFloat(parts[2]);
  const unit     = parseUnit(parts[3]);
  const interest = parseFloat(parts[4]);
  const loanDays = parseInt(parts[5]);

  if (isNaN(amount) || amount <= 0)  return sendMsg(chatId, "❌ 本金格式错误，请输入正数");
  if (!unit)                          return sendMsg(chatId, "❌ 单位格式错误，请输入 R（人民币）或 U（USDT）");
  if (isNaN(interest) || interest < 0) return sendMsg(chatId, "❌ 利息格式错误，请输入非负数");
  if (isNaN(loanDays) || loanDays <= 0) return sendMsg(chatId, "❌ 天数格式错误，请输入正整数");

  const unitLabel = unit === "USDT" ? "U" : "¥";
  const decimals  = unit === "USDT" ? 2 : 0;
  const repayAmt  = (amount + interest).toFixed(decimals);
  const today     = getToday();
  const endDate   = addDays(today, loanDays);

  const info = await getApply(targetId, env);
  await saveApply(targetId, { ...(info || {}), approved: true, amount, unit, approvedTime: getNow() }, env);
  await saveLoan(targetId, {
    userId:       targetId,
    amount,
    unit,
    interest,
    repay_amount: repayAmt,
    start_date:   today,
    end_date:     endDate,
    loan_days:    loanDays,
    status:       "active",
    reminded:     false,
    overdue_days: 0,
    renewCount:   0,
    totalInterestCollected: 0,
    pause_until:  null,
  }, env);
  await addLoanUser(targetId, env);

  const s = await getStats(env);
  s.approved     = (s.approved     || 0) + 1;
  s.total_amount = (s.total_amount || 0) + amount;
  await saveStats(s, env);

  await sendMsg(targetId,
    `🎉 恭喜！您的申请已通过审核！\n\n` +
    `💰 借款金额：<b>${unitLabel}${amount}</b>\n` +
    `💵 利息：<b>${unitLabel}${interest}</b>\n` +
    `📅 贷款天数：<b>${loanDays} 天</b>\n` +
    `📅 还款截止：<b>${endDate}</b>\n` +
    `💳 到期应还：<b>${unitLabel}${repayAmt}</b>\n\n` +
    `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
    `如有疑问请联系：${CONFIG.CUSTOMER_SERVICE}`
  );

  return sendMsg(chatId,
    `✅ 批准成功\n\n` +
    `用户：${targetId}\n` +
    `借款：${unitLabel}${amount} (${unit})\n` +
    `利息：${unitLabel}${interest}\n` +
    `天数：${loanDays} 天\n` +
    `应还：${unitLabel}${repayAmt}\n` +
    `到期：${endDate}`
  );
}


async function cmdRenew(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 5) {
    return sendMsg(chatId,
      "❌ 格式：/xq 用户ID 已还利息 续期天数 下期利息\n\n" +
      "计算逻辑：\n" +
      "• 新应还 = (上期应还 - 已还利息) + 下期利息\n\n" +
      "示例：\n" +
      "<code>/xq 123456789 50 7 30</code>\n" +
      "→ 上期应还350，已还50，续7天，下期利息30\n" +
      "→ 新应还 = (350-50)+30 = 330"
    );
  }

  const targetId      = parts[1];
  const paidInterest  = parseFloat(parts[2]);
  const days          = parseInt(parts[3]);
  const nextInterest  = parseFloat(parts[4]);

  if (isNaN(paidInterest) || paidInterest < 0) return sendMsg(chatId, "❌ 已还利息格式错误");
  if (isNaN(days) || days <= 0)                return sendMsg(chatId, "❌ 续期天数格式错误");
  if (isNaN(nextInterest) || nextInterest < 0) return sendMsg(chatId, "❌ 下期利息格式错误");

  const loan = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);

  const unit      = loan.unit || "RMB";
  const unitLabel = unit === "USDT" ? "U" : "¥";
  const decimals  = unit === "USDT" ? 2 : 0;

  const prevRepay  = parseFloat(loan.repay_amount);
  const newRepay   = (prevRepay - paidInterest + nextInterest).toFixed(decimals);
  const newEndDate = addDays(getToday(), days);
  const renewCount = (loan.renewCount || 0) + 1;
  const totalInterestCollected = (parseFloat(loan.totalInterestCollected) || 0) + paidInterest;

  await saveLoan(targetId, {
    ...loan,
    end_date:     newEndDate,
    repay_amount: newRepay,
    status:       "active",
    reminded:     false,
    overdue_days: 0,
    renewCount,
    renewedAt:    getNow(),
    pause_until:  null,
    totalInterestCollected,
    lastRenewPaid:     paidInterest,
    lastRenewInterest: nextInterest,
  }, env);

  await sendMsg(targetId,
    `🔄 续期成功！\n\n` +
    `📅 新截止日期：<b>${newEndDate}</b>（${days} 天）\n` +
    `💳 新周期应还：<b>${unitLabel}${newRepay}</b>\n\n` +
    `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
    `如有疑问请联系：${CONFIG.CUSTOMER_SERVICE}`
  );

  return sendMsg(chatId,
    `✅ 续期成功\n\n` +
    `用户：${targetId}\n` +
    `上期应还：${unitLabel}${prevRepay.toFixed(decimals)}\n` +
    `本次已还：${unitLabel}${paidInterest}\n` +
    `续期天数：${days} 天\n` +
    `下期利息：${unitLabel}${nextInterest}\n` +
    `新应还：${unitLabel}${newRepay}\n` +
    `新到期：${newEndDate}\n` +
    `累计续期：${renewCount} 次\n` +
    `累计已收利息：${unitLabel}${totalInterestCollected.toFixed(decimals)}`
  );
}


async function cmdRepaid(chatId, text, env) {
  const parts    = text.trim().split(/\s+/);
  if (parts.length < 2) return sendMsg(chatId, "❌ 格式：/nb 用户ID\n例：/nb 123456789");
  const targetId = parts[1];
  const loan     = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);

  const unit      = loan.unit || "RMB";
  const unitLabel = unit === "USDT" ? "U" : "¥";

  await saveLoan(targetId, { ...loan, status: "repaid", repaidAt: getNow() }, env);

  await sendMsg(targetId,
    `✅ 您的还款已确认！\n\n` +
    `💰 还款金额：${unitLabel}${loan.repay_amount}\n\n` +
    `很荣幸你选择了六六和您共度难关，很荣幸这次为您提供了服务，如果将来或者朋友还有需要请记得六六永远都在，但我们更希望您将来顺风顺水，一路6666！🍀`
  );

  return sendMsg(chatId, `✅ 已标记用户 ${targetId} 还款完成`);
}


async function cmdPause(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return sendMsg(chatId,
    "❌ 格式：/pause 用户ID 天数\n" +
    "例：/pause 123456789 2\n" +
    "效果：暂停该用户催款通知2天\n\n" +
    "取消暂停：/pause 用户ID 0"
  );
  const targetId = parts[1];
  const days     = parseInt(parts[2]);
  const loan     = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);

  if (days <= 0) {
    await saveLoan(targetId, { ...loan, pause_until: null }, env);
    return sendMsg(chatId, `✅ 已取消用户 ${targetId} 的催款暂停，恢复正常催款`);
  }

  const pauseUntil = addDays(getToday(), days);
  await saveLoan(targetId, { ...loan, pause_until: pauseUntil }, env);
  return sendMsg(chatId,
    `⏸ 已暂停用户 ${targetId} 的催款通知\n\n` +
    `📅 暂停至：<b>${pauseUntil}</b>（共 ${days} 天）\n` +
    `恢复后将自动继续催款\n\n` +
    `提前取消：/pause ${targetId} 0`
  );
}


async function cmdGetUser(chatId, text, env) {
  const parts    = text.trim().split(/\s+/);
  if (parts.length < 2) return sendMsg(chatId, "❌ 格式：/getuser 用户ID\n例：/getuser 123456789");
  const targetId = parts[1];
  const apply    = await getApply(targetId, env);
  const loan     = await getLoan(targetId, env);
  const userinfo = await getUserInfo(targetId, env);

  if (!apply && !loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的任何记录`);

  const statusMap = { active: "还款中 🟢", repaid: "已还清 ✅", overdue: "逾期 🚨", renewed: "已续期 🔄" };
  let info = `👤 用户详情\n${"─".repeat(20)}\n`;
  info += `ID：<code>${targetId}</code>\n`;

  if (userinfo) {
    const fullName = [userinfo.first_name, userinfo.last_name].filter(Boolean).join(" ");
    if (fullName)          info += `姓名：${fullName}\n`;
    if (userinfo.username) info += `用户名：@${userinfo.username}\n`;
  }

  if (apply) {
    info += `\n📋 申请信息\n`;
    info += `型号：${apply.model  || "-"}\n`;
    info += `地区：${apply.region || "-"}\n`;
    info += `申请时间：${apply.time || "-"}\n`;
  }

  if (loan) {
    const unit      = loan.unit || "RMB";
    const unitLabel = unit === "USDT" ? "U" : "¥";
    const rate      = CONFIG.DAILY_RATE || 0.1;
    const diff      = diffDays(loan.end_date);
    const overdueFee = diff > 0
      ? (parseFloat(loan.repay_amount) * rate * diff).toFixed(unit === "USDT" ? 2 : 0)
      : "0";
    const totalNow = diff > 0
      ? (parseFloat(loan.repay_amount) + parseFloat(overdueFee)).toFixed(unit === "USDT" ? 2 : 0)
      : loan.repay_amount;

    info += `\n💰 贷款信息\n`;
    info += `状态：${statusMap[loan.status] || loan.status}\n`;
    info += `借款：${unitLabel}${loan.amount} (${unit})\n`;
    info += `利息：${unitLabel}${loan.interest || "-"}\n`;
    info += `贷款天数：${loan.loan_days || "-"} 天\n`;
    info += `应还：${unitLabel}${loan.repay_amount}\n`;
    info += `开始：${loan.start_date}\n`;
    info += `到期：${loan.end_date}\n`;
    info += `续期：${loan.renewCount || 0} 次\n`;
    if ((loan.totalInterestCollected || 0) > 0) {
      info += `累计已收利息：${unitLabel}${parseFloat(loan.totalInterestCollected).toFixed(unit === "USDT" ? 2 : 0)}\n`;
    }
    if (loan.pause_until && loan.pause_until >= getToday()) {
      info += `⏸ 催款暂停至：${loan.pause_until}\n`;
    }
    if (diff > 0) {
      info += `\n⚠️ 逾期 ${diff} 天\n`;
      info += `逾期费：${unitLabel}${overdueFee}\n`;
      info += `当前应还：${unitLabel}${totalNow}\n`;
    } else if (diff === 0) {
      info += `⏰ 今天到期！\n`;
    } else {
      info += `⏳ 距到期还剩 ${Math.abs(diff)} 天\n`;
    }
  }

  return sendMsg(chatId, info);
}


async function cmdLoanList(chatId, env) {
  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  if (users.length === 0) return sendMsg(chatId, "📋 暂无下款记录");

  const today  = getToday();
  const groups = { overdue: [], active: [], repaid: [] };

  let lentRMB = 0, lentUSDT = 0;
  let unpaidRMB = 0, unpaidUSDT = 0;
  let overdueRMB = 0, overdueUSDT = 0;

  for (const uid of users) {
    const loan  = await getLoan(uid, env);
    const apply = await getApply(uid, env);
    if (!loan) continue;

    const unit      = loan.unit || "RMB";
    const unitLabel = unit === "USDT" ? "U" : "¥";
    const rate      = CONFIG.DAILY_RATE || 0.1;
    const name      = apply?.model || "未知";
    const diff      = diffDays(loan.end_date);
    const renewCount = loan.renewCount || 0;
    const paused    = loan.pause_until && loan.pause_until >= today;

    if (unit === "RMB")  lentRMB  += parseFloat(loan.amount) || 0;
    if (unit === "USDT") lentUSDT += parseFloat(loan.amount) || 0;

    const pauseTag = paused ? ` ⏸暂停至${loan.pause_until}` : "";
    const base =
      `👤 <code>${uid}</code>  ${name}${pauseTag}\n` +
      `💰 借：${unitLabel}${loan.amount}  应还：${unitLabel}${loan.repay_amount}  天数：${loan.loan_days||"-"}天  续期：${renewCount}次\n` +
      `📅 到期：${loan.end_date}\n`;

    if (loan.status === "repaid") {
      groups.repaid.push(base + `✅ 已还清  ${loan.repaidAt || ""}`);
    } else if (diff > 0) {
      const fee   = (parseFloat(loan.repay_amount) * rate * diff).toFixed(unit === "USDT" ? 2 : 0);
      const total = (parseFloat(loan.repay_amount) + parseFloat(fee)).toFixed(unit === "USDT" ? 2 : 0);
      if (unit === "RMB")  { unpaidRMB  += parseFloat(total); overdueRMB  += parseFloat(total); }
      if (unit === "USDT") { unpaidUSDT += parseFloat(total); overdueUSDT += parseFloat(total); }
      groups.overdue.push(
        base +
        `🚨 逾期 ${diff} 天  逾期费：${unitLabel}${fee}  当前应还：${unitLabel}${total}\n` +
        `👉 /nb ${uid}  |  /xq ${uid} 已还息 续期天 下期息  |  /pause ${uid} 天数`
      );
    } else {
      if (unit === "RMB")  unpaidRMB  += parseFloat(loan.repay_amount);
      if (unit === "USDT") unpaidUSDT += parseFloat(loan.repay_amount);
      const left = diff === 0 ? "⚠️ 今天到期" : `还剩 ${Math.abs(diff)} 天`;
      groups.active.push(
        base +
        `⏳ ${left}\n` +
        `👉 /nb ${uid}  |  /xq ${uid} 已还息 续期天 下期息  |  /pause ${uid} 天数`
      );
    }
  }

  const s = await getStats(env);
  let msg =
    `📊 下款用户总览\n${"━".repeat(18)}\n` +
    `👥 总人数：${users.length} 人\n` +
    `\n💸 累计放款\n` +
    `  人民币：¥${lentRMB.toLocaleString()}\n` +
    `  USDT：${lentUSDT.toFixed(2)} U\n` +
    `\n📥 待回收\n` +
    `  人民币：¥${unpaidRMB.toLocaleString()}\n` +
    `  USDT：${unpaidUSDT.toFixed(2)} U\n` +
    `\n🚨 逾期应收\n` +
    `  人民币：¥${overdueRMB.toLocaleString()}\n` +
    `  USDT：${overdueUSDT.toFixed(2)} U\n` +
    `\n✅ 已通过：${s.approved || 0} 人\n` +
    `\n📎 导出明细：/export\n`;

  if (groups.overdue.length > 0) {
    msg += `\n🚨 逾期（${groups.overdue.length}人）\n${"─".repeat(18)}\n`;
    msg += groups.overdue.join("\n\n") + "\n";
  }
  if (groups.active.length > 0) {
    msg += `\n🟢 还款中（${groups.active.length}人）\n${"─".repeat(18)}\n`;
    msg += groups.active.join("\n\n") + "\n";
  }
  if (groups.repaid.length > 0) {
    msg += `\n✅ 已还清（${groups.repaid.length}人）\n${"─".repeat(18)}\n`;
    msg += groups.repaid.join("\n\n") + "\n";
  }

  return sendLong(chatId, msg);
}


async function cmdExport(chatId, env) {
  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  if (users.length === 0) return sendMsg(chatId, "📋 暂无下款记录，无法导出");

  const header = ["用户ID","姓名","用户名","型号","地区","单位","借款金额","利息","应还金额","天数","开始日期","到期日期","状态","逾期天数","续期次数","累计已收利息","还款时间","申请时间"];
  const rows   = [header.map(escCsv).join(",")];

  for (const uid of users) {
    const loan     = await getLoan(uid, env);
    const apply    = await getApply(uid, env);
    const userinfo = await getUserInfo(uid, env);
    if (!loan) continue;

    const diff        = diffDays(loan.end_date);
    const overdueDays = loan.status !== "repaid" && diff > 0 ? diff : 0;
    const fullName    = userinfo ? [userinfo.first_name, userinfo.last_name].filter(Boolean).join(" ") : "";

    const row = [
      uid,
      fullName,
      userinfo?.username || "",
      apply?.model  || "",
      apply?.region || "",
      loan.unit     || "RMB",
      loan.amount   || "",
      loan.interest || "",
      loan.repay_amount || "",
      loan.loan_days || "",
      loan.start_date || "",
      loan.end_date   || "",
      loan.status     || "",
      overdueDays,
      loan.renewCount || 0,
      loan.totalInterestCollected || 0,
      loan.repaidAt   || "",
      apply?.time     || "",
    ];
    rows.push(row.map(escCsv).join(","));
  }

  const csv      = "\uFEFF" + rows.join("\r\n");
  const filename = `loanlist_${getToday()}.csv`;
  const res = await sendDocument(chatId, filename, csv, `📎 下款明细导出 ${getToday()}，共 ${users.length} 条`);

  if (!res.ok) {
    await sendMsg(chatId, "⚠️ 文件发送失败，请稍后重试");
  }
}


async function cmdStats(chatId, env) {
  const s = await getStats(env);

  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  let overdueRMB = 0, overdueUSDT = 0;

  for (const uid of users) {
    const loan = await getLoan(uid, env);
    if (!loan || loan.status === "repaid") continue;
    const diff = diffDays(loan.end_date);
    if (diff > 0) {
      const rate  = CONFIG.DAILY_RATE || 0.1;
      const fee   = parseFloat(loan.repay_amount) * rate * diff;
      const total = parseFloat(loan.repay_amount) + fee;
      if ((loan.unit || "RMB") === "RMB") overdueRMB  += total;
      else                                 overdueUSDT += total;
    }
  }

  return sendMsg(chatId,
    `📊 数据统计\n${"─".repeat(16)}\n` +
    `👣 累计访问：${s.visitors     || 0} 次\n` +
    `📝 申请总数：${s.applied      || 0} 人\n` +
    `✅ 审核通过：${s.approved     || 0} 人\n` +
    `💰 总放款额：¥${(s.total_amount || 0).toLocaleString()}\n` +
    `\n🚨 当前逾期应收\n` +
    `  人民币：¥${overdueRMB.toFixed(0)}\n` +
    `  USDT：${overdueUSDT.toFixed(2)} U`
  );
}


async function cmdSetConfig(chatId, json, env) {
  try {
    const update = JSON.parse(json);
    const raw    = await env.BOT_KV.get("config");
    const old    = raw ? JSON.parse(raw) : {};
    const merged = { ...old, ...update };
    await env.BOT_KV.put("config", JSON.stringify(merged));
    CONFIG = { ...DEFAULT, ...merged };
    if (merged.FORWARD_TARGETS) CONFIG.FORWARD_TARGETS = merged.FORWARD_TARGETS;
    if (merged.ADMIN_IDS)       CONFIG.ADMIN_IDS       = merged.ADMIN_IDS;
    return sendMsg(chatId, `✅ 配置已更新，立即生效\n\n更新字段：${Object.keys(update).join(", ")}`);
  } catch (e) {
    return sendMsg(chatId, `❌ JSON格式错误：${e.message}`);
  }
}


async function cmdSetText(chatId, json, env) {
  try {
    const update = JSON.parse(json);
    const raw    = await env.BOT_KV.get("text");
    const old    = raw ? JSON.parse(raw) : {};
    const merged = { ...old, ...update };
    await env.BOT_KV.put("text", JSON.stringify(merged));
    TEXT = { ...DEFAULT_TEXT, ...merged };
    return sendMsg(chatId, `✅ 文案已更新，立即生效\n\n更新字段：${Object.keys(update).join(", ")}`);
  } catch (e) {
    return sendMsg(chatId, `❌ JSON格式错误：${e.message}`);
  }
}


async function cmdGetConfig(chatId, env) {
  const raw = await env.BOT_KV.get("config");
  const cfg = raw ? JSON.parse(raw) : {};
  return sendMsg(chatId,
    `📋 当前动态配置\n\n<code>${JSON.stringify(cfg, null, 2)}</code>\n\n` +
    `（未显示的字段表示使用代码默认值）`
  );
}


async function cmdBroadcast(chatId, content, env) {
  if (!content.trim()) return sendMsg(chatId, "❌ 用法：/broadcast 内容");
  const users = await getAllUsers(env);
  let sent = 0;
  for (const uid of users) {
    try { await sendMsg(uid, content); sent++; } catch {}
  }
  return sendMsg(chatId, `✅ 广播完成，成功发送 ${sent} / ${users.length} 人`);
}


async function cmdClearAll(chatId, env) {
  const rawLoan   = await env.BOT_KV.get("loan_users");
  const loanUsers = rawLoan ? JSON.parse(rawLoan) : [];
  const allUsers  = await getAllUsers(env);
  const allIds    = [...new Set([...loanUsers, ...allUsers])];

  for (const uid of allIds) {
    await env.BOT_KV.delete(`state_${uid}`);
    await env.BOT_KV.delete(`apply_${uid}`);
    await env.BOT_KV.delete(`loan_${uid}`);
    await env.BOT_KV.delete(`userinfo_${uid}`);
  }
  await env.BOT_KV.delete("loan_users");
  await env.BOT_KV.delete("all_users");
  await env.BOT_KV.delete("stats");

  return sendMsg(chatId,
    `🧹 清理完成\n\n已删除 ${allIds.length} 个用户的所有数据\n含：状态、申请记录、贷款记录、用户信息、统计数据\n\n⚠️ 此操作不可逆`
  );
}


async function cmdLiuliu(chatId) {
  return sendMsg(chatId,
    `👮 管理员指令手册\n${"═".repeat(20)}\n\n` +

    `📋 <b>贷款审批</b>\n` +
    `┌ /ok 用户ID 本金 单位 利息 天数\n` +
    `│ 单位：R=人民币  U=USDT\n` +
    `│ 应还 = 本金 + 利息\n` +
    `│ 例1：/ok 123456789 300 R 50 7\n` +
    `│      → 人民币 借300 利息50 7天 应还350\n` +
    `│ 例2：/ok 123456789 300 U 50 7\n` +
    `│      → USDT 借300 利息50 7天 应还350\n\n` +

    `├ /xq 用户ID 已还利息 续期天数 下期利息\n` +
    `│ 新应还 = (上期应还 - 已还利息) + 下期利息\n` +
    `│ 例：/xq 123456789 50 7 30\n` +
    `│      → 上期350，已还50，续7天，下期息30\n` +
    `│      → 新应还 = (350-50)+30 = 330\n\n` +

    `├ /nb 用户ID\n` +
    `│ 确认还款完成，发送结清通知给用户\n` +
    `│ 例：/nb 123456789\n\n` +

    `└ /pause 用户ID 天数\n` +
    `  暂停该用户的催款通知N天\n` +
    `  取消暂停：/pause 用户ID 0\n` +
    `  例：/pause 123456789 2\n\n` +

    `${"─".repeat(20)}\n` +
    `🔍 <b>查询 & 导出</b>\n` +
    `┌ /getuser 用户ID   查看申请+贷款+姓名详情\n` +
    `├ /loanlist         所有用户总览（含逾期金额统计）\n` +
    `├ /export           导出全部明细为 CSV 文件\n` +
    `└ /cyq              数据统计（含逾期应收金额）\n\n` +

    `${"─".repeat(20)}\n` +
    `🪪 <b>查询用户ID</b>\n` +
    `┌ /cid              查看自己的管理员ID\n` +
    `└ /cid 关键词       按ID片段/姓名/用户名/型号/地区搜索\n` +
    `  例：/cid 张三  /cid liuliu  /cid iPhone14\n\n` +

    `${"─".repeat(20)}\n` +
    `⚙️ <b>动态配置</b>\n` +
    `┌ /setconfig {"字段":"值"}\n` +
    `│ PAYMENT_ADDRESS / CUSTOMER_SERVICE / CHANNEL_LINK\n` +
    `│ LOAN_DAYS / DAILY_RATE / ADMIN_IDS / FORWARD_TARGETS\n` +
    `└ /getconfig  查看当前配置\n\n` +

    `${"─".repeat(20)}\n` +
    `✏️ <b>动态文案</b>\n` +
    `┌ /settext {"字段":"新内容"}\n` +
    `└ 字段：welcome / loan_info / repay_info / promote / energy\n\n` +

    `${"─".repeat(20)}\n` +
    `📢 <b>群发</b>\n` +
    `└ /broadcast 内容\n\n` +

    `${"─".repeat(20)}\n` +
    `🧹 <b>数据清理</b>\n` +
    `└ /ql000000  清除全部用户数据（⚠️不可逆）\n\n` +

    `/liuliu — 查看此帮助`
  );
}


// ================================================================
// 定时任务（每天自动催款）
// ================================================================
async function scheduledTask(env) {
  await loadConfig(env);
  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  const today = getToday();

  for (const uid of users) {
    try {
      const loan = await getLoan(uid, env);
      if (!loan || loan.status === "repaid") continue;

      if (loan.pause_until && loan.pause_until >= today) continue;

      const unit      = loan.unit || "RMB";
      const unitLabel = unit === "USDT" ? "U" : "¥";
      const rate      = CONFIG.DAILY_RATE || 0.1;
      const diff      = diffDays(loan.end_date);

      if (diff === -1 && !loan.reminded) {
        await sendMsg(uid,
          `⏰ 还款提醒\n\n` +
          `您的贷款将于<b>明天 ${loan.end_date}</b> 到期！\n\n` +
          `💳 应还金额：<b>${unitLabel}${loan.repay_amount}</b>\n\n` +
          `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
          `如需续期请提前联系：${CONFIG.CUSTOMER_SERVICE}`
        );
        await saveLoan(uid, { ...loan, reminded: true }, env);
      }

      if (diff === 0) {
        await sendMsg(uid,
          `🔴 今日到期！\n\n` +
          `您的贷款<b>今天 ${loan.end_date}</b> 到期！\n\n` +
          `💳 应还金额：<b>${unitLabel}${loan.repay_amount}</b>\n\n` +
          `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
          `如需续期请立即联系：${CONFIG.CUSTOMER_SERVICE}`
        );
      }

      if (diff > 0) {
        const overdueFee = (parseFloat(loan.repay_amount) * rate * diff).toFixed(unit === "USDT" ? 2 : 0);
        const totalOwed  = (parseFloat(loan.repay_amount) + parseFloat(overdueFee)).toFixed(unit === "USDT" ? 2 : 0);
        const dayHint = diff === 1
          ? `这是您逾期的<b>第 1 天</b>，请尽快还款！`
          : `您已连续逾期 <b>${diff} 天</b>，请立即处理！`;
        await sendMsg(uid,
          `🚨 逾期催收通知 · 第 ${diff} 天\n\n` +
          `${dayHint}\n\n` +
          `💰 原还款金额：${unitLabel}${loan.repay_amount}\n` +
          `📈 逾期费用：${unitLabel}${overdueFee}（日息 ${(rate*100).toFixed(1)}% × ${diff} 天）\n` +
          `💳 当前应还：<b>${unitLabel}${totalOwed}</b>\n\n` +
          `⚠️ 逾期将被锁机并抹除数据！\n` +
          `立即还款或续期：${CONFIG.CUSTOMER_SERVICE}`
        );
        for (const admin of CONFIG.ADMIN_IDS) {
          await sendMsg(admin,
            `🚨 逾期提醒 · 第 ${diff} 天\n` +
            `用户 <code>${uid}</code> 逾期 ${diff} 天\n` +
            `当前应还 ${unitLabel}${totalOwed}`
          );
        }
        await saveLoan(uid, { ...loan, status: "overdue", overdue_days: diff }, env);
      }
    } catch (e) {
      console.error(`scheduled error for ${uid}:`, e);
    }
  }
}


// ================================================================
// Workers 入口
// ================================================================
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("66ID Bot is running ✅", { status: 200 });
    }
    try {
      await loadConfig(env);
      await loadText(env);
      const update = await request.json();
      if (update.callback_query) await handleCallback(update.callback_query, env);
      else if (update.message)   await handleMessage(update.message, env);
    } catch (e) {
      console.error("Worker error:", e);
    }
    return new Response("OK", { status: 200 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(scheduledTask(env));
  },
};
