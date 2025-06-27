import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
   

    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
      UPDATE rides
      SET status = 'ongoing'
      WHERE id = ${id}
    `;
    return Response.json({
      success: true,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
