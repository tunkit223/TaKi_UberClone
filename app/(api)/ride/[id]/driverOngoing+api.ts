import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }
  
  try {
 
    const sql = neon(`${process.env.DATABASE_URL}`);
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id}
    `;
     const [ride] = await sql`
     SELECT rides.id 
     FROM rides
      LEFT JOIN bookings ON bookings.ride_id = rides.id
      LEFT JOIN drivers ON drivers.id = bookings.driver_id
      LEFT JOIN users ON users.id = drivers.user_id
      WHERE drivers.user_id = ${user.id} AND rides.payment_status = 'unpaid'
     ORDER BY rides.created_at DESC
    LIMIT 1;
    `;
    return Response.json({
      rideId: ride.id,
    });
  } catch (error) {
    console.error("Error confirming bookingggg:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}