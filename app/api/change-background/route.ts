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

    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("image[]", image, image.name || "portrait.png");
    body.append(
      "prompt",
      `Produce a clean transparent-background PNG of the exact same person in the exact same selected outfit and hairstyle. Remove only the background. Preserve identity, face, facial geometry, expression, eyes, eyebrows, nose, lips, ears, hair design, clothing design, skin texture, pores, blemishes, complexion, exposure, highlights, shadows, color temperature, white balance, and lighting exactly as the source. Never retouch, smooth, beautify, whiten, recolor, relight, add makeup, or create plastic-looking skin or fabric. Preserve realistic fine hair strands and soft anti-aliased boundaries around hair, ears, neck, shoulders, sleeves, and clothing; remove halos, color spill, jagged edges, and leftover background pixels. Keep the complete left and right shoulder lines and both upper arms fully visible inside the 3:4 frame with a small, even safe margin on both sides. No sleeve, arm, shoulder, lapel, or garment edge may touch or be cut by either side of the canvas. When fitting is necessary, scale the whole subject uniformly and proportionally as one unit and keep it centered; never stretch, squeeze, widen, narrow, or independently resize any body part. Ensure natural adult ID-photo proportions: the head must not look oversized and the torso must not look narrow or miniature. Keep the head unchanged; if correction is needed, extend or proportion the shoulders and upper torso below the neck naturally so the shoulder width, neck, head, and torso are balanced. Do not crop or enlarge the head. Keep the full head, shoulders, and upper arms visible. If proportions and margins are already natural, do not change them. Everything except background removal and strictly necessary below-neck proportion correction or uniform whole-subject fitting must remain unchanged.`,
    );
    body.append("input_fidelity", "high");
    body.append("quality", "high");
    body.append("background", "transparent");
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
          : data.error?.message || "บริการแยกพื้นหลังไม่พร้อมใช้งาน";
      return Response.json({ error: friendly }, { status: result.status });
    }
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded)
      return Response.json(
        { error: "AI ไม่ได้ส่งรูปโปร่งใสกลับมา" },
        { status: 502 },
      );
    return Response.json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการแยกพื้นหลัง",
      },
      { status: 500 },
    );
  }
}
