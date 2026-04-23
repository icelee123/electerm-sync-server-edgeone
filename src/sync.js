
const { verifyToken } = require('./jwt');

/**
 * PUT /api/sync - Write sync data
 */
export async function onRequestPut (context) {
  const { request, env } = context

  const auth = await verifyToken(request, env)
  if (!auth) {
    return new Response('invalid token...', { status: 401 })
  }

  const body = await request.json()
  const str = JSON.stringify(body || {})

  await __KV_BIND_VAR__.put(auth.id, str)
  console.log('💾 Data written for user:', auth.id, '- Size:', str.length, 'bytes')

  return new Response('ok', { status: 200 })
}

/**
 * POST /api/sync - Test connection
 */
export async function onRequestPost (context) {
  const { request, env } = context

  const auth = await verifyToken(request, env)
  if (!auth) {
    return new Response('invalid token...', { status: 401 })
  }

  console.log('🔗 Connection test from user:', auth.id)

  return new Response('test ok', { status: 200 })
}

/**
 * GET /api/sync - Read sync data
 */
export async function onRequestGet (context) {
  const { request, env } = context

  const auth = await verifyToken(request, env)
  if (!auth) {
    return new Response('invalid token...', { status: 401 })
  }

  const data = await __KV_BIND_VAR__.get(auth.id, { type: 'text' })

  if (data !== null) {
    console.log('📖 Data read for user:', auth.id, '- Size:', data.length, 'bytes')
    return new Response(data, {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } else {
    console.log('📖 No data found for user:', auth.id, '- Returning empty object')
    return new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }
}
