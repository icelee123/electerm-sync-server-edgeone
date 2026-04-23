/**
 * GET /api/test - Health check
 */
export async function onRequestGet (context) {
  return new Response('ok', { status: 200 })
}
