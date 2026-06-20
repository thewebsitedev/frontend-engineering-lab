// Lightweight liveness probe used by deploy.sh's blue/green health check.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ status: 'ok' })
}
