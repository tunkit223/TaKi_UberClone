import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      fare_price,
      payment_status,
      status,
      user_id,
    } = body;

    if (
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !fare_price ||
      !payment_status ||
      !status ||
      !user_id
    ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
  
    const [ride] = await sql`
      INSERT INTO rides (
        origin_address,
        destination_address,
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        ride_time,
        fare_price,
        payment_status,
        status,
        user_id
      ) VALUES (
        ${origin_address},
        ${destination_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_latitude},
        ${destination_longitude},
        ${ride_time},
        ${fare_price},
        ${payment_status},
        ${status || "waiting"},
        ${user_id}
      )
      RETURNING *;
    `;


    const [booking] = await sql`
      INSERT INTO bookings (
        ride_id,
        status
      ) VALUES (
        ${ride.id},
        'unconfirm'
      ) RETURNING *;
    `;

    return Response.json({ ride, booking }, { status: 201 });
  } catch (error) {
    console.error("Error inserting ride and booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
