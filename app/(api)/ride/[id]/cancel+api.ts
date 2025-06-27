import { neon } from '@neondatabase/serverless';


// Khởi tạo kết nối
const sql = neon(process.env.DATABASE_URL!);

export async function DELETE(request: Request, { id }: { id: string }) {

  if (!id) {
    return Response.json({ error: 'Thiếu rideId' }, { status: 400 });
  }

  try {
    // Kiểm tra ride có tồn tại không
    const checkRide = await sql`
      SELECT * FROM rides WHERE id = ${id};
    `;

    if (checkRide.length === 0) {
      return Response.json({ error: 'Không tìm thấy chuyến đi' }, { status: 404 });
    }

    // Xóa ride (booking sẽ bị xóa do ON DELETE CASCADE)
    await sql`
      DELETE FROM rides WHERE id = ${id};
    `;

    return Response.json({ success: true, message: 'Đã hủy chuyến đi thành công' });
  } catch (err: any) {
    console.error('Lỗi khi hủy ride:', err);
    return Response.json({ error: 'Lỗi server khi hủy chuyến đi' }, { status: 500 });
  }
}
