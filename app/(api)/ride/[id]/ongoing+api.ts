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
     SELECT rides.id FROM rides 
     LEFT JOIN bookings ON bookings.ride_id = rides.id
     WHERE user_id = ${user.id} 
     AND bookings.status = 'confirm' 
     ORDER BY rides.created_at DESC
    LIMIT 1;
    `;
    return Response.json({
      rideId: ride.id,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



export async function PUT(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE rides
      SET status = 'ongoing'
      WHERE id = ${id}
    `;
    return Response.json({
      success: true,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}