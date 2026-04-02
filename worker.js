// ================================================================
// 66ID 贷款机器人 - Cloudflare Workers v16
// ================================================================

const DEFAULT = {
  BOT_TOKEN:        "8604621639:AAEMH_W5NDU1Z2pVIvtl3fiXIIjqrO2-3U0",
  FORWARD_TARGETS:  ["8333517664", "7866700520"],
  ADMIN_IDS:        ["8333517664", "7866700520"],
  CUSTOMER_SERVICE: "https://t.me/liuliuidi",
  CHANNEL_LINK:     "https://t.me/liuLiuid",
  ENERGY_BOT:       "https://t.me/trx20gasbot?start",
  PAYMENT_ADDRESS:  "TG6kiaNUUgA56wy2mXbBo4E9TgpUbXoKWw",
  QR_FILE_ID:       "",
  QR_FILE_ID_2:     "",
  LOAN_DAYS:        7,
};

let CONFIG = { ...DEFAULT };

function getApi() {
  return `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;
}

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
  // CF Secrets 优先级最高，覆盖 KV 和硬编码默认值
  if (env.BOT_TOKEN)        CONFIG.BOT_TOKEN        = env.BOT_TOKEN;
  if (env.ADMIN_IDS)        CONFIG.ADMIN_IDS        = JSON.parse(env.ADMIN_IDS);
  if (env.FORWARD_TARGETS)  CONFIG.FORWARD_TARGETS  = JSON.parse(env.FORWARD_TARGETS);
  if (env.PAYMENT_ADDRESS)  CONFIG.PAYMENT_ADDRESS  = env.PAYMENT_ADDRESS;
  if (env.CUSTOMER_SERVICE) CONFIG.CUSTOMER_SERVICE = env.CUSTOMER_SERVICE;
}

// ================================================================
// 文案
// ================================================================
const DEFAULT_TEXT = {
  welcome: `欢迎使用 💰六六ID贷款助手！\n\n🍎六六苹果ID贷，轻松帮您周转资金💸\n我们在ID贷领域深耕多年，积累了丰富服务经验和口碑✨\n为了提供更安全便捷的服务，已使用公群担保🛡️经营有保障✅\n我们承诺会始终坚持安全可靠、高额度、低利息，让用户用得放心❤️\n\n📋资料简单：登录ID即可（不影响正常使用）\n⚡审核快：最快5分钟到账💨\n🎁提前还款利息减半！\n👑老客户享提额度＋降息福利💎\n\n同时为了回馈新老用户的信任🙏\n我们特意推出了🤖自助能量机器人，只需2.5 TRX即可进行一次USDT转账💱\n帮您大大节省转账手续费💰！\n\n💵支持下款方式：\nUSDT 🪙 微信💚 支付宝🧧\n\n🚫安全无套路，拒绝高息陷阱！\n💰高额度 · 💫低利息 · 🔒安全可靠`,

  loan_info: `贷款须知✨\n本群业务为苹果手机ID贷款咨询业务\n\n\n1. 未成年可贷，不做多机，备用机的也别来，只限本人借款。没有偿还能力的不要来，救急不救穷。\n\n\n2. 12起做，iOS更新系统到17.5以上，面容坏了可做，电池不到10天可做，根据手机实际情况降额度（如低配、更换零件）额度表仅供参考，实际额度以客服审核估价为准。\n\n\n3. 贷款找业务员提交资料，确定要借款则进入会议核对环节，配合审核员审核，如拒不配合或者辱骂本群审核员，则有权锁机一个礼拜、抹除数据作为惩罚并赔偿误工费。\n\n\n4. 恶意骗贷、代操作、官解机、隐藏机、多个人操作、虚假身份信息、非本人操作、双设备、技术操作；恶意隐瞒没有提前告知，出现以上情况，一旦发现，有权锁机并抹除数据视情况恶劣程度500-1000。\n\n\n5. 到期不归还贷款，逾期将会被清除手机数据，设置丢失模式，手机锁死，被泄露个人资料，被催收骚扰等，我方概不负责！\n\n\n💳 下款方式：USDT / 微信 / 支付宝\n🏦 唯一还款地址：\n<code>TG6kiaNUUgA56wy2mXbBo4E9TgpUbXoKWw</code>\n（微信/支付宝需我方确认后进款才算）\n\n\n⚠️ 苹果ID借款注意事项：\n1. 登陆ID后禁止乱试密码/密保或拿去做其他业务！\n2. 借款途中导致ID停用，公群不承担责任，可协助提供解除教程。\n3. ID停用属于百分之一风控，按教程绝大部分可解除。\n\n\n🛡 担保公群：https://t.me/+j6LNmLkLlvg1YTA1\n📢 下款群组：https://t.me/liuLiuid`,

  agree_prompt: `📋 请确认您已阅读并同意以上贷款须知。\n\n\n点击下方按钮开始申请 👇`,

  duplicate_apply: `⚠️ 您已提交过申请，请耐心等待专员联系。\n如有疑问请联系<a href="https://t.me/liuliuidid_bot">在线客服</a>`,

  repay_info: `💰 还款说明\n\n\n贷款周期7天（含当天），到期无力偿还可选择续期。\n\n\n请选择您的操作：`,

  promote: `🎉 六六ID贷 优惠活动\n\n\n━━━━━━━━━━━━━━\n⚡️ 活动一：24小时极速还款\n借款24小时内完成还款，即享🔥利息减半！\n\n\n━━━━━━━━━━━━━━\n🎁 活动二：推荐奖励计划\n\n\n👥 推荐 3 人 → 3个月TG会员（9.8 USDT / 58 RMB）\n👥 推荐 5 人 → 6个月TG会员（12.8 USDT / 88 RMB）\n👥 推荐 10 人 → 12个月TG会员（18.8 USDT / 139 RMB）\n\n\n可选择会员或折现\n━━━━━━━━━━━━━━\n🛡 由红星公共群担保支持\n🔗 红星群：https://t.me/+j6LNmLkLlvg1YTA1\n📢 官方频道：https://t.me/liuLiuid`,

  energy: `⚡️ TRX能量 / TG会员代购\n\n\n🚀 TRX能量 & Telegram 会员特惠中心\n为您提供最稳定、最划算的链上与通讯服务！\n\n波场 (TRON) 能量一键购买\n还在为昂贵的 USDT 转账手续费发愁？只需一笔转账，即可抵扣手续费！\n\n秒到账，无需注册！\n\n价格极低：仅需 2.5 TRX = 65,000 能量\n\n✅ 无需复杂操作，一转即用\n✅ 品质保障，稳定、安全、高效\n\n✈️ Telegram Premium 会员特惠\n3 个月 — 15 USDT\n6 个月 — 20 USDT\n12 个月 — 35 USDT (🔥 最划算选择)\n\n💡 立即下单，尊享极致效率！\n点击下方按钮前往购买 👇`,
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
  const res = await fetch(`${getApi()}/${method}`, {
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
async function forwardMessage(fromChatId, msgId, toChatId) {
  return tgPost("forwardMessage", { chat_id: toChatId, from_chat_id: fromChatId, message_id: msgId });
}
async function copyMessage(fromChatId, msgId, toChatId, replyToMsgId = null) {
  const body = { chat_id: toChatId, from_chat_id: fromChatId, message_id: msgId };
  if (replyToMsgId) body.reply_to_message_id = replyToMsgId;
  return tgPost("copyMessage", body);
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
  const res = await fetch(`${getApi()}/sendDocument`, {
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
  return raw ? JSON.parse(raw) : {
    visitors: 0, applied: 0, approved: 0,
    total_amount_rmb: 0, total_amount_usdt: 0,
    total_interest_rmb: 0, total_interest_usdt: 0,
  };
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
async function saveRelayMap(adminMsgId, userId, env) {
  await env.BOT_KV.put(`relay_map_${adminMsgId}`, String(userId), { expirationTtl: 604800 });
}
async function getRelayMap(adminMsgId, env) {
  return env.BOT_KV.get(`relay_map_${adminMsgId}`);
}

// ================================================================
// findUserId - 精确匹配优先，模糊匹配多结果时返回 ambiguous
// ================================================================
async function findUserId(env, keyword) {
  keyword = String(keyword || "").toLowerCase();
  const rawLoan   = await env.BOT_KV.get("loan_users");
  const loanUsers = rawLoan ? JSON.parse(rawLoan) : [];
  const allUsers  = await getAllUsers(env);
  const allIds    = [...new Set([...loanUsers, ...allUsers])];

  if (allIds.includes(keyword)) return { id: keyword, ambiguous: false, matches: [] };

  const matches = [];
  for (const uid of allIds) {
    const apply = await getApply(uid, env);
    const user  = await getUserInfo(uid, env);
    const model  = (apply?.model     || "").toLowerCase();
    const region = (apply?.region    || "").toLowerCase();
    const first  = (user?.first_name || "").toLowerCase();
    const last   = (user?.last_name  || "").toLowerCase();
    const userN  = (user?.username   || "").toLowerCase();
    const full   = [first, last].filter(Boolean).join(" ");

    if (
      String(uid).includes(keyword) || model.includes(keyword) ||
      region.includes(keyword) || first.includes(keyword) ||
      last.includes(keyword)   || userN.includes(keyword) || full.includes(keyword)
    ) {
      const nameTag = user
        ? `${[user.first_name, user.last_name].filter(Boolean).join(" ")}${user.username ? " (@" + user.username + ")" : ""}`
        : "";
      matches.push({ uid, nameTag, model: apply?.model || "-" });
    }
  }

  if (matches.length === 0) return { id: null, ambiguous: false, matches: [] };
  if (matches.length === 1) return { id: matches[0].uid, ambiguous: false, matches };
  return { id: null, ambiguous: true, matches };
}

function ambiguousMsg(keyword, matches) {
  const list = matches.map(m => `• <code>${m.uid}</code>  ${m.nameTag}  型号:${m.model}`).join("\n");
  return `⚠️ 关键词 "${keyword}" 匹配到 ${matches.length} 个用户，请用精确 ID 重试：\n\n${list}`;
}

// ================================================================
// 工具函数
// ================================================================
function getNow() {
  const d = new Date(Date.now() + 7 * 3600000);
  return d.toISOString().replace("T", " ").substring(0, 16) + " (GMT+7)";
}
function getToday() {
  const d = new Date(Date.now() + 7 * 3600000);
  return d.toISOString().substring(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().substring(0, 10);
}
function diffDays(dateStr) {
  const today = new Date(getToday() + "T00:00:00Z");
  const end   = new Date(dateStr   + "T00:00:00Z");
  return Math.floor((end - today) / 86400000);
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
  return s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")
    ? `"${s.replace(/"/g, '""')}"` : s;
}
function parseUnit(str) {
  const s = (str || "").toUpperCase();
  if (s === "U" || s === "USDT") return "USDT";
  if (s === "R" || s === "RMB")  return "RMB";
  return null;
}

// 生成用户可点击链接
function userLink(uid, label = null) {
  return `<a href="tg://user?id=${uid}">${label || uid}</a>`;
}

// ================================================================
// 主菜单
// ================================================================
async function sendMainMenu(chatId) {
  return sendMsg(chatId, TEXT.welcome, {
    inline_keyboard: [
      [
        { text: "📋 贷款说明",        callback_data: "menu_loaninfo"   },
        { text: "📢 下款频道",        url: CONFIG.CHANNEL_LINK         },
        { text: "🚩 推广有礼",        callback_data: "menu_promote"    },
      ],
      [
        { text: "📊 申请额度",        callback_data: "menu_apply"      },
        { text: "💰 还款",            callback_data: "menu_repay"      },
      ],
      [
        { text: "👤 在线客服",        url: CONFIG.CUSTOMER_SERVICE     },
        { text: "🔥 TRX能量/TG会员", callback_data: "menu_energy"     },
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
    `👤 用户ID：${userLink(userId)}  <code>${userId}</code>\n` +
    `📲 型号：${data.model  || "-"}\n` +
    `📍 地区：${data.region || "-"}\n` +
    `🕐 时间：${data.time}\n\n` +
    `✅ 批准指令：<code>/ok ${userId} 本金 单位 利息 天数</code>\n` +
    `例：<code>/ok ${userId} 300 R 50 7</code>`;
  for (const target of CONFIG.FORWARD_TARGETS) {
    await sendMsg(target, caption);
  }
}

async function forwardRepay(chatId, data) {
  const caption =
    `💳 还款申请\n\n` +
    `👤 用户ID：${userLink(chatId)}  <code>${chatId}</code>\n` +
    `💰 金额：${data.amount}\n` +
    `🍎 Apple ID：${data.appleid}\n` +
    `🕐 时间：${getNow()}`;
  for (const target of CONFIG.FORWARD_TARGETS) {
    await sendMsg(target, caption);
    if (data.shot) await sendPhoto(target, data.shot, `还款截图 - 用户 ${chatId}`);
  }
}

// ================================================================
// 双向对话：转发用户消息给管理员
// ================================================================
async function relayUserMsgToAdmins(msg, env, stepLabel = null) {
  const userId   = msg.from.id;
  const userInfo = await getUserInfo(userId, env);
  const nameStr  = userInfo
    ? `${[userInfo.first_name, userInfo.last_name].filter(Boolean).join(" ")}${userInfo.username ? " (@" + userInfo.username + ")" : ""}`
    : "";

  const stepTag = stepLabel ? `\n📍 流程步骤：${stepLabel}` : "";
  const header =
    `💬 用户消息\n` +
    `👤 ${userLink(userId)}  <code>${userId}</code>${nameStr ? "  " + nameStr : ""}${stepTag}\n` +
    `─────────────────`;

  for (const adminId of CONFIG.ADMIN_IDS) {
    await sendMsg(adminId, header);
    const fwdResult = await forwardMessage(msg.chat.id, msg.message_id, adminId);
    if (fwdResult && fwdResult.result) {
      await saveRelayMap(fwdResult.result.message_id, userId, env);
    }
    await sendMsg(adminId, `↩️ 回复上方消息即可发送给用户 ${userLink(userId)}`);
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
    const existingLoan = await getLoan(chatId, env);
    if (existingLoan && existingLoan.status === "active") {
      return sendMsg(chatId, `⚠️ 您当前有未还清的贷款，请还清后再申请。\n如有疑问请联系<a href="${CONFIG.CUSTOMER_SERVICE}">在线客服</a>`);
    }
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
      `❌ 很抱歉，分期未结清的设备暂不符合申请条件。\n\n如有疑问，请联系<a href="${CONFIG.CUSTOMER_SERVICE}">在线客服</a>`
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
      `🪙 USDT 收款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
      `💚 微信 / 支付宝：请先联系客服确认再付款\n\n` +
      `付款完成后点击【已付款】上传凭证 👇`;
    const keyboard = {
      inline_keyboard: [[{ text: "✅ 已付款，上传凭证", callback_data: "repay_upload" }]],
    };
    if (CONFIG.QR_FILE_ID)   await sendPhoto(chatId, CONFIG.QR_FILE_ID,   "🪙 USDT 收款码");
    if (CONFIG.QR_FILE_ID_2) await sendPhoto(chatId, CONFIG.QR_FILE_ID_2, "💚 微信/支付宝 收款码");
    return sendMsg(chatId, addressText, keyboard);
  }

  if (data === "repay_upload") {
    await setState(chatId, { step: "repay_screenshot" }, env);
    return sendMsg(chatId, "💳 还款凭证\n\n请上传<b>还款截图</b>（转账记录）：");
  }

  if (data === "repay_renew") {
    return sendMsg(chatId, `🔄 续期申请\n\n请直接联系<a href="${CONFIG.CUSTOMER_SERVICE}">客服</a>办理续期`);
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
  if (msg.chat.type !== "private") return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text   = msg.text  || "";
  const photo  = msg.photo || null;

  await addUser(chatId, env);

  const userInfo = await getUserInfo(chatId, env);
  if (!userInfo || !userInfo.firstVisit) {
    const stats = await getStats(env);
    stats.visitors = (stats.visitors || 0) + 1;
    await saveStats(stats, env);
    await env.BOT_KV.put(`userinfo_${chatId}`, JSON.stringify({
      ...(userInfo || {}),
      first_name: msg.from.first_name || "",
      last_name:  msg.from.last_name  || "",
      username:   msg.from.username   || "",
      updatedAt:  getToday(),
      firstVisit: getToday(),
    }));
  } else {
    await saveUserInfo(chatId, msg.from, env);
  }

  if (text === "/start") {
    await clearState(chatId, env);
    return sendMainMenu(chatId);
  }

  // ── 管理员逻辑 ──────────────────────────────────────────────────
  if (isAdmin(userId)) {
    if (text === "/cid" || text.startsWith("/cid ")) return cmdCid(chatId, text, env);
    if (text === "/cyq")                              return cmdStats(chatId, env);
    if (text === "/debug")                            return cmdDebug(chatId, env);
    if (text.startsWith("/ok"))                       return cmdApprove(chatId, text, env);
    if (text.startsWith("/xq"))                       return cmdRenew(chatId, text, env);
    if (text.startsWith("/nb"))                       return cmdRepaid(chatId, text, env);
    if (text.startsWith("/zt"))                       return cmdPause(chatId, text, env);
    if (text.startsWith("/cx"))                       return cmdGetUser(chatId, text, env);
    if (text === "/loanlist")                         return cmdLoanList(chatId, env);
    if (text === "/export")                           return cmdExport(chatId, env);
    if (text.startsWith("/setconfig "))               return cmdSetConfig(chatId, text.slice(11), env);
    if (text.startsWith("/settext "))                 return cmdSetText(chatId, text.slice(9), env);
    if (text.startsWith("/bb "))                      return cmdBroadcast(chatId, text.slice(4), env);
    if (text === "/getconfig")                        return cmdGetConfig(chatId, env);
    if (text === "/liuliu")                           return cmdLiuliu(chatId);
    if (text === "/ql000000")                         return cmdClearAll(chatId, env);

    if (msg.reply_to_message) {
      const repliedMsgId = msg.reply_to_message.message_id;
      const targetUserId = await getRelayMap(repliedMsgId, env);
      if (targetUserId) {
        await copyMessage(chatId, msg.message_id, targetUserId);
        return sendMsg(chatId, `✅ 已发送给用户 ${userLink(targetUserId)}`);
      }
    }

    // 如果不是管理员命令，继续执行用户逻辑（管理员也可以正常使用申请流程）
  }

  // ── 用户逻辑 ─────────────────────────────────────────────────────
  const state = await getState(chatId, env);

  if (!state) {
    if (text !== "/start") await relayUserMsgToAdmins(msg, env);
    return sendMainMenu(chatId);
  }

  const step = state.step;

  if (step === "apply_model") {
    if (!text.trim()) {
      if (photo || msg.document || msg.video) {
        await relayUserMsgToAdmins(msg, env, "申请步骤 - 手机型号（非文本）");
      }
      return sendMsg(chatId, "⚠️ 请输入手机型号（文字）");
    }
    await relayUserMsgToAdmins(msg, env, "申请步骤 - 手机型号");
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
    return sendMsg(chatId, "⚠️ 请点击上方按钮选择全款/分期👆", {
      inline_keyboard: [[
        { text: "✅ 全款", callback_data: "apply_stage2_normal"      },
        { text: "❌ 分期", callback_data: "apply_stage2_installment" },
      ]],
    });
  }

  if (step === "apply_region") {
    if (!text.trim()) return sendMsg(chatId, "⚠️ 请输入所在地区");
    await relayUserMsgToAdmins(msg, env, "申请步骤 - 所在地区");
    const final = { ...state, region: text.trim(), applied: true, approved: false, time: getNow() };
    await clearState(chatId, env);
    await saveApply(chatId, final, env);
    const s = await getStats(env);
    s.applied = (s.applied || 0) + 1;
    await saveStats(s, env);
    await forwardApply(chatId, final, userId);
    return sendMsg(chatId, `🎉 申请提交成功！\n\n资料已提交，专员将尽快与您联系。\n如有疑问请联系<a href="${CONFIG.CUSTOMER_SERVICE}">在线客服</a>`);
  }

  if (step === "repay_screenshot") {
    if (!photo) return sendMsg(chatId, "⚠️ 请发送还款截图（图片）");
    await relayUserMsgToAdmins(msg, env, "还款流程 - 上传截图");
    const fid = photo[photo.length - 1].file_id;
    await setState(chatId, { ...state, step: "repay_amount", shot: fid }, env);
    return sendMsg(chatId, "✅ 截图已收到\n\n请输入<b>还款金额</b>（支持：350 / 50U / 50 USDT / 350 RMB）：");
  }
  if (step === "repay_amount") {
    const val = text.trim();
    if (!val) return sendMsg(chatId, "⚠️ 请输入还款金额（如：350、50U、50 USDT、350 RMB）");
    await relayUserMsgToAdmins(msg, env, "还款流程 - 输入金额");
    await setState(chatId, { ...state, step: "repay_appleid", amount: val }, env);
    return sendMsg(chatId, `✅ 金额：${val}\n\n请输入您的 <b>Apple ID</b>（邮箱格式）：`);
  }
  if (step === "repay_appleid") {
    await relayUserMsgToAdmins(msg, env, "还款流程 - Apple ID");
    const final = { ...state, appleid: text.trim() };
    await clearState(chatId, env);
    await forwardRepay(chatId, final);
    return sendMsg(chatId,
      `✅ 还款信息已提交！\n\n💰 金额：${final.amount}\n🍎 Apple ID：${text.trim()}\n\n客服将在30分钟内确认\n<a href="${CONFIG.CUSTOMER_SERVICE}">联系客服</a>`
    );
  }

  await relayUserMsgToAdmins(msg, env, `流程：${step}`);
  return sendMainMenu(chatId);
}

// ================================================================
// 管理员指令
// ================================================================

async function cmdCid(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length === 1) {
    return sendMsg(chatId, `🪪 您的 Telegram 用户ID\n\n<code>${chatId}</code>\n\n直接点击上方数字即可复制`);
  }
  const keyword = parts.slice(1).join(" ").toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));

  const rawLoan   = await env.BOT_KV.get("loan_users");
  const loanUsers = rawLoan ? JSON.parse(rawLoan) : [];
  const allUsers  = await getAllUsers(env);
  const allIds    = [...new Set([...loanUsers, ...allUsers])];

  const results = [];
  for (const uid of allIds) {
    const apply    = await getApply(uid, env);
    const userinfo = await getUserInfo(uid, env);
    const model     = (apply?.model        || "").toLowerCase();
    const region    = (apply?.region       || "").toLowerCase();
    const firstName = (userinfo?.first_name || "").toLowerCase();
    const lastName  = (userinfo?.last_name  || "").toLowerCase();
    const username  = (userinfo?.username   || "").toLowerCase();
    const fullName  = `${firstName} ${lastName}`.trim();

    if (
      uid.includes(keyword) || model.includes(keyword) || region.includes(keyword) ||
      firstName.includes(keyword) || lastName.includes(keyword) || username.includes(keyword)
    ) {
      const nameTag = userinfo
        ? ` | ${fullName || "-"}${userinfo.username ? " (@" + userinfo.username + ")" : ""}`
        : "";
      results.push(`${userLink(uid)}  <code>${uid}</code>${nameTag}  型号:${apply?.model||"-"}  地区:${apply?.region||"-"}`);
    }
  }

  if (results.length === 0) return sendMsg(chatId, `❌ 未找到匹配 "${keyword}" 的用户`);
  return sendLong(chatId, `🔍 查询结果（关键词：${keyword}）共 ${results.length} 条\n\n` + results.join("\n"));
}


async function cmdApprove(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 6) {
    return sendMsg(chatId,
      "❌ 格式：/ok 用户 本金 单位 利息 天数\n\n" +
      "单位：R 人民币 / U USDT\n" +
      "例：/ok 123456789 300 R 50 7\n" +
      "例：/ok 张三 300 R 50 7"
    );
  }

  const keyword = parts[1].toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));
  if (!result.id)       return sendMsg(chatId, `❌ 未找到用户：${keyword}`);
  const targetId = result.id;

  const amount   = parseFloat(parts[2]);
  const unit     = parseUnit(parts[3]);
  const interest = parseFloat(parts[4]);
  const loanDays = parseInt(parts[5]);

  if (isNaN(amount) || amount <= 0)     return sendMsg(chatId, "❌ 本金格式错误，请输入正数");
  if (!unit)                             return sendMsg(chatId, "❌ 单位格式错误，请输入 R（人民币）或 U（USDT）");
  if (isNaN(interest) || interest < 0)  return sendMsg(chatId, "❌ 利息格式错误，请输入非负数");
  if (isNaN(loanDays) || loanDays <= 0) return sendMsg(chatId, "❌ 天数格式错误，请输入正整数");

  const existingLoan = await getLoan(targetId, env);
  if (existingLoan && (existingLoan.status === "active" || existingLoan.status === "overdue")) {
    const exLabel  = existingLoan.unit === "USDT" ? "" : "¥";
    const exSuffix = existingLoan.unit === "USDT" ? " USDT" : " RMB";
    return sendMsg(chatId,
      `❌ 用户 ${targetId} 已有未还清的贷款！\n\n` +
      `借款：${exLabel}${existingLoan.amount}${exSuffix}  到期：${existingLoan.end_date}\n\n` +
      `请先用 /nb 标记还清，再重新审批。`
    );
  }

  const unitLabel = unit === "USDT" ? "" : "¥";
  const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
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
  s.approved = (s.approved || 0) + 1;
  if (unit === "USDT") {
    s.total_amount_usdt   = (s.total_amount_usdt   || 0) + amount;
    s.total_interest_usdt = (s.total_interest_usdt || 0) + interest;
  } else {
    s.total_amount_rmb   = (s.total_amount_rmb   || 0) + amount;
    s.total_interest_rmb = (s.total_interest_rmb || 0) + interest;
  }
  await saveStats(s, env);

  await sendMsg(targetId,
    `🎉 恭喜！您的申请已通过审核！\n\n` +
    `💰 借款金额：<b>${unitLabel}${amount}${unitSuffix}</b>\n` +
    `💵 利息：<b>${unitLabel}${interest}${unitSuffix}</b>\n` +
    `📅 贷款天数：<b>${loanDays} 天</b>\n` +
    `📅 还款截止：<b>${endDate}</b>\n` +
    `💳 到期应还：<b>${unitLabel}${repayAmt}${unitSuffix}</b>\n\n` +
    `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
    `如有疑问请联系<a href="${CONFIG.CUSTOMER_SERVICE}">在线客服</a>`
  );

  return sendMsg(chatId,
    `✅ 批准成功\n\n` +
    `用户：${userLink(targetId)}\n` +
    `借款：${unitLabel}${amount}${unitSuffix}\n` +
    `利息：${unitLabel}${interest}${unitSuffix}\n` +
    `天数：${loanDays} 天\n` +
    `应还：${unitLabel}${repayAmt}${unitSuffix}\n` +
    `到期：${endDate}`
  );
}


async function cmdRenew(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 5) {
    return sendMsg(chatId,
      "❌ 格式：/xq 用户 已还利息 续期天数 下期利息\n\n" +
      "新应还 = (上期应还 - 已还利息) + 下期利息\n\n" +
      "例：/xq 123456789 50 7 30\n" +
      "例：/xq 张三 50 7 30"
    );
  }

  const keyword = parts[1].toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));
  if (!result.id)       return sendMsg(chatId, `❌ 未找到用户：${keyword}`);
  const targetId = result.id;

  const paidInterest = parseFloat(parts[2]);
  const days         = parseInt(parts[3]);
  const nextInterest = parseFloat(parts[4]);

  if (isNaN(paidInterest) || paidInterest < 0) return sendMsg(chatId, "❌ 已还利息格式错误");
  if (isNaN(days) || days <= 0)                return sendMsg(chatId, "❌ 续期天数格式错误");
  if (isNaN(nextInterest) || nextInterest < 0) return sendMsg(chatId, "❌ 下期利息格式错误");

  const loan = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);
  if (loan.status === "repaid") return sendMsg(chatId, `❌ 用户 ${targetId} 的贷款已还清，无法续期`);

  const unit      = loan.unit || "RMB";
  const unitLabel = unit === "USDT" ? "" : "¥";
  const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
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
    `💳 新周期应还：<b>${unitLabel}${newRepay}${unitSuffix}</b>\n\n` +
    `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
    `如有疑问请联系<a href="${CONFIG.CUSTOMER_SERVICE}">在线客服</a>`
  );

  return sendMsg(chatId,
    `✅ 续期成功\n\n` +
    `用户：${userLink(targetId)}\n` +
    `上期应还：${unitLabel}${prevRepay.toFixed(decimals)}${unitSuffix}\n` +
    `本次已还：${unitLabel}${paidInterest}${unitSuffix}\n` +
    `续期天数：${days} 天\n` +
    `下期利息：${unitLabel}${nextInterest}${unitSuffix}\n` +
    `新应还：${unitLabel}${newRepay}${unitSuffix}\n` +
    `新到期：${newEndDate}\n` +
    `累计续期：${renewCount} 次\n` +
    `累计已收利息：${unitLabel}${totalInterestCollected.toFixed(decimals)}${unitSuffix}`
  );
}


async function cmdRepaid(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return sendMsg(chatId, "❌ 格式：/nb 用户\n例：/nb 123456789 或 /nb 张三");

  const keyword = parts[1].toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));
  if (!result.id)       return sendMsg(chatId, `❌ 未找到用户：${keyword}`);
  const targetId = result.id;

  const loan = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);

  const unit      = loan.unit || "RMB";
  const unitLabel = unit === "USDT" ? "" : "¥";
  const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
  const decimals  = unit === "USDT" ? 2 : 0;

  // 最后一期真实利息 = 最终应还 - 原始本金（比 lastRenewInterest 更准确）
  const lastInterest = parseFloat(loan.repay_amount) - parseFloat(loan.amount);
  const totalInterestCollected = (parseFloat(loan.totalInterestCollected) || 0) + Math.max(0, lastInterest);

  await saveLoan(targetId, {
    ...loan,
    status: "repaid",
    repaidAt: getNow(),
    totalInterestCollected,
    end_date: getToday(),
  }, env);

  await sendMsg(targetId,
    `✅ 您的还款已确认！\n\n` +
    `💰 还款金额：${unitLabel}${loan.repay_amount}${unitSuffix}\n\n` +
    `很荣幸你选择了六六和您共度难关，如果将来或者朋友还有需要请记得六六永远都在，但我们更希望您将来顺风顺水，一路666！🍀`
  );

  return sendMsg(chatId,
    `✅ 已标记用户 ${userLink(targetId)} 还款完成\n` +
    `累计已收利息：${unitLabel}${totalInterestCollected.toFixed(decimals)}${unitSuffix}`
  );
}


async function cmdPause(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return sendMsg(chatId,
    "❌ 格式：/zt 用户 天数\n" +
    "例：/zt 123456789 2 → 暂停催款2天\n" +
    "取消暂停：/zt 用户 0"
  );

  const keyword = parts[1].toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));
  if (!result.id)       return sendMsg(chatId, `❌ 未找到用户：${keyword}`);
  const targetId = result.id;

  const days = parseInt(parts[2]);
  const loan = await getLoan(targetId, env);
  if (!loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的贷款记录`);

  if (days <= 0) {
    await saveLoan(targetId, { ...loan, pause_until: null }, env);
    return sendMsg(chatId, `✅ 已取消用户 ${userLink(targetId)} 的催款暂停，恢复正常催款`);
  }

  const pauseUntil = addDays(getToday(), days);
  await saveLoan(targetId, { ...loan, pause_until: pauseUntil }, env);
  return sendMsg(chatId,
    `✅ 已暂停用户 ${userLink(targetId)} 的催款通知\n\n` +
    `📅 暂停至：<b>${pauseUntil}</b>（共 ${days} 天）\n` +
    `提前取消：/zt ${targetId} 0`
  );
}


async function cmdGetUser(chatId, text, env) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return sendMsg(chatId, "❌ 格式：/cx 用户\n例：/cx 123456789 或 /cx 张三");

  const keyword = parts[1].toLowerCase();
  const result  = await findUserId(env, keyword);
  if (result.ambiguous) return sendMsg(chatId, ambiguousMsg(keyword, result.matches));
  if (!result.id)       return sendMsg(chatId, `❌ 未找到用户：${keyword}`);
  const targetId = result.id;

  const apply    = await getApply(targetId, env);
  const loan     = await getLoan(targetId, env);
  const userinfo = await getUserInfo(targetId, env);

  if (!apply && !loan) return sendMsg(chatId, `❌ 找不到用户 ${targetId} 的任何记录`);

  const statusMap = { active: "还款中 🟢", repaid: "已还清 ✅", overdue: "逾期 🚨", renewed: "已续期 🔄" };
  let info = `👤 用户详情\n${"─".repeat(20)}\n`;

  // 用户名可点击跳转
  info += `ID：${userLink(targetId)}\n`;

  if (userinfo) {
    const fullName = [userinfo.first_name, userinfo.last_name].filter(Boolean).join(" ");
    if (fullName)          info += `姓名：${fullName}\n`;
    if (userinfo.username) info += `用户名：<a href="https://t.me/${userinfo.username}">@${userinfo.username}</a>\n`;
  }

  if (apply) {
    info += `\n📋 申请信息\n`;
    info += `型号：${apply.model  || "-"}\n`;
    info += `地区：${apply.region || "-"}\n`;
    info += `申请时间：${apply.time || "-"}\n`;
  }

  if (loan) {
    const unit       = loan.unit || "RMB";
    const unitLabel  = unit === "USDT" ? "" : "¥";
    const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
    const decimals   = unit === "USDT" ? 2 : 0;
    const diff       = diffDays(loan.end_date);

    info += `\n💰 贷款信息\n`;
    info += `状态：${statusMap[loan.status] || loan.status}\n`;
    info += `借款：${unitLabel}${loan.amount}${unitSuffix}\n`;
    // 显示当期实际利息：续期过的用最后一次续期利息，否则用原始利息
    const currentInterest = (loan.renewCount || 0) > 0 ? (loan.lastRenewInterest ?? loan.interest) : loan.interest;
    info += `当期利息：${unitLabel}${currentInterest || "-"}${unitSuffix}\n`;
    info += `贷款天数：${loan.loan_days || "-"} 天\n`;
    info += `应还：${unitLabel}${loan.repay_amount}${unitSuffix}\n`;
    info += `开始：${loan.start_date}\n`;
    info += `到期：${loan.end_date}\n`;
    info += `续期：${loan.renewCount || 0} 次\n`;
    if ((loan.totalInterestCollected || 0) > 0) {
      info += `已实收利息：${unitLabel}${parseFloat(loan.totalInterestCollected).toFixed(decimals)}${unitSuffix}\n`;
    }
    if (loan.pause_until && loan.pause_until >= getToday()) {
      info += `⏸ 催款暂停至：${loan.pause_until}\n`;
    }
    if (loan.status !== "repaid") {
      if (diff < 0)      info += `\n⚠️ 逾期 ${Math.abs(diff)} 天\n`;
      else if (diff === 0) info += `⚠️ 今天到期！\n`;
      else                 info += `✅ 距到期还有 ${diff} 天\n`;
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
  let interestRMB = 0, interestUSDT = 0;

  for (const uid of users) {
    const loan  = await getLoan(uid, env);
    const apply = await getApply(uid, env);
    if (!loan) continue;

    const unit       = loan.unit || "RMB";
    const unitLabel  = unit === "USDT" ? "" : "¥";
    const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
    const name       = apply?.model || "未知";
    const diff       = diffDays(loan.end_date);
    const renewCount = loan.renewCount || 0;
    const paused     = loan.pause_until && loan.pause_until >= today;

    // 累计放款（所有人，含已还清）
    if (unit === "RMB")  lentRMB  += parseFloat(loan.amount) || 0;
    if (unit === "USDT") lentUSDT += parseFloat(loan.amount) || 0;

    // 已实收利息：只统计已还清的
    if (loan.status === "repaid") {
      const collected = parseFloat(loan.totalInterestCollected) || 0;
      if (unit === "RMB")  interestRMB  += collected;
      if (unit === "USDT") interestUSDT += collected;
    }

    const pauseTag = paused ? ` ⏸暂停至${loan.pause_until}` : "";
    const base =
      `👤 ${userLink(uid)}  ${name}${pauseTag}\n` +
      `💰 借：${unitLabel}${loan.amount}${unitSuffix}  应还：${unitLabel}${loan.repay_amount}${unitSuffix}  天数：${loan.loan_days||"-"}天  续期：${renewCount}次\n` +
      `📅 到期：${loan.end_date}\n`;

    if (loan.status === "repaid") {
      groups.repaid.push(base + `✅ 已还清 ${loan.repaidAt || ""}`);
    } else if (diff < 0) {
      const overdueDays = Math.abs(diff);
      if (unit === "RMB")  { unpaidRMB  += parseFloat(loan.repay_amount); overdueRMB  += parseFloat(loan.repay_amount); }
      if (unit === "USDT") { unpaidUSDT += parseFloat(loan.repay_amount); overdueUSDT += parseFloat(loan.repay_amount); }
      groups.overdue.push(
        base +
        `🚨 逾期 ${overdueDays} 天\n` +
        `👉 /nb ${uid}  |  /xq ${uid} 已还 续期天 下期息  |  /zt ${uid} 天数`
      );
    } else {
      if (unit === "RMB")  unpaidRMB  += parseFloat(loan.repay_amount);
      if (unit === "USDT") unpaidUSDT += parseFloat(loan.repay_amount);
      const left = diff === 0 ? "⚠️ 今天到期" : `还剩 ${diff} 天`;
      groups.active.push(
        base +
        `✅ ${left}\n` +
        `👉 /nb ${uid}  |  /xq ${uid} 已还 续期天 下期息  |  /zt ${uid} 天数`
      );
    }
  }

  const s = await getStats(env);
  let msg =
    `📊 下款用户总览\n${"═".repeat(18)}\n` +
    `👥 总人数：${users.length} 人\n` +
    `\n💸 累计放款\n` +
    `  人民币：¥${lentRMB.toLocaleString()} RMB\n` +
    `  USDT：${lentUSDT.toFixed(2)} USDT\n` +
    `\n📥 待回收（未还清）\n` +
    `  人民币：¥${unpaidRMB.toLocaleString()} RMB\n` +
    `  USDT：${unpaidUSDT.toFixed(2)} USDT\n` +
    `\n💵 已实收利息\n` +
    `  人民币：¥${interestRMB.toFixed(0)} RMB\n` +
    `  USDT：${interestUSDT.toFixed(2)} USDT\n` +
    `\n🚨 逾期应收\n` +
    `  人民币：¥${overdueRMB.toLocaleString()} RMB\n` +
    `  USDT：${overdueUSDT.toFixed(2)} USDT\n` +
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
    const overdueDays = loan.status !== "repaid" && diff < 0 ? Math.abs(diff) : 0;
    const fullName    = userinfo ? [userinfo.first_name, userinfo.last_name].filter(Boolean).join(" ") : "";

    const row = [
      uid, fullName, userinfo?.username || "",
      apply?.model || "", apply?.region || "",
      loan.unit || "RMB", loan.amount || "", loan.interest || "",
      loan.repay_amount || "", loan.loan_days || "",
      loan.start_date || "", loan.end_date || "",
      loan.status || "", overdueDays,
      loan.renewCount || 0, loan.totalInterestCollected || 0,
      loan.repaidAt || "", apply?.time || "",
    ];
    rows.push(row.map(escCsv).join(","));
  }

  const csv      = "\uFEFF" + rows.join("\r\n");
  const filename = `loanlist_${getToday()}.csv`;
  const res = await sendDocument(chatId, filename, csv, `📎 下款明细导出 ${getToday()}，共 ${users.length} 条`);
  if (!res.ok) await sendMsg(chatId, "⚠️ 文件发送失败，请稍后重试");
}


async function cmdStats(chatId, env) {
  const s = await getStats(env);

  const raw   = await env.BOT_KV.get("loan_users");
  const users = raw ? JSON.parse(raw) : [];
  let unpaidRMB = 0, unpaidUSDT = 0;
  let realInterestRMB = 0, realInterestUSDT = 0;

  for (const uid of users) {
    const loan = await getLoan(uid, env);
    if (!loan) continue;
    const unit = loan.unit || "RMB";
    if (loan.status === "repaid") {
      // 已还清：累加真实已收利息
      if (unit === "RMB") realInterestRMB  += parseFloat(loan.totalInterestCollected || 0);
      else                realInterestUSDT += parseFloat(loan.totalInterestCollected || 0);
    } else {
      // 未还清：累加待回收金额
      if (unit === "RMB") unpaidRMB  += parseFloat(loan.repay_amount || 0);
      else                unpaidUSDT += parseFloat(loan.repay_amount || 0);
    }
  }

  return sendMsg(chatId,
    `📊 数据统计\n${"─".repeat(16)}\n` +
    `👣 累计访客：${s.visitors  || 0} 人\n` +
    `� 申请总数：${s.applied   || 0} 人\n` +
    `✅ 审核通过：${s.approved  || 0} 人\n` +
    `\n💸 累计放款\n` +
    `  人民币：¥${(s.total_amount_rmb  || 0).toLocaleString()} RMB\n` +
    `  USDT：${(s.total_amount_usdt || 0).toFixed(2)} USDT\n` +
    `\n💵 已实收利息\n` +
    `  人民币：¥${realInterestRMB.toFixed(0)} RMB\n` +
    `  USDT：${realInterestUSDT.toFixed(2)} USDT\n` +
    `\n📥 当前待回收\n` +
    `  人民币：¥${unpaidRMB.toFixed(0)} RMB\n` +
    `  USDT：${unpaidUSDT.toFixed(2)} USDT`
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
    `📋 当前动态配置\n\n<code>${JSON.stringify(cfg, null, 2)}</code>\n\n（未显示的字段表示使用代码默认值）`
  );
}


async function cmdBroadcast(chatId, content, env) {
  if (!content.trim()) return sendMsg(chatId, "❌ 用法：/bb 内容");
  const users = await getAllUsers(env);
  let sent = 0, failed = 0;
  for (const uid of users) {
    try {
      const res = await sendMsg(uid, content);
      if (res && res.ok) sent++;
      else failed++;
    } catch { failed++; }
  }
  return sendMsg(chatId, `✅ 群发完成，成功 ${sent} / ${users.length}${failed > 0 ? `，失败 ${failed} 人` : ""}`);
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
  await env.BOT_KV.delete("config");
  await env.BOT_KV.delete("text");
  CONFIG = { ...DEFAULT };
  TEXT   = { ...DEFAULT_TEXT };

  return sendMsg(chatId,
    `🧹 清理完成\n\n已删除 ${allIds.length} 个用户的所有数据\n含：状态、申请记录、贷款记录、用户信息、统计数据、配置、文案\n\n⚠️ 此操作不可逆`
  );
}




async function cmdDebug(chatId, env) {
  const msg = 
    `🔧 配置调试信息\n${"─".repeat(22)}\n\n` +
    `客服链接：${CONFIG.CUSTOMER_SERVICE}\n` +
    `频道链接：${CONFIG.CHANNEL_LINK}\n` +
    `能量机器人：${CONFIG.ENERGY_BOT}\n` +
    `收款地址：${CONFIG.PAYMENT_ADDRESS}\n\n` +
    `测试按钮（点击看是否能跳转）：`;
  
  await sendMsg(chatId, msg, {
    inline_keyboard: [
      [{ text: "👤 测试客服", url: CONFIG.CUSTOMER_SERVICE }],
      [{ text: "📢 测试频道", url: CONFIG.CHANNEL_LINK }],
      [{ text: "⚡️ 测试能量", url: CONFIG.ENERGY_BOT }],
    ],
  });
  
  return sendMsg(chatId, 
    `如果上面的按钮点击没反应，可能原因：\n\n` +
    `1. Bot 用户名不存在或拼写错误\n` +
    `2. 频道/群组链接无效\n` +
    `3. 需要先启动对应的 bot\n\n` +
    `当前配置的客服 bot：liuliuidid_bot\n` +
    `请确认这个 bot 是否存在且可访问`
  );
}


async function cmdLiuliu(chatId) {
  return sendMsg(chatId,
    `👮 管理员指令\n${"─".repeat(22)}\n\n` +

    `📋 <b>审批</b>\n` +
    `/ok 用户 本金 单位 利息 天数\n` +
    `→ 审核通过，单位 R=人民币 U=USDT\n` +
    `→ 例：/ok 张三 300 R 50 7\n\n` +

    `/xq 用户 已还利息 续期天数 下期利息\n` +
    `→ 续期，新应还=(上期-已还)+下期息\n` +
    `→ 例：/xq 张三 50 7 30\n\n` +

    `/nb 用户\n` +
    `→ 标记已还清\n` +
    `→ 例：/nb 张三\n\n` +

    `/zt 用户 天数\n` +
    `→ 暂停催款N天（0=取消）\n` +
    `→ 例：/zt 张三 2\n\n` +

    `${"─".repeat(22)}\n` +
    `� <b>查询</b>\n` +
    `/cx 用户  → 查详情（申请+贷款）\n` +
    `/cid 关键词  → 按名字/型号/地区搜用户ID\n` +
    `/loanlist  → 全部用户总览\n` +
    `/export  → 导出 CSV\n` +
    `/cyq  → 统计数据\n` +
    `/debug  → 调试配置和按钮\n\n` +

    `${"─".repeat(22)}\n` +
    `📢 <b>群发</b>\n` +
    `/bb 内容  → 群发给所有用户\n\n` +

    `${"─".repeat(22)}\n` +
    `⚙️ <b>配置</b>\n` +
    `/setconfig {"字段":"值"}  → 改配置\n` +
    `/getconfig  → 查当前配置\n` +
    `/settext {"字段":"内容"}  → 改文案\n\n` +

    `${"─".repeat(22)}\n` +
    `💬 <b>双向对话</b>\n` +
    `用户消息自动转发，回复该消息即可回复用户\n\n` +

    `/ql000000  ⚠️ 清空所有数据\n` +
    `/liuliu  查看此帮助`
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

      const unit       = loan.unit || "RMB";
      const unitLabel  = unit === "USDT" ? "" : "¥";
      const unitSuffix = unit === "USDT" ? " USDT" : " RMB";
      const diff       = diffDays(loan.end_date);

      if (diff === 1 && !loan.reminded) {
        await sendMsg(uid,
          `⏰ 还款提醒\n\n` +
          `您的贷款将于<b>明天 ${loan.end_date}</b> 到期！\n\n` +
          `💳 应还金额：<b>${unitLabel}${loan.repay_amount}${unitSuffix}</b>\n\n` +
          `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
          `如需续期请提前联系<a href="${CONFIG.CUSTOMER_SERVICE}">客服</a>`
        );
        await saveLoan(uid, { ...loan, reminded: true }, env);
      }

      if (diff === 0) {
        await sendMsg(uid,
          `🔴 今日到期！\n\n` +
          `您的贷款<b>今天 ${loan.end_date}</b> 到期！\n\n` +
          `💳 应还金额：<b>${unitLabel}${loan.repay_amount}${unitSuffix}</b>\n\n` +
          `还款地址：\n<code>${CONFIG.PAYMENT_ADDRESS}</code>\n\n` +
          `如需续期请立即联系<a href="${CONFIG.CUSTOMER_SERVICE}">客服</a>`
        );
      }

      if (diff < 0) {
        const overdueDays = Math.abs(diff);
        const dayHint = overdueDays === 1
          ? `这是您逾期<b>第 1 天</b>，请尽快还款！`
          : `您已连续逾期 <b>${overdueDays} 天</b>，请立即处理！`;

        const sendResult = await sendMsg(uid,
          `🚨 逾期催收通知 · 第${overdueDays}天\n\n` +
          `${dayHint}\n\n` +
          `💳 应还金额：<b>${unitLabel}${loan.repay_amount}${unitSuffix}</b>\n\n` +
          `⚠️ 逾期将被锁机并抹除数据！\n` +
          `立即还款或续期：<a href="${CONFIG.CUSTOMER_SERVICE}">联系客服</a>`
        );

        if (sendResult && !sendResult.ok && sendResult.error_code === 403) {
          await saveLoan(uid, { ...loan, status: "overdue", overdue_days: overdueDays, bot_blocked: true }, env);
          continue;
        }

        for (const admin of CONFIG.ADMIN_IDS) {
          await sendMsg(admin,
            `🚨 逾期提醒 · 第${overdueDays}天\n` +
            `用户 ${userLink(uid)} 逾期 ${overdueDays} 天\n` +
            `应还 ${unitLabel}${loan.repay_amount}${unitSuffix}`
          );
        }
        await saveLoan(uid, { ...loan, status: "overdue", overdue_days: overdueDays }, env);
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
