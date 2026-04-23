// ====== 全局缓存（避免重复 importKey，提升性能） ======
let cachedKey = null;

/**
 * 获取 HMAC key（带缓存）
 */
async function getKey(secret) {
  if (cachedKey) return cachedKey;

  cachedKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return cachedKey;
}

// 纯 Web API 实现 base64url → Uint8Array（全平台兼容）
function base64UrlToUint8Array(base64Url) {
  // 1. base64url 转标准 base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // 2. 补全 padding
  const pad = base64.length % 4;
  if (pad) base64 += '===='.substring(pad);
  
  // 3. 纯 Web API 解码（无 Buffer！）
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 安全解析 JSON
 */
function decodeJson(base64Url) {
  try {
    const bytes = base64UrlToUint8Array(base64Url);
    // 用标准 TextDecoder
    const str = new TextDecoder().decode(bytes);
    return JSON.parse(str);
  } catch (err) {
    console.error('[解码失败]', err);
    return null;
  }
}

/**
 * 从 request 获取 Authorization（兼容不同 header 实现）
 */
function getAuthHeader(request) {
  if (!request || !request.headers) return '';

  // Fetch API 风格
  if (typeof request.headers.get === 'function') {
    return request.headers.get('authorization') || '';
  }

  // Node 风格
  return request.headers['authorization'] || request.headers['Authorization'] || '';
}

/**
 * 主函数：验证 JWT
 */
async function verifyToken(request, env) {
  const auth = getAuthHeader(request);
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const token = match[1];
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // ===== 解析 header / payload =====
  const header = decodeJson(headerB64);
  const payload = decodeJson(payloadB64);
  if (!header || !payload) return null;

  // ===== 强制算法（防攻击） =====
  if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

  // ===== 时间校验 =====
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now) return null;
  if (payload.iat && payload.iat > now + 60) return null;


  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }

  // ===== 签名验证 =====
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToUint8Array(signatureB64);

  const key = await getKey(secret);

  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!valid) return null;

  // ===== 自定义授权  =====
  if (env.JWT_USERS) {
    const users = env.JWT_USERS.split(',').map(s => s.trim());
    if (!payload.id || !users.includes(payload.id)) return null;
  }

  return payload;
}

module.exports = {
  verifyToken,
};