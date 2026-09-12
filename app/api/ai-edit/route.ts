export const runtime = "nodejs";

const LABELS:Record<string,string>={
  neck:"Make the visible neck anatomically balanced, centered under the face, naturally proportioned, and blend the neck skin seamlessly with the face.",
  shoulders:"Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:"Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":"Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
  "skin-light":"Correct only exposure, white balance, and uneven color cast across the face, ears, and neck. Keep the person's original complexion and natural tonal variation. Preserve visible pores, fine lines, small blemishes, under-eye detail, facial micro-texture, and realistic highlights and shadows. Do not smooth, blur, whiten, brighten, airbrush, beautify, or add makeup.",
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
    const prompt=`Create one finished formal front-facing ID portrait with the restrained realism of an unretouched professional DSLR studio photograph. Image 1 is the person and is the absolute identity and skin reference. Image 2 is clothing reference only: dress the person in ${outfitLabel} matching its collar, lapels, fabric, and proportions. Use a clean solid background color ${background}. ${chosen.join(" ")}${volumeInstruction} Preserve the face from image 1 exactly: identical facial structure, eyes, eyebrows, nose, lips, expression, age, complexion, skin texture, and recognizable features. Skin must remain photographic and human, with natural pores, fine facial texture, subtle tonal variation, realistic highlights, shadows, and normal asymmetry visible. Apply no beauty filter, skin smoothing, airbrushing, porcelain or waxy skin, whitening, artificial glow, extra makeup, enlarged eyes, reshaping, or facial regeneration. Do not erase natural lines or small skin details. Match the face, ears, and neck naturally without making them uniformly flat or overly bright. Center the head and torso, show the full head and shoulders, connect the neck naturally to the selected clothing, and preserve fine hair edges. Keep realistic camera detail without oversharpening. Return one seamless finished professional studio photograph, not a layered mockup and not an AI-stylized portrait.`;
    const body=new FormData();
    body.append("model","gpt-image-1.5");body.append("image[]",image,image.name||"portrait.png");body.append("image[]",outfit,outfit.name||"outfit-reference.png");body.append("prompt",prompt);body.append("input_fidelity","high");body.append("quality","medium");body.append("output_format","png");body.append("size","1024x1536");body.append("n","1");
    const result=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body});
    const data=await result.json() as {data?:Array<{b64_json?:string}>;error?:{message?:string;code?:string}};
    if(!result.ok){const code=data.error?.code;const friendly=code==="insufficient_quota"?"เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ":data.error?.message||"บริการ AI ไม่สามารถปรับภาพได้";return Response.json({error:friendly},{status:result.status});}
    const encoded=data.data?.[0]?.b64_json;
    if(!encoded)return Response.json({error:"AI ไม่ได้ส่งรูปภาพกลับมา"},{status:502});
    return Response.json({image:`data:image/png;base64,${encoded}`});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"เกิดข้อผิดพลาดในการปรับภาพ"},{status:500});}
}
