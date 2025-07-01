import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const result = await sql`
      SELECT
        rides.id,
        rides.user_id,
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
        rides.created_at
      FROM 
        rides
      WHERE 
        rides.id = ${id}
      LIMIT 1;
    `;

    if (result.length === 0) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error fetching ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}