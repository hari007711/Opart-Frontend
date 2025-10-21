export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || null,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET, // true or false
  });
}
