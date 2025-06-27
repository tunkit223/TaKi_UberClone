import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    
    const sql = neon(`${process.env.DATABASE_URL}`);

    const [booking] = await sql`
      SELECT 
        b.id AS booking_id,
        b.ride_id,
        b.status,
        b.requested_at,
        d.id AS driver_id,
        d.car_image_url,
        d.car_seats,
        d.rating,
        u.name AS driver_name,
        u.phone AS driver_phone,
        u.profile_image_url
      FROM bookings b
      JOIN drivers d ON b.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE b.ride_id = ${id};
    `;
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }
    console.log("Booking data from api:", booking);
    return Response.json({
      data: booking,
     
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
