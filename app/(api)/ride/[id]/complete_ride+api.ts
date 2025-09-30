import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    const { rideId } = await request.json();
    if (!rideId) {
      return Response.json({ error: "Missing rideId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    await sql`
      UPDATE rides
      SET status = 'done',  payment_status = 'paid'
      WHERE id = ${rideId}
    `;
    const ride = await sql`SeLECT * FROM rides WHERE id = ${rideId}`;
    await sql`
        UPDATE wallet
        SET money = money - ${ride[0].fare_price}
        WHERE user_id = ${ride[0].user_id}
      `;
    const wallet= await sql`
      SELECT id FROM wallet WHERE user_id = ${ride[0].user_id}
    `;
      const walletHistory =  await sql`
      INSERT INTO wallet_history (wallet_id, change_amount)
      VALUES (${wallet[0].id}, ${-ride[0].fare_price})
    `;
    return Response.json({
      rideId: rideId,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
