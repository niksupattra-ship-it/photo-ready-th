export const runtime = "nodejs";

const LABELS:Record<string,string>={
  neck:"Make the visible neck anatomically balanced, centered under the face, naturally proportioned, and blend the neck skin seamlessly with the face.",
  shoulders:"Level the left and right shoulders naturally while keeping realistic posture and body proportions.",
  flyaways:"Remove only distracting flyaway and stray hairs while preserving the hairstyle.",
  "hair-volume":"Adjust hair volume as requested, symmetrically and naturally without changing the hairline or face.",
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
    const outfit=input.get("outfit");
    if(!(outfit instanceof File))return Response.json({error:"ไม่พบชุดอ้างอิง"},{status:400});
    if(image.size>20*1024*1024)return Response.json({error:"รูปภาพต้องมีขนาดไม่เกิน 20 MB"},{status:413});
    let operations:string[]=[];
    try{operations=JSON.parse(String(input.get("operations")||"[]"));}catch{}
    const chosen=operations.filter(id=>LABELS[id]).map(id=>LABELS[id]);
    if(!chosen.length)return Response.json({error:"กรุณาเลือกรายการที่ต้องการปรับ"},{status:400});
    const hairVolume=String(input.get("hairVolume")||"คงเดิม");
    const outfitLabel=String(input.get("outfitLabel")||"ชุดที่เลือก");
    const background=String(input.get("background")||"#1682ee");
    const volumeInstruction=operations.includes("hair-volume")?` Hair volume direction: ${hairVolume==="ลด"?"slightly reduce excessive volume":hairVolume==="เพิ่ม"?"slightly increase thin areas":"keep the current overall volume"}.`:"";
    const prompt=`Create one finished formal front-facing ID portrait. Image 1 is the person and is the absolute identity reference. Image 2 is clothing reference only: dress the person in ${outfitLabel} matching its collar, lapels, fabric, and proportions. Use a clean solid background color ${background}. ${chosen.join(" ")}${volumeInstruction} Preserve the face from image 1 exactly: identical facial structure, eyes, eyebrows, nose, lips, expression, age, skin texture, and recognizable features. Do not beautify or replace the face. Center the head and torso, show the full head and shoulders, and connect the neck naturally to the selected clothing. Return a finished studio portrait, not a layered mockup.`;
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
