export const runtime = "nodejs";

const LABELS:Record<string,string>={
  neck:"Make the visible neck anatomically balanced, centered under the face, naturally proportioned, and blend the neck skin seamlessly with the face.",
  shoulders:"Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:"Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":"Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
  hairstyle:"Change only the hairstyle to match the supplied hairstyle reference.",
  "skin-light":"Correct lighting, white balance, and skin tone naturally and consistently across face, ears, and neck. Retain real skin texture.",
  "hair-edge":"Refine the outer hair edges with realistic fine strands and clean professional-photo separation; avoid hard or cut-out edges.",
};

export async function POST(request:Request){
  try{
    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey)return Response.json({error:"ยังไม่ได้ตั้งค่าคีย์ AI สำหรับเว็บไซต์"},{status:503});
    const input=await request.formData();
    const image=input.get("image");
    if(!(image instanceof File))return Response.json({error:"ไม่พบไฟล์รูปภาพ"},{status:400});
    if(image.size>20*1024*1024)return Response.json({error:"รูปภาพต้องมีขนาดไม่เกิน 20 MB"},{status:413});
    let operations:string[]=[];
    try{operations=JSON.parse(String(input.get("operations")||"[]"));}catch{}
    const chosen=operations.filter(id=>LABELS[id]).map(id=>LABELS[id]);
    if(!chosen.length)return Response.json({error:"กรุณาเลือกรายการที่ต้องการปรับ"},{status:400});
    const hairVolume=String(input.get("hairVolume")||"คงเดิม");
    const hairstyleRef=input.get("hairstyleRef");
    const hairstyleOnly=operations.length===1&&operations[0]==="hairstyle"&&hairstyleRef instanceof File;
    const volumeInstruction=operations.includes("hair-volume")?` Hair volume direction: ${hairVolume==="ลด"?"slightly reduce excessive volume":hairVolume==="เพิ่ม"?"slightly increase thin areas":"keep the current overall volume"}.`:"";
    const prompt=hairstyleOnly?`Edit image 1 in place, using image 2 only as the hairstyle reference. Change only the hair to match the reference's parting, outline, length, direction, and arrangement. Preserve the exact original face, identity, expression, skin, ears, eyebrows, eyes, nose, lips, jaw, neck, shoulders, clothing, background, lighting, canvas dimensions, crop, camera perspective, person scale, head size, and every non-hair pixel. Do not crop, zoom, move, reshape, beautify, or regenerate the person. Adapt the hairstyle naturally to the existing head with realistic individual strands, roots, density, gravity, and soft camera highlights; never plastic, painted, pasted, helmet-like, or wig-like. The result must look like the same genuine photograph with only the hairstyle changed.`:`Edit this formal front-facing ID portrait with restrained professional retouching. ${chosen.join(" ")}${volumeInstruction} CRITICAL: preserve the person's identity exactly—same facial structure, eyes, eyebrows, nose, lips, expression, age, and recognizable features. Do not beautify, reshape, replace, or regenerate the face. Keep camera angle, crop, clothing, and background unchanged. Make only the requested corrections. The result must look like a genuine studio photograph, not AI-generated.`;
    const body=new FormData();
    body.append("model","gpt-image-1.5");body.append("image[]",image,image.name||"portrait.png");if(hairstyleOnly)body.append("image[]",hairstyleRef,hairstyleRef.name||"hairstyle.png");body.append("prompt",prompt);body.append("input_fidelity","high");body.append("quality","medium");body.append("output_format","png");body.append("size","1024x1536");body.append("n","1");
    const result=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body});
    const data=await result.json() as {data?:Array<{b64_json?:string}>;error?:{message?:string;code?:string}};
    if(!result.ok){const code=data.error?.code;const friendly=code==="insufficient_quota"?"เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ":data.error?.message||"บริการ AI ไม่สามารถปรับภาพได้";return Response.json({error:friendly},{status:result.status});}
    const encoded=data.data?.[0]?.b64_json;
    if(!encoded)return Response.json({error:"AI ไม่ได้ส่งรูปภาพกลับมา"},{status:502});
    return Response.json({image:`data:image/png;base64,${encoded}`});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"เกิดข้อผิดพลาดในการปรับภาพ"},{status:500});}
}
