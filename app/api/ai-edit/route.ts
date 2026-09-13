export const runtime = "nodejs";

const LABELS:Record<string,string>={
  neck:"Make the visible neck anatomically correct for this adult: centered under the jaw, naturally proportioned in width and length, and connected continuously to both the unchanged head and the shoulders. Never make the neck too thin, too long, detached, or mismatched in scale.",
  shoulders:"Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:"Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":"Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
  hairstyle:"Change only the hairstyle according to the selected style while preserving the person's face, identity, head shape, forehead, ears, and natural hairline.",
  "skin-light":"Perform an effective, clearly visible professional camera-lighting correction across the whole photograph while preserving the original face and real skin texture. Correct exposure, white balance, highlight recovery, and shadow balance without smoothing, repainting, whitening, beautifying, or changing facial anatomy.",
  "hair-edge":"Refine the outer hair edges with realistic fine strands and clean professional-photo separation; avoid hard or cut-out edges.",
};

export async function POST(request:Request){
  try{
    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey)return Response.json({error:"ยังไม่ได้ตั้งค่าคีย์ AI สำหรับเว็บไซต์"},{status:503});
    const input=await request.formData();
    const image=input.get("image");
    if(!(image instanceof File))return Response.json({error:"ไม่พบไฟล์รูปภาพ"},{status:400});
    const outfit=input.get("outfit");
    if(!(outfit instanceof File))return Response.json({error:"ไม่พบชุดอ้างอิง"},{status:400});
    if(image.size>20*1024*1024)return Response.json({error:"รูปภาพต้องมีขนาดไม่เกิน 20 MB"},{status:413});
    let operations:string[]=[];
    try{operations=JSON.parse(String(input.get("operations")||"[]"));}catch{}
    const chosen=operations.filter(id=>LABELS[id]).map(id=>LABELS[id]);
    if(!chosen.length)return Response.json({error:"กรุณาเลือกรายการที่ต้องการปรับ"},{status:400});
    const hairVolume=String(input.get("hairVolume")||"คงเดิม");
    const outfitLabel=String(input.get("outfitLabel")||"ชุดที่เลือก");
    const background=String(input.get("background")||"#1976d2");
    const skinStyle=String(input.get("skinStyle")||"ธรรมชาติ");
    const skinStrength=Math.max(0,Math.min(100,Number(input.get("skinStrength")||15)));
    const hairstyleChoices=["คงทรงเดิม","รวบต่ำสุภาพ","ผมตรงประบ่า","บ๊อบสุภาพ","รองทรงสุภาพ","แสกข้างสุภาพ"];
    const requestedHairstyle=String(input.get("hairstyle")||"คงทรงเดิม");
    const hairstyle=hairstyleChoices.includes(requestedHairstyle)?requestedHairstyle:"คงทรงเดิม";
    let volumeInstruction=operations.includes("hair-volume")?` Hair volume direction: ${hairVolume==="ลด"?"slightly reduce excessive volume":hairVolume==="เพิ่ม"?"slightly increase thin areas":"keep the current overall volume"}.`:"";
    const skinInstruction=operations.includes("skin-light")?` APPLY A VISIBLE LIGHTING RESULT. Natural-light preset: ${skinStyle}. The user selected ${skinStrength}% on a true 0–100 adjustment scale. ${skinStrength===0?"Make no lighting change.":skinStrength<=25?"Apply a gentle but visible exposure and white-balance correction.":skinStrength<=60?"Apply a clearly visible medium-strength exposure, white-balance, highlight, and shadow correction.":skinStrength<=85?"Apply a strong but realistic professional exposure and lighting correction with controlled highlights and opened shadows.":"Apply the maximum clearly visible professional lighting correction while keeping the result photographic and natural."} ${skinStyle==="สดใส"?"Create a clean, fresh, brighter camera exposure while keeping the original complexion; never whiten the skin.":skinStyle==="สตูดิโอ"?"Create balanced soft neutral studio illumination with natural facial depth and dimensional shadows.":"Create neutral true-to-life camera exposure and accurate white balance with the original complexion unchanged."} Preserve pores, fine lines, blemishes, under-eye detail, facial contrast, and every real skin feature. The change must be noticeable in overall luminosity and balance, but must come only from photographic light correction—never skin smoothing, denoising, repainting, makeup, reshaping, or face regeneration.`:"";
    volumeInstruction+=skinInstruction;
    const hairstyleInstruction=operations.includes("hairstyle")&&hairstyle!=="คงทรงเดิม"?` HAIRSTYLE CHANGE: create a ${hairstyle} hairstyle suitable for a formal Thai ID or application photograph. Change hair only. Keep the exact original face, identity, forehead size, skull size, natural hairline position, ears, neck, and head angle. Make the hairstyle anatomically balanced with the person's real head and face shape, symmetrical where appropriate, realistically rooted at the scalp, and naturally proportioned in width, height, length, and volume. Preserve individual fine strands and realistic density at the hairline and outer edges. The result must look like real professionally groomed human hair, not a wig, helmet, pasted layer, illustration, or synthetic AI hair. Do not cover the eyes or distort the ears and face. Blend the selected style naturally behind the neck and shoulders.`:"";
    volumeInstruction+=hairstyleInstruction;
    const prompt=`Create one finished formal front-facing ID portrait. Image 1 is the absolute source of truth for the person. Image 2 is clothing reference only: dress the person in ${outfitLabel} matching its collar, lapels, fabric, construction, silhouette, and proportions. Use a clean solid background color ${background}. ${chosen.join(" ")}${volumeInstruction} OUTFIT FRAMING LOCK: use the same consistent initial clothing scale for every outfit option. Compose slightly wider than a finished ID crop so the complete visible outfit from both outer shoulder edges through the lower chest or waist is inside the canvas, following the full garment coverage shown in image 2. Keep both sleeves, lapels, collar, front opening, decorations, and the full left and right garment silhouette visible without cutting them against the side or bottom edges. Leave generous solid-background margin around the head, shoulders, and outfit. Do not zoom in to fill the frame; the user will enlarge and position the finished portrait afterward. ANATOMY AND SCALE LOCK: the unchanged head, neck, shoulders, and torso must belong to one naturally proportioned adult body at one uniform photographic scale. Never keep the head large while shrinking the body or outfit. If more garment must fit inside the canvas, zoom the entire person out uniformly, including the head, rather than narrowing or shrinking only the torso. Preserve a believable adult shoulder width relative to the head, a natural upper-body width and depth, and a neck whose width and length connect anatomically from the jaw to the shoulders. Keep both shoulders level but not unnaturally narrow. Do not create a child-sized, miniature, tapered, pin-headed, or oversized-headed body. CRITICAL FACE LOCK: preserve the entire face, forehead, ears, and visible skin from image 1 exactly as photographed. Treat those pixels as protected source material, not areas to redesign, regenerate, retouch, restore, or beautify. Keep the identical facial geometry, expression, eyes, eyebrows, nose, lips, jaw, age, complexion, pores, blemishes, fine lines, under-eye detail, makeup, natural asymmetry, highlights, shadows, and camera texture. Do not smooth, denoise, blur, airbrush, whiten, brighten the skin separately, add glow, add makeup, remove marks, sharpen facial features, or create porcelain, waxy, flawless, synthetic, illustrated, or AI-looking skin. The only permitted correction to the face and skin is a uniform whole-photo exposure and white-balance adjustment, equivalent to adjusting a camera RAW file; it must not change local skin texture or facial contrast. Center the entire proportionate head-and-torso unit, show the full head, connect the original neck naturally to the selected clothing, and preserve fine hair edges. The finished result must look like the same untouched real person photographed by a professional camera, not an AI-generated face attached to a different-sized body.`;
    const body=new FormData();
    body.append("model","gpt-image-1.5");body.append("image[]",image,image.name||"portrait.png");body.append("image[]",outfit,outfit.name||"outfit-reference.png");body.append("prompt",prompt);body.append("input_fidelity","high");body.append("quality","high");body.append("output_format","png");body.append("size","1024x1536");body.append("n","1");
    const result=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body});
    const data=await result.json() as {data?:Array<{b64_json?:string}>;error?:{message?:string;code?:string}};
    if(!result.ok){const code=data.error?.code;const friendly=code==="insufficient_quota"?"เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ":data.error?.message||"บริการ AI ไม่สามารถปรับภาพได้";return Response.json({error:friendly},{status:result.status});}
    const encoded=data.data?.[0]?.b64_json;
    if(!encoded)return Response.json({error:"AI ไม่ได้ส่งรูปภาพกลับมา"},{status:502});
    return Response.json({image:`data:image/png;base64,${encoded}`});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"เกิดข้อผิดพลาดในการปรับภาพ"},{status:500});}
}
