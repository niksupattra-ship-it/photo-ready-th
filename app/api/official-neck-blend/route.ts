export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ยังไม่ได้ตั้งค่าคีย์ AI สำหรับเว็บไซต์" },
        { status: 503 },
      );
    }

    const input = await request.formData();
    const image = input.get("image");
    const mask = input.get("mask");

    if (!(image instanceof File) || !(mask instanceof File)) {
      return Response.json(
        { error: "ข้อมูลภาพสำหรับปรับคอไม่ครบ" },
        { status: 400 },
      );
    }

    const prompt = `
OFFICIAL UNIFORM NECK-BLEND ONLY — STRICT MASKED EDIT.

This image is already a finished composition using an EXACT REAL GOVERNMENT-UNIFORM TEMPLATE.
DO NOT redesign, regenerate, replace, resize, repaint, or reinterpret the uniform.

EDIT ONLY inside the transparent mask around:
- visible neck skin below the jaw,
- base of the neck,
- tiny collar/neck opening transition,
- at most a very small amount of collar edge needed to make the physical connection natural.

GOAL:
Make the original person's head and neck connect naturally and anatomically to the locked uniform template.
The result must look like one real professional studio photograph.

PRESERVE EXACTLY:
- the person's identity and facial geometry,
- eyes, nose, lips, jaw, ears, expression,
- original skin tone and natural skin texture,
- original hair, hairline, hairstyle, hair colour and hair texture,
- head size and head shape,
- all pixels outside the mask,
- shoulder placement,
- uniform silhouette,
- epaulettes,
- collar design except the tiny masked joining edge,
- ministry pins,
- chest insignia,
- ribbon bars,
- buttons,
- tie,
- fabric colour and texture,
- all government-uniform details.

NECK PROPORTION:
Use the existing head and the fixed template shoulders as anchors.
Make the neck centered below the jaw, naturally proportioned, and continuous into the collar.
Do not make the neck too thin, too long, too wide, detached, stretched, or beautified.
Do not change the head scale to solve the neck.
Do not change the uniform scale to solve the neck.

SKIN / LIGHT:
Match the existing face skin tone, exposure and white balance.
Preserve pores, fine lines and real skin texture.
No smoothing, whitening, makeup, face retouching, reshaping or beauty enhancement.

ABSOLUTE LOCK:
Outside the supplied transparent mask, preserve the image unchanged.
Do not create or alter background.
Do not change hairstyle.
Do not add earrings, jewelry, accessories, marks or foreign objects.
`;

    const body = new FormData();
    body.append("model", "gpt-image-1.5");
    body.append("image", image, image.name || "official-composite.png");
    body.append("mask", mask, mask.name || "neck-mask.png");
    body.append("prompt", prompt);
    body.append("input_fidelity", "high");
    body.append("quality", "high");
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
          : data.error?.message || "AI ปรับรอยต่อคอไม่สำเร็จ";
      return Response.json({ error: friendly }, { status: result.status });
    }

    const encoded = data.data?.[0]?.b64_json;
    if (!encoded) {
      return Response.json(
        { error: "AI ไม่ได้ส่งรูปภาพกลับมา" },
        { status: 502 },
      );
    }

    return Response.json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการปรับรอยต่อคอ",
      },
      { status: 500 },
    );
  }
}
