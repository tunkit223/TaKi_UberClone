import { neon } from "@neondatabase/serverless";

export async function PUT(req: Request) {

   const { userId, amount } = await req.json();

  if (!userId || !amount || isNaN(amount)) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
     const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    console.log(user.id);
    const [wallet] = await sql`
      SELECT id FROM wallet WHERE user_id = ${user.id}
    `;
    console.log(wallet.id);
     await sql`
        UPDATE wallet
        SET money = money + ${amount}
        WHERE user_id = ${user.id}
      `;

      const walletHistory =  await sql`
      INSERT INTO wallet_history (wallet_id, change_amount)
      VALUES (${wallet.id}, ${amount})
    `;
    if(!walletHistory) {
      throw new Error('Failed to create wallet history');
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}