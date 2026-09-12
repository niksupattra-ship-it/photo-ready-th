export const runtime = "nodejs";

const LABELS:Record<string,string>={
  neck:"Make the visible neck anatomically correct for this adult: centered under the jaw, naturally proportioned in width and length, and connected continuously to both the unchanged head and the shoulders. Never make the neck too thin, too long, detached, or mismatched in scale.",
  shoulders:"Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:"Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":"Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
  "skin-light":"Adjust only the overall photographic exposure and white balance uniformly, as a camera RAW correction. The face and all skin are protected, locked source regions: copy their original detail from image 1 without retouching or reconstruction. Do not change complexion, texture, pores, blemishes, fine lines, under-eye detail, makeup, highlights, shadows, or facial contrast.",
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
    const volumeInstruction=operations.includes("hair-volume")?` Hair volume direction: ${hairVolume==="ลด"?"slightly reduce excessive volume":hairVolume==="เพิ่ม"?"slightly increase thin areas":"keep the current overall volume"}.`:"";
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
