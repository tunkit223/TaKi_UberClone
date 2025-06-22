import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const bookings = await sql`
      SELECT 
        b.id AS booking_id,
        b.status,
        r.*
      FROM bookings b
      INNER JOIN rides r ON b.ride_id = r.id
      WHERE b.status = 'unconfirm'
      ORDER BY r.created_at DESC
    `;

    const formatted = bookings.map((b) => ({
      id: b.booking_id,
      status: b.status,
      ride: {
        id: b.id,
        user_id: b.user_id,
        origin_address: b.origin_address,
        destination_address: b.destination_address,
        origin_latitude: b.origin_latitude,
        origin_longitude: b.origin_longitude,
        destination_latitude: b.destination_latitude,
        destination_longitude: b.destination_longitude,
        fare_price: b.fare_price,
        ride_time: b.ride_time,
        created_at: b.created_at,
      },
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Error fetching unconfirmed bookings:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
