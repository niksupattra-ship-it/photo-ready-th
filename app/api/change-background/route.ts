export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      return Response.json(
        { error: "ยังไม่ได้ตั้งค่าคีย์ AI สำหรับเว็บไซต์" },
        { status: 503 },
      );

    const input = await request.formData();
    const image = input.get("image");
    if (!(image instanceof File))
      return Response.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
    if (image.size > 20 * 1024 * 1024)
      return Response.json(
        { error: "รูปภาพต้องมีขนาดไม่เกิน 20 MB" },
        { status: 413 },
      );

    const background = String(input.get("background") || "#1682ee");
    if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(background))
      return Response.json({ error: "รหัสสีพื้นหลังไม่ถูกต้อง" }, { status: 400 });

    const prompt = `Replace only the existing background with one perfectly even, solid ${background} background. Preserve the person exactly pixel-faithfully: do not alter or regenerate the face, identity, expression, skin, skin texture, hair, hairstyle, ears, neck, shoulders, clothing, body proportions, lighting, crop, position, or image sharpness. Carefully preserve natural individual hair strands and smooth anti-aliased edges around the hair, ears, shoulders, and clothing. Remove every trace, outline, color fringe, and halo from the old background. Do not add shadows, gradients, texture, objects, or scenery. The only permitted change is the background color.`;
    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("image[]", image, image.name || "v3-portrait.png");
    body.append("prompt", prompt);
    body.append("input_fidelity", "high");
    body.append("quality", "medium");
    body.append("output_format", "png");
    body.append("size", "1024x1536");
    body.append("n", "1");

    const result = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
    const data = (await result.json()) as {
      data?: Array<{ b64_json?: string }>;
      error?: { message?: string; code?: string };
    };
    if (!result.ok) {
      const friendly =
        data.error?.code === "insufficient_quota"
          ? "เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ"
          : data.error?.message || "บริการ AI ไม่สามารถเปลี่ยนพื้นหลังได้";
      return Response.json({ error: friendly }, { status: result.status });
    }
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded)
      return Response.json({ error: "AI ไม่ได้ส่งรูปภาพกลับมา" }, { status: 502 });
    return Response.json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเปลี่ยนพื้นหลัง",
      },
      { status: 500 },
    );
  }
}
