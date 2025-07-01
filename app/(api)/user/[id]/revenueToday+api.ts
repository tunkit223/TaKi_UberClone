// File: app/(api)/user/[id]/revenueToday+api.ts
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Lấy user.id từ clerk_id
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${id};
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const todayResult = await sql`
      SELECT SUM(rides.fare_price) AS revenue_today
      FROM rides
      JOIN bookings ON bookings.ride_id = rides.id
      JOIN drivers ON bookings.driver_id = drivers.id
      WHERE drivers.user_id = ${user.id}
      AND rides.payment_status = 'paid'
      AND DATE(rides.created_at) = CURRENT_DATE;
    `;
    const monthResult = await sql`
      SELECT SUM(rides.fare_price) AS revenue_month
      FROM rides
      JOIN bookings ON bookings.ride_id = rides.id
      JOIN drivers ON bookings.driver_id = drivers.id
      WHERE drivers.user_id = ${user.id}
      AND rides.payment_status = 'paid'
      AND DATE_TRUNC('month', rides.created_at) = DATE_TRUNC('month', CURRENT_DATE);
    `;
      return Response.json({
      revenueToday: todayResult[0]?.revenue_today ?? 0,
      revenueMonth: monthResult[0]?.revenue_month ?? 0,
    });
  } catch (error) {
    console.error("Error fetching revenue today:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
