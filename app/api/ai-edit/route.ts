export const runtime = "nodejs";

const LABELS: Record<string, string> = {
  outfit: "Change the clothing to match the supplied outfit reference exactly while preserving the person.",
  neck: "Make the visible neck anatomically balanced, centered under the face, naturally proportioned, and blend the neck skin seamlessly with the face.",
  shoulders:
    "Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:
    "Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":
    "Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
  hairstyle:
    "Change only the hairstyle to match the supplied hairstyle reference.",
  "hair-edge":
    "Refine the outer hair edges with realistic fine strands and clean professional-photo separation; avoid hard or cut-out edges.",
};

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
    let operations: string[] = [];
    try {
      operations = JSON.parse(String(input.get("operations") || "[]"));
    } catch {}
    const chosen = operations
      .filter((id) => LABELS[id])
      .map((id) => LABELS[id]);
    if (!chosen.length)
      return Response.json(
        { error: "กรุณาเลือกรายการที่ต้องการปรับ" },
        { status: 400 },
      );
    const hairVolume = String(input.get("hairVolume") || "คงเดิม");
    const outfit = input.get("outfit");
    const outfitChange = operations.includes("outfit") && outfit instanceof File;
    const outfitLabel = String(input.get("outfitLabel") || "ชุดที่เลือก");
    const hairstyleRef = input.get("hairstyleRef");
    const hairstyleOnly =
      operations.length === 1 &&
      operations[0] === "hairstyle" &&
      hairstyleRef instanceof File;
    const volumeInstruction = operations.includes("hair-volume")
      ? ` Hair volume direction: ${hairVolume === "ลด" ? "slightly reduce excessive volume" : hairVolume === "เพิ่ม" ? "slightly increase thin areas" : "keep the current overall volume"}.`
      : "";
    const prompt = hairstyleOnly
      ? `Edit image 1 using image 2 exclusively as the hairstyle design reference. HAIR-ONLY EDIT: replace only the existing hair pixels and the minimum necessary immediately adjacent hair-edge pixels. Match image 2 as faithfully as possible in parting position, fringe or exposed forehead, silhouette, length, layers, volume, direction, tuck behind ears, tied or loose arrangement, and strand flow. Do not substitute a generic hairstyle. Fit that exact hairstyle naturally to the person's unchanged skull and original face shape: contour the hair around the existing forehead, temples, cheeks, jaw, and ears without moving, narrowing, widening, reshaping, covering, or regenerating any facial feature. Preserve realistic individual strands, roots, density, gravity, flyaways, and natural camera highlights; never plastic, painted, pasted, helmet-like, or wig-like. ABSOLUTE PIXEL LOCK OUTSIDE HAIR: preserve the exact original identity, face, expression, facial geometry, skin and texture, complexion, ears, eyebrows, eyes, nose, lips, jaw, head size, neck, shoulders, arms, body proportions, selected outfit, fabric, pose, transparent background, lighting, exposure, shadows, white balance, canvas dimensions, crop, camera perspective, position, and person scale. Never retouch, smooth, brighten, whiten, recolor, relight, denoise, add makeup, beautify, crop, zoom, move, resize, or regenerate any non-hair area. The output must be the same genuine photograph with only the selected hairstyle changed.`
      : outfitChange
        ? `Create one finished formal front-facing ID portrait. Image 1 is the absolute source of truth for the person. Image 2 is clothing reference only: dress the person in ${outfitLabel}, matching its collar, lapels, fabric, construction, silhouette, and proportions. Preserve the source background unchanged; background removal is performed separately without generative AI. ${chosen.join(" ")}${volumeInstruction} ABSOLUTE FACE, SKIN, AND LIGHTING LOCK: preserve the entire face and every visible skin area from image 1, including exact identity, facial geometry, expression, pores, blemishes, fine lines, complexion, exposure, highlights, shadows, color temperature, white balance, and illumination. Treat the face and skin as locked source pixels. Never retouch, smooth, blur, airbrush, brighten, whiten, recolor, relight, denoise, add makeup, beautify, repaint, or regenerate face or skin. Preserve the hair and head size. Change only the clothing and the minimum necessary collar/neck boundary. COMPOSITION LOCK: show the complete left and right shoulder lines and both upper arms fully inside the frame with a small, even safe margin on both sides. No sleeve, arm, shoulder, lapel, or garment edge may touch or be cut by the left or right canvas edge. Fit the complete person-and-outfit composition into the existing canvas by applying only one uniform proportional scale to the whole subject when necessary; never stretch, squeeze, widen, narrow, or independently resize the head, face, neck, shoulders, arms, or torso. Keep the subject centered. Keep the head, neck, shoulders, outfit, and torso at one uniform natural adult photographic scale. Never make the head oversized or the body narrow or miniature. Preserve the canvas, camera perspective, and background. The outfit must show realistic woven fabric, seams, folds, depth, and non-uniform camera highlights—never plastic, illustrated, or synthetic. The result must look like the same real person genuinely photographed wearing the selected outfit.`
        : `Edit this formal front-facing ID portrait only as explicitly requested. ${chosen.join(" ")}${volumeInstruction} ABSOLUTE FACE, SKIN, AND LIGHTING LOCK: preserve identity, facial structure, expression, age, every skin pixel and texture, complexion, exposure, highlights, shadows, color temperature, white balance, and illumination exactly. Never retouch, smooth, blur, airbrush, brighten, whiten, recolor, relight, denoise, add makeup, beautify, reshape, replace, or regenerate face or skin. Keep camera angle, crop, clothing, background, and all unrelated pixels unchanged. The result must look like the same genuine photograph, not AI-generated.`;
    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("image[]", image, image.name || "portrait.png");
    if (outfitChange)
      body.append("image[]", outfit, outfit.name || "outfit-reference.png");
    else if (hairstyleOnly)
      body.append(
        "image[]",
        hairstyleRef,
        hairstyleRef.name || "hairstyle.png",
      );
    body.append("prompt", prompt);
    body.append("input_fidelity", "high");
    body.append("quality", "high");
    if (hairstyleOnly) body.append("background", "transparent");
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
      const code = data.error?.code;
      const friendly =
        code === "insufficient_quota"
          ? "เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ"
          : data.error?.message || "บริการ AI ไม่สามารถปรับภาพได้";
      return Response.json({ error: friendly }, { status: result.status });
    }
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded)
      return Response.json(
        { error: "AI ไม่ได้ส่งรูปภาพกลับมา" },
        { status: 502 },
      );
    return Response.json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการปรับภาพ",
      },
      { status: 500 },
    );
  }
}
