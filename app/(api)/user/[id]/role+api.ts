import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return Response.json({ error: "Missing clerk_id" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    const [user] = await sql`
      SELECT role
      FROM users
      WHERE clerk_id = ${id}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ role: user.role });

  } catch (error) {
    console.error("Error fetching user role:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
