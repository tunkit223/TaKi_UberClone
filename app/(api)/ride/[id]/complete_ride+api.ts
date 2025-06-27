import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    const { rideId } = await request.json();
    if (!rideId) {
      return Response.json({ error: "Missing rideId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    await sql`
      UPDATE rides
      SET status = 'done',  payment_status = 'paid'
      WHERE id = ${rideId}
    `;
    return Response.json({
      rideId: rideId,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
