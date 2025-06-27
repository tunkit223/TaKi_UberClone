import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return Response.json({ error: "Missing clerk_id" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    // Lấy user.id từ clerk_id
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerk_id}
    `;
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Lấy driver.id từ user.id
    const [driver] = await sql`
      SELECT id FROM drivers WHERE user_id = ${user.id}
    `;
    if (!driver) {
      return Response.json({ error: "Driver not found" }, { status: 404 });
    }

    // Lấy ride_id từ booking trước khi cập nhật
    const [booking] = await sql`
      SELECT ride_id FROM bookings WHERE id = ${id}
    `;
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Cập nhật booking
    await sql`
      UPDATE bookings
      SET status = 'confirm',
          driver_id = ${driver.id}
      WHERE id = ${id}
    `;
    return Response.json({
      rideId: booking.ride_id,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
