import { neon } from "@neondatabase/serverless";

export async function GET(req: Request, { id }: { id: string } ) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id}
    `;
     const [wallet] = await sql`
      SELECT id FROM wallet WHERE user_id = ${user.id}
    `;
    const wallethistory = 
        await sql`SELECT * FROM wallet_history 
        WHERE wallet_id = ${wallet.id} 
        ORDER BY changed_at DESC
       LIMIT 10;`;
    return Response.json(wallethistory);
  } catch (err) {
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}