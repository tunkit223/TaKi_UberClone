import { neon } from "@neondatabase/serverless";

export async function GET(req: Request, { id }: { id: string } ) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id}
    `;
    const money = await sql`SELECT money FROM wallet WHERE user_id = ${user.id}`;
    return Response.json(money[0]);
  } catch (err) {
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}