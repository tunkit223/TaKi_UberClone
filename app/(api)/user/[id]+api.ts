import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Truy vấn thông tin user theo clerk_id
    const [user] = await sql`
      SELECT 
        id,
        clerk_id,
        first_name,
        last_name,
        phone,
        profile_image_url,
        role
      FROM users
      WHERE clerk_id = ${id}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let driver = null;

    // Nếu user là driver, truy vấn thêm thông tin
    if (user.role === 'driver') {
      const [driverData] = await sql`
        SELECT 
          car_seats,
          car_image_url,
          rating
        FROM drivers
        WHERE user_id = ${user.id}
      `;
      driver = driverData || null;
    }

    return Response.json({ data: { ...user, driver } });

  } catch (error) {
    console.error("Error fetching user info:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, {id}: { id: string }) {
 
  const body = await request.json();

  if (!id) {
    return Response.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

   
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Cập nhật bảng users
    await sql`
      UPDATE users SET
        first_name = ${body.first_name},
        last_name = ${body.last_name},
        phone = ${body.phone},
        profile_image_url = ${body.profile_image_url}
      WHERE clerk_id = ${id}
    `;

    
    if (body.driver) {
      await sql`
        UPDATE drivers SET
          car_seats = ${body.driver.car_seats},
          car_image_url = ${body.driver.car_image_url}
        WHERE user_id = ${userId}
      `;
    }

    return Response.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}