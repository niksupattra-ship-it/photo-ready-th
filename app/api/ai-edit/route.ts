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
    const outfitId=String(input.get("outfitId")||"");
    const isOfficialTemplate=outfitId.startsWith("official-");
    const outfit=input.get("outfit");
    const officialMask=input.get("mask");
    if(!isOfficialTemplate&&!(outfit instanceof File))return Response.json({error:"ไม่พบชุดอ้างอิง"},{status:400});
    if(isOfficialTemplate&&!(officialMask instanceof File))return Response.json({error:"ไม่พบพื้นที่ปรับหัว/คอของชุดข้าราชการ"},{status:400});
    if(image.size>20*1024*1024)return Response.json({error:"รูปภาพต้องมีขนาดไม่เกิน 20 MB"},{status:413});
    let operations:string[]=[];
    try{operations=JSON.parse(String(input.get("operations")||"[]"));}catch{}
    const chosen=operations.filter(id=>LABELS[id]).map(id=>LABELS[id]);
    if(!chosen.length)return Response.json({error:"กรุณาเลือกรายการที่ต้องการปรับ"},{status:400});
    const hairVolume=String(input.get("hairVolume")||"คงเดิม");
    const outfitLabel=String(input.get("outfitLabel")||"ชุดที่เลือก");
    const outfitCategory=String(input.get("outfitCategory")||"");
    const isJobApplication=outfitCategory==="สมัครงาน";
    const skinStyle=String(input.get("skinStyle")||"ธรรมชาติ");
    const skinStrength=Math.max(0,Math.min(100,Number(input.get("skinStrength")||15)));
    const hairstyleRef=input.get("hairstyleRef");
    const requestedHairstyle=String(input.get("hairstyle")||"ทรงเดิม");
    const hairstyle=/^แบบ (?:0[1-9]|1\d|2[0-9])$/.test(requestedHairstyle)?requestedHairstyle:"ทรงเดิม";
    let volumeInstruction=operations.includes("hair-volume")?` Hair volume direction: ${hairVolume==="ลด"?"slightly reduce excessive volume":hairVolume==="เพิ่ม"?"slightly increase thin areas":"keep the current overall volume"}.`:"";
    const skinInstruction=operations.includes("skin-light")?` APPLY A VISIBLE LIGHTING RESULT. Natural-light preset: ${skinStyle}. The user selected ${skinStrength}% on a true 0–100 adjustment scale. ${skinStrength===0?"Make no lighting change.":skinStrength<=25?"Apply a gentle but visible exposure and white-balance correction.":skinStrength<=60?"Apply a clearly visible medium-strength exposure, white-balance, highlight, and shadow correction.":skinStrength<=85?"Apply a strong but realistic professional exposure and lighting correction with controlled highlights and opened shadows.":"Apply the maximum clearly visible professional lighting correction while keeping the result photographic and natural."} ${skinStyle==="สดใส"?"Create a clean, fresh, brighter camera exposure while keeping the original complexion; never whiten the skin.":skinStyle==="สตูดิโอ"?"Create balanced soft neutral studio illumination with natural facial depth and dimensional shadows.":"Create neutral true-to-life camera exposure and accurate white balance with the original complexion unchanged."} Preserve pores, fine lines, blemishes, under-eye detail, facial contrast, and every real skin feature. The change must be noticeable in overall luminosity and balance, but must come only from photographic light correction—never skin smoothing, denoising, repainting, makeup, reshaping, or face regeneration.`:"";
    volumeInstruction+=skinInstruction;
    const useHairstyleReference=operations.includes("hairstyle")&&hairstyle!=="ทรงเดิม"&&hairstyleRef instanceof File;
    const hairstyleInstruction=useHairstyleReference?` HAIRSTYLE REPLACEMENT LOCK — MANDATORY: image 3 is the selected hairstyle reference and must be treated as the authoritative target hairstyle. Replace the person's original hairstyle with the reference hairstyle itself, not a blend and not a variation of the original. Match image 3 as closely as anatomically possible in parting, front hairline styling, bangs/fringe, side shape, crown shape, volume, length, layers, tucked/untucked sections, tied/untied state, bun/updo/ponytail structure, direction, silhouette, and visible hair endpoints. IGNORE the original hairstyle length and arrangement from image 1 whenever they conflict with image 3. If image 1 has long hair but image 3 is short, tied, tucked, or fully gathered, REMOVE every visible long-hair remainder from behind the neck, shoulders, collar, chest, and back. Do not leave original long strands hanging behind the shoulders. If image 3 shows hair fully gathered or an updo, all original loose hair that would not exist in that style must disappear. If image 3 shows short hair, the final image must look genuinely short from all visible edges, with no hidden long-hair tails. If image 3 shows ears exposed, expose them naturally; if it shows ears partially covered, match that coverage. Never preserve the source hairstyle merely because it is present in image 1.

HAIR-ONLY TRANSFER: transfer ONLY hair design from image 3. Do not copy any face, forehead proportions, ears, skin, neck, clothing, jewelry, accessories, lighting, or background from image 3. Keep the exact original identity, face, forehead size, skull size, natural hairline position, ears, neck, and head angle from image 1. Adapt the target hairstyle to the real head anatomy without changing identity. Maintain realistic hair density, strand direction, root behavior, gravity, soft edge hairs, and natural volume. Apply a professional natural-black tone at 50% intensity, preserving realistic dark-brown and charcoal micro-variation and camera highlights; never make hair flat jet-black, plastic, painted, pasted, helmet-like, or wig-like. Do not cover the eyes or distort ears or face. Blend the finished hairstyle naturally around the head, neck, and shoulders.

HAIRSTYLE CONFLICT PRIORITY: when hairstyle replacement is requested, hairstyle-reference matching has priority over preserving the source hair shape, length, volume, and placement. Preserve only the person's identity and anatomy, not the original hairstyle. The final visible hair must be consistent with image 3 everywhere in the frame, with zero leftover source-hair geometry that contradicts the selected style.

EXACT SELECTED-STYLE CHECK — REQUIRED: the user explicitly selected ${hairstyle}. Image 3 is the actual reference file for that exact selected option. Before returning the result, compare the generated hair silhouette against image 3 and correct it if the parting, bangs/front section, side outline, crown volume, tied/untied state, length, or endpoints do not visibly match. Do not substitute a generic formal hairstyle and do not choose a nearby hairstyle. The selected image-3 hairstyle must be recognizable as the same hairstyle design after adaptation to the unchanged real face/head anatomy.`:"";
    volumeInstruction+=hairstyleInstruction;
    const outfitReferenceInstruction=isOfficialTemplate?`Image 2 is the MANDATORY LOCKED REAL GOVERNMENT-UNIFORM TEMPLATE (${outfitLabel}). Use this exact uniform as the fixed visual source of truth. DO NOT invent, redesign, simplify, regenerate, replace, restyle, recolor, or reinterpret the uniform. Preserve the exact shoulder/torso geometry, epaulettes, collar design, tie, ministry/collar insignia, chest insignia, ribbon bars, buttons, seams, fabric color, fabric texture, spacing, relative sizes, left/right placement, and all visible official details from image 2. Fit the PERSON from image 1 to the uniform template—not the uniform to the person. The only uniform pixels/shapes that may be adapted are the very small neck opening / collar-contact edges strictly necessary to connect the real person's neck naturally. Never alter epaulettes, pins, ribbons, badges, buttons, tie, lapels, sleeve shape, shoulder width, or torso silhouette.`:`Image 2 is clothing reference only: dress the person in ${outfitLabel} matching its collar, lapels, fabric, construction, silhouette, and proportions.`;

    const prompt=`Create one finished formal front-facing ID portrait. Image 1 is the absolute source of truth for the person. ${outfitReferenceInstruction} BACKGROUND ISOLATION PIPELINE — MANDATORY: do NOT create transparency and do NOT treat background removal as a generative edit. Render the edited person normally, then place the person on one perfectly flat solid CHROMA KEY background color #FF00FF (RGB 255,0,255), with no gradient, texture, shadow, vignette, scenery, or alternate hue. The website will remove this exact chroma color deterministically after the AI response. Therefore the chroma-background instruction must NEVER cause any change to the face, identity, expression, skin, skin texture, eyes, nose, lips, jaw, ears, neck, hair, hairstyle, clothing, body proportions, lighting on the person, or camera framing. Preserve the person exactly according to the identity/face locks below. Keep clean natural edges around fine hair strands, ears, shoulders, sleeves, and clothing; do not tint the person magenta and avoid chroma spill. ${chosen.join(" ")}${volumeInstruction} OUTFIT FRAMING LOCK: use the same consistent initial clothing scale for every outfit option. Compose as a true waist-up half-body portrait, regardless of how image 1 or image 2 is cropped. The complete visible person must run from the full head down to the natural waist/upper-hip area. Both shoulders and both upper arms must be present, with the arm silhouettes continuing downward naturally toward the elbows/forearms; do not cut the sleeves immediately below the shoulders. Keep the full left and right garment silhouette visible through the waist area, including lapels, collar, front opening, buttons/decorations, sleeve shape, and side seams. Image 2 supplies garment design only—NEVER copy its crop, camera distance, body size, head size, or framing. Leave generous transparent safety margin around the head, shoulders, and outfit. Do not zoom in to fill the frame; the user will enlarge and position the finished portrait afterward. ANATOMY AND SCALE LOCK: the unchanged head, neck, shoulders, and torso must belong to one naturally proportioned adult body at one uniform photographic scale. Never keep the head large while shrinking the body or outfit. If more garment must fit inside the canvas, zoom the entire person out uniformly, including the head, rather than narrowing or shrinking only the torso. Preserve a believable adult shoulder width relative to the head, a natural upper-body width and depth, and a neck whose width and length connect anatomically from the jaw to the shoulders. Keep both shoulders level but not unnaturally narrow. Do not create a child-sized, miniature, tapered, pin-headed, or oversized-headed body. ULTRA-STRICT FACE IDENTITY LOCK: image 1 is the only identity reference. Preserve the face as if it were a protected photographic layer that may only be moved or uniformly scaled with the head for framing; do not redraw, reinterpret, reconstruct, beautify, average, or regenerate it. Keep the exact facial width and height, forehead height, temple width, cheek volume, eye size and spacing, eyelid folds, eyebrow shape and spacing, nose bridge and nostril shape, philtrum, lip shape and thickness, smile curvature, chin length, jaw width, facial asymmetry, ear shape and position, age, complexion, pores, blemishes, fine lines, under-eye detail, makeup, highlights, shadows, and camera texture from image 1. Preserve the original expression exactly, including the amount of smile and eye openness. Do not make the face slimmer, rounder, younger, more symmetrical, more V-shaped, larger-eyed, sharper-nosed, fuller-lipped, paler, smoother, cleaner, or more conventionally attractive. Do not modify the hairline/forehead boundary unless a hairstyle operation explicitly requires hair replacement, and even then keep the original forehead size and hairline position. ACCESSORY / FOREIGN-OBJECT LOCK: Never invent, add, or hallucinate any accessory or foreign object that is absent from image 1. If image 1 has no earrings, the final image must have absolutely no earrings, ear studs, pearls, hoops, clips, or ear jewelry. Likewise, do not add necklaces, chains, pendants, brooches, pins, hair clips, headbands, glasses, facial jewelry, tattoos, moles, marks, decorative objects, or any other item not visibly present in image 1. Clothing reference images provide clothing construction only and must never introduce jewelry or accessories. Hairstyle references provide hair design only and must never introduce jewelry, ornaments, clips, or accessories. Preserve bare ears as bare ears when they are bare in image 1. Do not add any unexplained object to the face, ears, hair, neck, skin, clothing, or background. Treat the central face region from forehead through chin and both cheeks as NO-GENERATION / NO-RETOUCH territory. If recomposition is required for the fixed portrait distance, transform the whole head as one rigid photographic unit; never synthesize a new face to fit the new body. The only permitted face/skin change is a uniform whole-photo exposure and white-balance adjustment equivalent to camera RAW correction; it must not alter local skin texture, facial anatomy, or facial contrast. Center the entire proportionate head-and-torso unit, show the full head, connect the original neck naturally to the selected clothing, and preserve fine hair edges. The finished result must look like the same untouched real person photographed by a professional camera, not an AI-generated face attached to a different-sized body. PROFESSIONAL CAMERA DETAIL LOCK: render the finished photograph with crisp professional-camera micro-detail and natural optical sharpness comparable to a high-quality studio portrait. Increase perceived clarity only through realistic lens focus, clean edge definition, fine hair strands, eyelashes, eyebrow hairs, fabric weave, collar edges, and naturally resolved skin micro-texture. Preserve every real pore, fine line, blemish, subtle under-eye texture, natural tonal transition, tiny asymmetry, and original skin character from image 1. Do NOT smooth, airbrush, denoise away texture, over-sharpen halos, add fake pores, add plastic gloss, repaint skin, beautify, whiten, change makeup, or alter facial anatomy. Keep the face photorealistic and naturally detailed, as if captured in-focus by a professional camera and high-quality lens, not digitally beautified.`;
    const lockedFramingPrompt=` FINAL 3:4 WAIST-UP SAFE-FRAME LOCK — ABSOLUTE PRIORITY FOR EVERY GENERATED IMAGE. IGNORE the crop, zoom, camera distance, body coverage, head size, and framing of BOTH source image 1 and clothing reference image 2. They may be selfies, face close-ups, chest crops, passport photos, or full-body photos; none of that is allowed to determine final framing. Only use image 1 for identity/anatomy and image 2 for garment design. IMPORTANT PIPELINE FACT: the AI raw canvas is 1024x1536 (2:3), while the website final display/export is 3:4. Therefore compose the RAW AI image deliberately WIDER/FARTHER than the desired final crop: include the complete head, neck, shoulders, torso to at least the upper-hip / high-thigh safety area, and both arms continuously from shoulder through elbow and clearly into the forearm. Leave extra vertical safety margin so the later centered 3:4 crop can remove a small amount from top and bottom without cutting the head, waist, or arms.

MANDATORY FINAL COMPOSITION: generate a formal waist-up / true half-body studio portrait. The final person must be visible continuously from the TOP OF THE HAIR to the NATURAL WAIST / UPPER-HIP AREA. Both shoulders must be fully visible. Both upper arms must be fully visible and must continue downward naturally to at least the elbow region or lower forearm direction before leaving the frame; NEVER crop the arms directly under the shoulders. The lower edge of the canvas should intersect around the waist/upper-hip zone, NOT the upper chest and NOT the mid-torso. This is a medium waist-up portrait, not a headshot.

HARD NORMALIZED FRAME TARGETS for the generated 1024x1536 portrait: highest hair point around 6–9% from the top; chin around 29–34% of image height; shoulder line around 38–44%; elbows/forearm direction visibly extend through roughly 68–88%; natural waist/upper-hip area around 88–98%. Full head height from highest hair to chin should occupy only about 23–28% of total image height. The head must therefore look clearly smaller than a passport/headshot composition. Leave comfortable transparent safety space above the hair and outside both arms.

NO ARM CROPPING / NO CHEST-ONLY FAILURE: a result is INVALID if sleeves disappear immediately below the shoulders, if either upper arm is cut off at the biceps, if elbows are missing, if the bottom edge ends around the chest/ribcage, or if only head-and-shoulders are visible. In the RAW 2:3 AI canvas, show BOTH arms from shoulders through elbows and well into the forearms, with the arm/sleeve silhouettes continuing naturally toward the lower edge. Also show the torso beyond the natural waist into a small upper-hip/high-thigh safety zone. This extra body coverage is intentional because the website will center-crop the raw 2:3 image to final 3:4. When in doubt, move the virtual camera FARTHER AWAY and show MORE body and arm length, never less.

ONE-SCALE ANATOMY LOCK: preserve the real head and face from image 1, then scale the ENTIRE person—head, hairstyle, neck, shoulders, arms, torso, and clothing—together as one photographic unit. Never enlarge the head independently. Never shrink the body independently. Never use a small template torso under a large preserved head. If the selected hairstyle has extra height or volume, zoom the WHOLE PERSON OUT to keep the same waist-up coverage; do not let hairstyle replacement make the head appear larger in frame.

PROPORTION GUARDS: natural adult neck length about 0.33–0.50 head-length; male shoulders generally about 2.0–2.3 head-widths; female shoulders generally about 1.5–1.8 head-widths, adapted to the actual person. Torso width and arm thickness must continue naturally from those shoulders. Clothing must conform to the person's adult anatomy; anatomy must never be squeezed to fit the clothing template.

HAIRSTYLE + FRAMING INTERACTION: hairstyle image 3 controls hairstyle design only. After applying the selected hairstyle, keep the SAME waist-up camera distance and SAME small-in-frame head scale. Short/updo hairstyles must not cause the model to zoom in. Long hairstyles must not cause the model to crop the torso. The final visible person scale is fixed by this waist-up rule, independent of hairstyle.

CONSISTENCY ACROSS EVERY OPTION: every outfit, every hairstyle, every gender, and every uploaded source must use this same framing standard. The user may zoom closer later in the web UI, so the AI default must always be wider/farther rather than too close. Before returning the RAW 2:3 image, internally check: full head present with safe top margin, head not oversized, both shoulders present, both elbows visible, both forearms visibly continue downward, torso passes the waist into the upper-hip/high-thigh safety zone, and no chest-only crop. If any check fails, recompose farther out until all checks pass. The final website crop will then produce the intended clean 3:4 waist-up portrait with full arm continuity.`;
    const officialTemplateFramingPrompt=` OFFICIAL TEMPLATE GEOMETRY + PERSON-FIT LOCK — HIGHEST PRIORITY WHEN IMAGE 2 IS A GOVERNMENT-UNIFORM TEMPLATE.

DO NOT use the uploaded person's original camera distance, shoulder width, torso width, body crop, neck length, or body scale as the final composition reference. FIRST read the fixed geometry of image 2: collar opening center, collar height, shoulder line, shoulder width, epaulette placement, torso width, arm/sleeve boundaries, waist/lower garment extent, and the amount of margin around the real uniform. Treat those measurements as the fixed scaffold.

Then fit image 1's REAL head, identity, hair and neck into that scaffold:
- preserve the real face exactly under the same ULTRA-STRICT FACE IDENTITY LOCK used for job-application outfits;
- preserve original skin tone, pores, natural texture, expression, eyes, nose, lips, jaw, ears, face shape and professional-camera detail;
- preserve the selected hairstyle rules exactly as in the normal job-application workflow;
- uniformly scale and position the whole head/hair unit so it is naturally proportioned relative to the template's fixed shoulder width;
- OFFICIAL HEAD SCALE CORRECTION: after fitting to the template, reduce the COMPLETE head+hair unit by exactly about 15% relative to the previously/default fitted head scale (scale factor approximately 0.85), while keeping the face identity and internal facial proportions unchanged. Re-center the smaller head above the fixed collar opening and rebuild only the visible neck transition as needed. Do NOT shrink the government-uniform template, shoulders, torso, insignia, ribbons, tie, sleeves, or garment geometry. The 15% reduction applies to the entire head and selected hairstyle together, never to facial features independently;
- OFFICIAL TEMPLATE SAFE-FRAME LOCK: keep the government-uniform template design and proportions unchanged, but fit and center the COMPLETE fixed template so the full outer edge of BOTH sleeves/arms remains visible inside the 3:4 canvas from shoulder to the bottom boundary. Keep a small equal left/right safety margin. Never crop or clip either outer sleeve edge. Achieve this only by the minimum uniform whole-template fit/position adjustment; do not reshape the shoulders, torso, sleeves, insignia, ribbons, tie, buttons, or collar.
- HAIR OUTER-EDGE CLEANUP ONLY: refine only the OUTSIDE alpha boundary of the selected hairstyle. Remove blue, cyan, pink, purple, magenta or source-background fringe, halos, glow, hard cutout contours, and rectangular residue. Preserve natural fine flyaway hairs with soft anti-aliased alpha and preserve all internal hair texture, face, skin, lighting and selected hairstyle geometry unchanged. Do not blur or repaint the portrait.

- build a natural adult neck from the unchanged jaw down into the fixed collar opening;
- neck length should generally be about 0.33–0.50 of head length, adjusted naturally to the actual person and template;
- the neck must be centered, continuous, anatomically plausible, and must not flare into triangular shoulder/skin shapes;
- do not carry any original shirt, blouse, neckline, shoulders, chest or torso from image 1 into the result;
- do not create duplicate collars, double necks, detached skin wedges, visible source clothing, pasted-head edges, hard cutout outlines, black/transparent rectangles, or mismatched background blocks.

TEMPLATE MUST WIN:
If the person's original body proportions conflict with the uniform template, keep the UNIFORM TEMPLATE geometry unchanged and adapt only the person's head scale/vertical position and neck transition so the person looks naturally photographed wearing that exact uniform. Never stretch, crop, enlarge, shrink or distort the uniform template to accommodate a large head. Never enlarge the head independently. The completed head/neck must look naturally attached to the template shoulders.

OFFICIAL FRAMING:
Use image 2 as the primary guide for the uniform's visible scale and placement. Keep the complete official shoulder width, epaulettes and garment sides visible. Preserve the template's intended torso/waist coverage and do not crop away sleeves, insignia, ribbons or buttons. Add comfortable headroom above the fitted person's hair without changing the uniform's scale. The final composition must still be suitable for the existing 3:4 website crop/export and must include enough safety margin that no official-uniform detail is lost.

NECK/COLLAR PERMISSION — VERY LIMITED:
You MAY locally adjust only the visible skin neck and the immediate inner collar contact line so the connection is natural. You MAY slightly open/close the inner collar gap only where required by the real neck. You MUST NOT redesign the collar, lapels, tie or any insignia. The final result should look like the same untouched real person professionally photographed in the exact real government uniform shown in image 2.

FINAL SELF-CHECK BEFORE RETURN:
1) same person/face as image 1;
2) selected hairstyle correct, with no leftover contradictory source hair;
3) no original civilian clothing remains;
4) exact official details from image 2 remain visually unchanged;
5) shoulder/torso scale follows image 2;
6) head is not oversized;
7) neck is natural and centered;
8) no duplicated collar or skin wedge;
9) complete uniform edges/details remain inside frame;
10) only a flat chroma-key background surrounds the person.`;

    const officialPersonOnlyPrompt=`OFFICIAL GOVERNMENT PORTRAIT — SINGLE MASKED EDIT.

IMPORTANT: IMAGE 1 ALREADY CONTAINS THE EXACT REAL GOVERNMENT-UNIFORM TEMPLATE in the correct final framing. The uniform outside the transparent edit mask is LOCKED and must remain unchanged.

EDITABLE AREA:
You may edit ONLY the transparent mask covering:
- the real person's complete head and selected/original hairstyle,
- ears when naturally visible,
- jaw-to-neck transition,
- natural neck,
- and only the immediate INNER collar contact area needed to make the neck fit naturally.

DO NOT modify outside the mask. DO NOT recreate or redesign the government uniform. DO NOT change epaulettes, ministry/collar insignia, ribbon bars, tie, buttons, lapels, sleeves, shoulder width, torso shape, fabric colour, or garment framing.

PRIMARY GOAL:
Make the person look naturally photographed wearing THIS EXACT visible uniform. Balance the selected/original HAIR and the NECK relative to the fixed visible shoulders and collar. The central face pixels are protected by the mask and are the immutable photographic identity source. Do not attempt to regenerate, reinterpret or replace the face. The final anatomy must resemble a professional formal portrait, not a pasted head.

HEAD / BODY PROPORTION:
- the website has already placed the REAL face at a deliberately smaller formal-portrait scale before this edit;
- the protected face size and position are FINAL: DO NOT enlarge, shrink, move, regenerate or reshape the locked face;
- use the fixed visible shoulder width and collar only to shape the editable hairstyle and neck naturally AROUND that locked face;
- do not create a larger skull/face around the protected face;
- keep comfortable headroom and side margin;
- preserve the COMPLETE selected/original hairstyle: no circular crop, no chopped sides, no missing back hair, no artificial straight or rounded cut boundary.

NECK:
Create a continuous natural neck from the unchanged LOCKED jaw into the visible real collar.
Use the locked face width and the visible collar opening to choose a realistic neck width.
Keep the neck centered and anatomically continuous; do not expose shoulders or civilian clothing.
Neck length should generally be about 0.33–0.50 of head length where anatomically appropriate.
Extend the lower neck far enough behind the collar so the real template can overlap it naturally in final compositing.
No blue/magenta gap, no floating head, no detached neck, no triangular skin wedge, no horizontal cut line and no pasted-head seam.

COLLAR PERMISSION — LIMITED BUT ACTIVE:
You MAY reshape ONLY the immediate INNER collar/neck opening inside the transparent mask so the real neck enters the uniform naturally. Open it slightly, close it slightly, or change the local curve/angle as needed for anatomical fit. The edit must look like the same real uniform tailored around this neck, with a seamless photographic junction.

ABSOLUTELY LOCKED UNIFORM DETAILS:
Do NOT alter, move, redraw, regenerate, recolor or replace epaulettes/shoulder boards, ministry or collar insignia, pins, ribbon bars, medals, tie body, buttons, sleeves, outer lapels, shoulder width, torso silhouette, fabric texture, or overall uniform framing. Outside the immediate inner-collar contact zone, the government-uniform template is immutable.

IDENTITY LOCK — ABSOLUTE:
The protected face/jaw in image 1 is the ONLY real face and must remain the same photograph. Preserve exact eyes, eyelids, brows, nose, nostrils, lips, smile, cheeks, jaw, chin, facial asymmetry, complexion, pores, blemishes, fine lines, under-eye detail, makeup, highlights and shadows. No beautification, whitening, smoothing, age change, face replacement, face reconstruction or identity transfer.

NEVER create a second face, face-shaped patch, oval skin layer, duplicate jaw, duplicate cheeks, or reconstructed face around/over the protected original. The transition from editable hair/neck into the protected original face must occur only at natural boundaries such as hairline and jaw-to-neck anatomy. If the selected hairstyle reference contains another face, ignore that face completely.

${useHairstyleReference?`IMAGE 2 is the EXACT selected hairstyle (${hairstyle}). Transfer HAIR ONLY. Match its parting, bangs/front shape, crown volume, side silhouette, tied/untied state, length, layers, ear exposure and EVERY visible endpoint. The hairstyle reference is NOT a person reference: never copy its face, age, head shape, skin, eyes, nose, lips, jaw, ears, neck, clothing, accessories or lighting. Remove contradictory source-hair remnants, but build the selected hair around the locked original face.`:`Keep the original hairstyle from image 1 exactly.`}

HAIR EDGE:
Keep the complete hairstyle inside the frame with natural fine strands and soft edges. No clipping, halo, glow, magenta/blue/cyan fringe, rectangular residue or hard cutout line.

SKIN / LIGHT:
${skinInstruction || "Preserve the original skin tone, lighting and natural skin texture."}
${chosen.filter((_, index)=>operations[index]!=="shoulders").join(" ")}
${volumeInstruction}

FINAL CHECK:
1) exact same person;
2) selected hairstyle correct when requested;
3) head/hair proportion balanced against the fixed real shoulders;
4) natural continuous neck into collar;
5) no pasted-head appearance;
6) uniform outside mask unchanged;
7) no newly invented government-uniform details.`;


    const body=new FormData();
    body.append("model","gpt-image-1.5");
    body.append("image[]",image,image.name||"portrait.png");
    if(isOfficialTemplate&&officialMask instanceof File){
      body.append("mask",officialMask,officialMask.name||"official-mask.png");
    }
    if(!isOfficialTemplate&&outfit instanceof File){
      body.append("image[]",outfit,outfit.name||"outfit-reference.png");
    }
    if(useHairstyleReference&&hairstyleRef instanceof File){
      body.append("image[]",hairstyleRef,hairstyleRef.name||"hairstyle-reference.png");
    }
    body.append("prompt",isOfficialTemplate?officialPersonOnlyPrompt:prompt+lockedFramingPrompt);
    body.append("input_fidelity","high");
    body.append(
      "quality",
      isOfficialTemplate || isJobApplication ? "medium" : "high",
    );
    body.append("output_format","png");
    body.append("size",isOfficialTemplate?"1024x1024":"1024x1536");
    body.append("n","1");
    const result=await fetch("https://api.openai.com/v1/images/edits",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body});
    const data=await result.json() as {data?:Array<{b64_json?:string}>;error?:{message?:string;code?:string};usage?:unknown};
    if(!result.ok){const code=data.error?.code;const friendly=code==="insufficient_quota"?"เครดิต AI ไม่เพียงพอ กรุณาตรวจสอบยอดคงเหลือ":data.error?.message||"บริการ AI ไม่สามารถปรับภาพได้";return Response.json({error:friendly},{status:result.status});}
    const encoded=data.data?.[0]?.b64_json;
    if(!encoded)return Response.json({error:"AI ไม่ได้ส่งรูปภาพกลับมา"},{status:502});
    console.info("[PhotoID /api/ai-edit usage]", data.usage ?? "usage-not-returned");
    return Response.json({image:`data:image/png;base64,${encoded}`,usage:data.usage});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"เกิดข้อผิดพลาดในการปรับภาพ"},{status:500});}
}
