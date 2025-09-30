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
     const existingRides = await sql`
      SELECT id FROM rides
      WHERE user_id = ${user_id}
        AND status IN ('waiting', 'ongoing')
        AND created_at >= CURRENT_DATE
        AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `;
    
    if (existingRides.length > 0) {
      return Response.json(
        { error: "You already have a ride in progress. Please complete it first." },
        { status: 403 }
      );
    }
   
     const [wallet] = await sql`
      SELECT money FROM wallet WHERE user_id = ${user_id}
    `;

    if (!wallet) {
      return Response.json({ error: "Wallet not found" }, { status: 404 });
    }
  
    if (wallet.money < fare_price) {
      
      return Response.json(
        { error: "Insufficient wallet balance", current_balance: wallet.money },
        { status: 402 } // 402 Payment Required
      );
    }

 
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
    console.log("imhere done")
    return Response.json({ ride, booking }, { status: 201 });
  } catch (error: any) {
  console.error("Error inserting ride and booking:", error);
  return Response.json(
    {
      error: error?.message || "Internal Server Error",
      detail: error, // có thể xoá dòng này ở môi trường production
    },
    { status: 500 }
  );
}
}
