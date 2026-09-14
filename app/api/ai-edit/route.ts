export const runtime = "nodejs";

const LABELS: Record<string, string> = {
  neck: "Create a natural anatomically correct neck under the unchanged jaw.",
  shoulders: "Keep posture natural; do not generate shoulders in template-person mode.",
  flyaways: "Remove only distracting flyaway hairs while preserving the intended hairstyle.",
  "hair-volume": "Adjust hair volume naturally without changing the face or hairline.",
  hairstyle: "Change only the hairstyle to the supplied hairstyle reference.",
  "skin-light": "Balance exposure and white balance only; preserve real skin texture and complexion.",
  "hair-edge": "Refine only the outer hair edge with natural fine strands.",
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "ยังไม่ได้ตั้งค่าคีย์ AI สำหรับเว็บไซต์" }, { status: 503 });

    const input = await request.formData();
    const image = input.get("image");
    if (!(image instanceof File)) return Response.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
    if (image.size > 20 * 1024 * 1024) return Response.json({ error: "รูปภาพต้องมีขนาดไม่เกิน 20 MB" }, { status: 413 });

    const outfitId = String(input.get("outfitId") || "");
    const outfitLabel = String(input.get("outfitLabel") || "ชุดที่เลือก");
    const outfitCategory = String(input.get("outfitCategory") || "");
    const templatePersonMode = String(input.get("templatePersonMode") || "") === "1";
    const outfit = input.get("outfit");
    const officialMask = input.get("mask");
    const isOfficial = outfitId.startsWith("official-");

    let operations: string[] = [];
    try { operations = JSON.parse(String(input.get("operations") || "[]")); } catch {}
    const selectedOps = operations.filter((id) => LABELS[id]).map((id) => LABELS[id]);
    if (!selectedOps.length) selectedOps.push(LABELS.neck, LABELS["hair-edge"]);

    const hairVolume = String(input.get("hairVolume") || "คงเดิม");
    const skinStyle = String(input.get("skinStyle") || "ธรรมชาติ");
    const skinStrength = Math.max(0, Math.min(100, Number(input.get("skinStrength") || 15)));
    const hairstyleRef = input.get("hairstyleRef");
    const requestedHairstyle = String(input.get("hairstyle") || "ทรงเดิม");
    const useHairRef = operations.includes("hairstyle") && requestedHairstyle !== "ทรงเดิม" && hairstyleRef instanceof File;

    const hairInstruction = useHairRef
      ? `IMAGE 2 is the exact selected HAIRSTYLE reference (${requestedHairstyle}). Transfer HAIR ONLY. Match parting, fringe, side silhouette, crown volume, length, tied/untied state, ear exposure and all visible endpoints. Remove source-hair geometry that contradicts IMAGE 2. Never copy IMAGE 2's face, skin, head shape, neck, clothing, accessories, lighting or background.`
      : "Keep IMAGE 1's original hairstyle exactly, except for explicitly selected small hair cleanup operations.";

    const lightInstruction = operations.includes("skin-light")
      ? `Photographic light matching only: preset ${skinStyle}, strength ${skinStrength}/100. DO NOT retouch or regenerate facial skin. Preserve the uploaded face pixels, pores, blemishes, fine lines, natural unevenness and exact complexion. Match any newly created neck skin TO the face; never change the face to match the neck.`
      : "Preserve the source face skin exactly. Any generated neck skin must match the original face tone, texture, exposure and white balance.";

    const identityLock = `IDENTITY LOCK — ABSOLUTE: IMAGE 1 is the real user and is the only identity source. The face is CAMERA-ORIGINAL CONTENT, not a generation target. Preserve the exact same eyes, eyelids, eye spacing, eyebrows, nose, nostrils, lips, cheeks, jaw, chin, ears, facial asymmetry, age, complexion, pores, blemishes, fine lines, expression and head shape. Do not beautify, average, reshape, repaint, reconstruct, relight, smooth, whiten, sharpen, denoise or substitute the face. Do not invent jewelry or accessories. The result must read as the same real professional photograph, never as a synthetic AI portrait.`;

    const personOnlyPrompt = `PROFESSIONAL ID PHOTO — PERSON LAYER FOR EXACT TEMPLATE COMPOSITING.

${identityLock}

The website will place the exact selected outfit template (${outfitLabel}) AFTER this AI call. Therefore return ONLY the person's complete HEAD, HAIR, EARS and a natural NECK. Do NOT generate any clothing, shoulders, chest, torso, collar, lapels, tie, uniform, insignia, arms or hands.

FACE PROTECTION:
Treat the protected face as immutable photographic pixels. Do not redraw or reinterpret facial skin, eyes, eyebrows, nose, mouth, cheeks or facial geometry. Build only editable hair and neck around that exact face. The website will restore original face pixels again after compositing.

${hairInstruction}

NECK:
Create one continuous adult neck from the unchanged jaw down far enough to sit naturally behind a real shirt/suit collar. Keep it centered and anatomically proportional. No floating head, detached neck, triangular skin wedge, duplicated jaw or hard horizontal cut.

${lightInstruction}
${selectedOps.join(" ")}
Hair volume direction: ${hairVolume}.

EDGE / BACKGROUND:
Keep complete hair with comfortable margin. Natural fine hair strands, no hard cutout edge. Outside head/hair/ears/neck use one perfectly flat temporary chroma background #FF00FF. No gradient, scenery, shadow, clothing or body.

FINAL CHECK: same real person; unchanged face identity; complete hairstyle; natural neck; no clothing/shoulders; flat #FF00FF background.`;

    const fullCompositePrompt = `PROFESSIONAL ID PHOTO EDIT.
${identityLock}
IMAGE 2 is the selected outfit reference (${outfitLabel}). Preserve its garment design faithfully while fitting it naturally to IMAGE 1. Keep full shoulders/arms visible and create realistic neck/collar contact. ${hairInstruction} ${lightInstruction} ${selectedOps.join(" ")} Output a centered professional 3:4 half-body portrait on a flat #FF00FF temporary background.`;

    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("image[]", image, image.name || "portrait.png");

    if (isOfficial && officialMask instanceof File) {
      body.append("mask", officialMask, officialMask.name || "official-mask.png");
    }

    if (!templatePersonMode) {
      if (!(outfit instanceof File)) return Response.json({ error: "ไม่พบชุดอ้างอิง" }, { status: 400 });
      body.append("image[]", outfit, outfit.name || "outfit-reference.png");
    }
    if (useHairRef && hairstyleRef instanceof File) {
      body.append("image[]", hairstyleRef, hairstyleRef.name || "hairstyle-reference.png");
    }

    body.append("prompt", templatePersonMode ? personOnlyPrompt : fullCompositePrompt);
    body.append("input_fidelity", "high");
    body.append("quality", outfitCategory === "สมัครงาน" || isOfficial ? "medium" : "high");
    body.append("output_format", "png");
    body.append("size", templatePersonMode ? "1024x1024" : "1024x1536");
    body.append("n", "1");

    const result = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });
    const data = await result.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string; code?: string }; usage?: unknown };
    if (!result.ok) {
      const friendly = data.error?.code === "insufficient_quota"
        ? "เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ"
        : data.error?.message || "บริการ AI ไม่สามารถปรับภาพได้";
      return Response.json({ error: friendly }, { status: result.status });
    }
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded) return Response.json({ error: "AI ไม่ได้ส่งรูปภาพกลับมา" }, { status: 502 });
    console.info("[PhotoID /api/ai-edit usage]", data.usage ?? "usage-not-returned");
    return Response.json({ image: `data:image/png;base64,${encoded}`, usage: data.usage, mode: templatePersonMode ? "person-template" : "full" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการปรับภาพ" }, { status: 500 });
  }
}
