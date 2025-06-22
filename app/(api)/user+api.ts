import { neon } from '@neondatabase/serverless';


export async function POST(request:Request) {
  try {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const {name, email, clerkId, role} = await request.json();

  if(!name || !email || !clerkId || !role) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const response = await sql`
    INSERT INTO users(name, email, clerk_id, role)
    VALUES (${name}, ${email}, ${clerkId}, ${role})
    RETURNING id
  `;

   if (role === 'driver') {
      await sql`
        INSERT INTO drivers (user_id, car_image_url, car_seats, rating)
        VALUES (${response[0].id}, NULL, 4, 5.0)
      `;
    }
  
  return new Response(JSON.stringify({data: response}),{status:201})
  
    
  } catch (error:any) {
    console.log(error)
    return Response.json({error:error},{status:500})
  }
}