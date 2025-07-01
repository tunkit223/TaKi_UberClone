import { neon } from "@neondatabase/serverless";

export async function GET(request: Request,  {id} : {id:string}  ) {


  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    
    const result = await sql`
      SELECT
        rides.id,
        rides.origin_address,
        rides.destination_address,
        rides.origin_latitude,
        rides.origin_longitude,
        rides.destination_latitude,
        rides.destination_longitude,
        rides.ride_time,
        rides.fare_price,
        rides.payment_status,
        rides.status,
        rides.created_at,
        users.first_name,
        users.last_name,
        drivers.car_seats
      FROM rides
      LEFT JOIN bookings ON bookings.ride_id = rides.id
      LEFT JOIN drivers ON drivers.id = bookings.driver_id
      LEFT JOIN users ON users.id = drivers.user_id
      WHERE drivers.user_id = ${user.id} AND rides.payment_status = 'paid'
      ORDER BY rides.created_at DESC
      LIMIT 5;
    `;
    

    return Response.json({data: result});
  } catch (error) {
    console.error("Error fetching rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
