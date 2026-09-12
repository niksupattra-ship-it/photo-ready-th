# ติดตั้ง “รูปพร้อมใช้” บน Render

1. สร้าง Repository ใหม่ใน GitHub ชื่อ `photo-ready-th`
2. อัปโหลดไฟล์ทั้งหมดใน ZIP นี้เข้า Repository
3. ที่ Render เลือก **New > Blueprint** แล้วเชื่อม Repository `photo-ready-th`
4. Render จะอ่านไฟล์ `render.yaml` และสร้าง Web Service ให้โดยอัตโนมัติ
5. เมื่อระบบถามค่า `OPENAI_API_KEY` ให้วางคีย์ที่เก็บไว้ แล้วบันทึกเป็น Secret
6. รอจนสถานะเป็น **Live** แล้วเปิด URL ที่ Render แสดง

ห้ามใส่ API Key ลงในไฟล์หรืออัปโหลด API Key เข้า GitHub
