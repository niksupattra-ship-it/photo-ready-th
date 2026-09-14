"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  Grid2X2,
  Image as ImageIcon,
  LoaderCircle,
  Maximize2,
  RotateCcw,
  Save,
  Scissors,
  Settings,
  SlidersHorizontal,
  Upload,
  UserRound,
  WandSparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const outfits = [
  { id: "job-women-polite", label: "สูทหญิงสุภาพ", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-suit-women-real.png", tone: "suit" },
  { id: "job-women-open", label: "สูทหญิงคอเปิด", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-suit-open-01.png", tone: "suit" },
  { id: "job-women-wide", label: "สูทหญิงปกกว้าง", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-suit-open-02.png", tone: "suit" },
  { id: "job-women-mandarin", label: "สูทหญิงคอจีน", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-suit-tie.png", tone: "suit" },
  { id: "job-men-polite", label: "สูทชายสุภาพ", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-suit-men-real.png", tone: "suit" },
  { id: "job-men-open", label: "สูทชายคอเปิด", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-navy-suit-tie-men.png", tone: "suit" },
  { id: "job-white-women", label: "เสื้อขาวหญิง", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-white-shirt-women.png", tone: "student" },
  { id: "job-white-men", label: "เสื้อขาวชาย", sub: "สมัครงาน", category: "สมัครงาน", image: "/templates/job-white-shirt-men.png", tone: "student" },
  { id: "women-suit", label: "สูทหญิง", sub: "ข้าราชการ", category: "ข้าราชการ", image: "/templates/women-suit.png", tone: "suit" },
  { id: "men-suit", label: "สูทชาย", sub: "ข้าราชการ", category: "ข้าราชการ", image: "/templates/men-suit.png", tone: "suit" },
  { id: "women-student", label: "นักเรียนหญิง", sub: "นักเรียน", category: "นักเรียน", image: "/templates/women-student.png", tone: "student" },
  { id: "men-student", label: "นักเรียนชาย", sub: "นักเรียน", category: "นักเรียน", image: "/templates/men-student.png", tone: "student" },
  { id: "women-university", label: "นักศึกษาหญิง", sub: "นักศึกษา", category: "นักศึกษา", image: "/templates/women-university.png", tone: "student" },
  { id: "men-university", label: "นักศึกษาชาย", sub: "นักศึกษา", category: "นักศึกษา", image: "/templates/men-university.png", tone: "student" },
];
const steps = ["อัปโหลดรูป", "เลือกประเภท", "เลือกชุด", "ปรับภาพ", "ดาวน์โหลด"];
const aiOptions = [
  { id: "neck", label: "ปรับคอให้สมดุล", detail: "คอรับกับใบหน้า ไม่ลอย" },
  { id: "shoulders", label: "ปรับระดับไหล่", detail: "ไหล่ซ้าย–ขวาได้ระดับ" },
  { id: "flyaways", label: "เก็บผมชี้", detail: "ลบเส้นผมที่ชี้ฟู" },
  {
    id: "hair-volume",
    label: "ปรับความหนาผม",
    detail: "ลดหรือเพิ่มอย่างเป็นธรรมชาติ",
  },
  {
    id: "hairstyle",
    label: "เปลี่ยนทรงผม",
    detail: "เลือกทรงสุภาพด้วย AI",
  },
  {
    id: "skin-light",
    label: "ปรับแสงให้สมดุล",
    detail: "คงผิวและใบหน้าเดิมทั้งหมด",
  },
  {
    id: "hair-edge",
    label: "ทำขอบผมให้เนียน",
    detail: "เก็บขอบละเอียด ไม่แข็ง",
  },
];
const hairstyleOptions = [
  { id: "original", label: "ทรงเดิม", image: null, previewImage: null },
  ...Array.from({ length: 29 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `hair-${number}`,
      label: `แบบ ${number}`,
      image: `/hairstyles/hair-${number}.png`,
      previewImage: `/hairstyle-previews/hair-${number}.png`,
    };
  }),
];

function Control({
  label,
  value,
  min = -20,
  max = 20,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="control-row">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output>
        {value}
        {suffix}
      </output>
    </label>
  );
}


function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
  } | null>(null);
  const [original, setOriginal] = useState("/demo/original.png");
  const [baseOriginal, setBaseOriginal] = useState("/demo/original.png");
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [aiBaseImage, setAiBaseImage] = useState<string | null>(null);
  const [aiComposited, setAiComposited] = useState(false);
  const [cutout, setCutout] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [aiSelected, setAiSelected] = useState<string[]>(
    aiOptions.map((o) => o.id),
  );
  const [hairVolume, setHairVolume] = useState<"ลด" | "คงเดิม" | "เพิ่ม">(
    "คงเดิม",
  );
  const [skinStyle, setSkinStyle] = useState<
    "ธรรมชาติ" | "สดใส" | "สตูดิโอ"
  >("ธรรมชาติ");
  const [skinStrength, setSkinStrength] = useState(15);
  const [hairstyle, setHairstyle] = useState("original");
  const [processMessage, setProcessMessage] = useState("");
  const [selected, setSelected] = useState("job-women-polite");
  const [outfitCategory, setOutfitCategory] = useState("สมัครงาน");
  const [beforeState, setBefore] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState<string | null>(null);
  const [comparePreparing, setComparePreparing] = useState(false);
  const compareMode = aiComposited && beforeState;
  const showOriginalOnly = !aiComposited && beforeState;
  const [zoom, setZoom] = useState(100);
  const [x, setX] = useState(0),
    [y, setY] = useState(0),
    [head, setHead] = useState(75),
    [neck, setNeck] = useState(0),
    [hair, setHair] = useState(0),
    [skin, setSkin] = useState(0);
  const [bg, setBg] = useState("#1682ee");
  const [saved, setSaved] = useState(false);
  const outfit = outfits.find((o) => o.id === selected) ?? outfits[0];
  const visibleOutfits = outfits.filter((o) => o.category === outfitCategory);
  const shownSrc = cutout ?? original;
  function reset() {
    setX(0);
    setY(0);
    setHead(75);
    setNeck(0);
    setHair(0);
    setSkin(0);
    setZoom(100);
  }
  async function auto() {
    setProcessMessage("กำลังตรวจตำแหน่งใบหน้า…");
    try {
      const [{ FilesetResolver, FaceDetector }, img] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = original;
        }),
      ]);
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.55,
      });
      const face = detector.detect(img).detections[0]?.boundingBox;
      detector.close();
      if (!face)
        throw new Error("ไม่พบใบหน้า กรุณาใช้รูปหน้าตรงที่เห็นใบหน้าชัด");
      const centerX = (face.originX + face.width / 2) / img.naturalWidth;
      const centerY = (face.originY + face.height / 2) / img.naturalHeight;
      const idealZoom = Math.max(
        75,
        Math.min(120, Math.round(38 / (face.height / img.naturalHeight))),
      );
      setX(Math.round((0.5 - centerX) * 260));
      setY(Math.round((0.34 - centerY) * 260));
      setZoom(idealZoom);
      setHead(76);
      setNeck(0);
      setHair(0);
      setSkin(3);
      setProcessMessage("จัดใบหน้าเข้ากรอบเรียบร้อย");
    } catch (e) {
      setProcessMessage(
        e instanceof Error ? e.message : "วิเคราะห์ใบหน้าไม่สำเร็จ",
      );
    }
  }
  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setBaseOriginal(url);
      setOriginal(url);
      setHasUploadedImage(true);
      setAiBaseImage(null);
      setAiComposited(false);
      setCompareOriginal(null);
      setBefore(false);
      setCutout(null);
      setProcessMessage("");
    }
  }
  function toggleAi(id: string) {
    setAiSelected((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  }
  async function makeTransparentCutout(
    src: string,
    sourceBackground?: string,
  ) {
    const [{ FilesetResolver, ImageSegmenter }, img] = await Promise.all([
      import("@mediapipe/tasks-vision"),
      new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = src;
      }),
    ]);
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
    );
    const segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      },
      runningMode: "IMAGE",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
    const result = segmenter.segment(img);
    const mask = result.confidenceMasks?.[0];
    if (!mask) {
      segmenter.close();
      throw new Error("ไม่พบตัวบุคคล");
    }
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) {
      mask.close();
      segmenter.close();
      throw new Error("เปิดพื้นที่ประมวลผลไม่ได้");
    }
    const matte = maskCtx.createImageData(mask.width, mask.height);
    const values = mask.getAsFloat32Array();
    for (let i = 0; i < values.length; i++) {
      const normalized = Math.max(0, Math.min(1, (values[i] - 0.04) / 0.9));
      const smooth = normalized * normalized * (3 - 2 * normalized);
      matte.data[i * 4] = 255;
      matte.data[i * 4 + 1] = 255;
      matte.data[i * 4 + 2] = 255;
      matte.data[i * 4 + 3] = Math.round(smooth * 255);
    }
    maskCtx.putImageData(matte, 0, 0);

    const alphaCanvas = document.createElement("canvas");
    alphaCanvas.width = img.naturalWidth;
    alphaCanvas.height = img.naturalHeight;
    const alphaCtx = alphaCanvas.getContext("2d");
    if (!alphaCtx) {
      mask.close();
      segmenter.close();
      throw new Error("เปิดพื้นที่ประมวลผลไม่ได้");
    }
    alphaCtx.imageSmoothingEnabled = true;
    alphaCtx.imageSmoothingQuality = "high";
    alphaCtx.filter = "blur(1.25px)";
    alphaCtx.drawImage(
      maskCanvas,
      -2,
      -2,
      alphaCanvas.width + 4,
      alphaCanvas.height + 4,
    );

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      mask.close();
      segmenter.close();
      throw new Error("เปิดพื้นที่ประมวลผลไม่ได้");
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const alphaPixels = alphaCtx.getImageData(
      0,
      0,
      alphaCanvas.width,
      alphaCanvas.height,
    ).data;
    const bgMatch = sourceBackground?.match(
      /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,
    );
    const sourceRgb = bgMatch
      ? bgMatch.slice(1).map((part) => Number.parseInt(part, 16))
      : null;
    for (let i = 0; i < canvas.width * canvas.height; i++) {
      const alpha = alphaPixels[i * 4 + 3] / 255;
      if (sourceRgb && alpha > 0.08 && alpha < 0.98) {
        for (let channel = 0; channel < 3; channel++) {
          const foreground =
            (pixels.data[i * 4 + channel] -
              (1 - alpha) * sourceRgb[channel]) /
            alpha;
          pixels.data[i * 4 + channel] = Math.max(
            0,
            Math.min(255, Math.round(foreground)),
          );
        }
      }
      pixels.data[i * 4 + 3] = alphaPixels[i * 4 + 3];
    }
    ctx.putImageData(pixels, 0, 0);
    mask.close();
    segmenter.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("สร้างภาพโปร่งใสไม่ได้");
    return URL.createObjectURL(blob);
  }
  async function makeMatchedOriginalPreview(sourceSrc: string, resultSrc: string) {
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

    const [{ FilesetResolver, FaceDetector }, sourceImage, resultImage] =
      await Promise.all([
        import("@mediapipe/tasks-vision"),
        loadImage(sourceSrc),
        loadImage(resultSrc),
      ]);
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
    );
    const detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });

    try {
      const sourceFace = detector.detect(sourceImage).detections[0]?.boundingBox;
      const resultFace = detector.detect(resultImage).detections[0]?.boundingBox;
      const canvas = document.createElement("canvas");
      canvas.width = resultImage.naturalWidth || 900;
      canvas.height = resultImage.naturalHeight || 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("เปิดพื้นที่เปรียบเทียบไม่ได้");

      const drawCover = () => {
        const scale = Math.max(
          canvas.width / sourceImage.naturalWidth,
          canvas.height / sourceImage.naturalHeight,
        );
        const width = sourceImage.naturalWidth * scale;
        const height = sourceImage.naturalHeight * scale;
        ctx.drawImage(
          sourceImage,
          (canvas.width - width) / 2,
          (canvas.height - height) / 2,
          width,
          height,
        );
      };

      if (!sourceFace || !resultFace) {
        drawCover();
        return canvas.toDataURL("image/jpeg", 0.94);
      }

      const sourceFaceCenterX = sourceFace.originX + sourceFace.width / 2;
      const sourceFaceCenterY = sourceFace.originY + sourceFace.height / 2;
      const resultFaceCenterX = resultFace.originX + resultFace.width / 2;
      const resultFaceCenterY = resultFace.originY + resultFace.height / 2;
      const scale = resultFace.height / Math.max(1, sourceFace.height);
      const drawWidth = sourceImage.naturalWidth * scale;
      const drawHeight = sourceImage.naturalHeight * scale;
      const drawX = resultFaceCenterX - sourceFaceCenterX * scale;
      const drawY = resultFaceCenterY - sourceFaceCenterY * scale;

      // เติมเฉพาะพื้นที่นอกภาพต้นฉบับด้วยภาพเดิมแบบเบลอ เพื่อไม่สร้างรายละเอียดใบหน้าใหม่
      ctx.save();
      ctx.filter = "blur(24px) brightness(0.96)";
      const backgroundScale = Math.max(
        canvas.width / sourceImage.naturalWidth,
        canvas.height / sourceImage.naturalHeight,
      );
      const backgroundWidth = sourceImage.naturalWidth * backgroundScale;
      const backgroundHeight = sourceImage.naturalHeight * backgroundScale;
      ctx.drawImage(
        sourceImage,
        (canvas.width - backgroundWidth) / 2,
        (canvas.height - backgroundHeight) / 2,
        backgroundWidth,
        backgroundHeight,
      );
      ctx.restore();

      ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
      return canvas.toDataURL("image/jpeg", 0.94);
    } finally {
      detector.close();
    }
  }

  async function prepareComparison(sourceSrc: string, resultSrc: string) {
    setComparePreparing(true);
    try {
      setCompareOriginal(await makeMatchedOriginalPreview(sourceSrc, resultSrc));
    } catch {
      setCompareOriginal(sourceSrc);
    } finally {
      setComparePreparing(false);
    }
  }


  async function chromaKeyToTransparent(src: string) {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return src;

    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;

    // Transparency is created deterministically in the browser, not by AI.
    // Only the temporary #FF00FF background is made transparent.
    // RGB pixels belonging to the person are never repainted or regenerated.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dr = 255 - r;
      const dg = g;
      const db = 255 - b;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);
      const magentaDominant = r > 150 && b > 150 && r - g > 70 && b - g > 70;
      if (!magentaDominant) continue;
      if (distance <= 70) {
        data[i + 3] = 0;
      } else if (distance <= 145) {
        const alpha = Math.round(((distance - 70) / 75) * 255);
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }

    ctx.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function normalizeAiResultToThreeFour(src: string, backgroundColor = bg) {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;

    // IMPORTANT: every generated outfit must finish at the SAME camera distance.
    // Do not let the raw AI crop or the outfit-reference crop decide the final scale.
    // We normalize by the detected face, then move/scale the WHOLE generated person
    // as one rigid image. This keeps head/body proportions intact while making every
    // outfit land at the same waist-up framing.
    // Keep the normalized AI result transparent. The selected background color
    // is rendered by the website stage/export layer, never by the AI image.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
      });

      try {
        const face = detector.detect(image).detections[0]?.boundingBox;
        if (face) {
          // Fixed final framing for EVERY outfit / hairstyle / source photo.
          // 900x1200 final canvas: face bbox ~17.5% of image height, centered high
          // enough to leave the complete shoulders, arms and waist visible below.
          const targetFaceHeight = 210;
          const targetFaceCenterX = 450;
          const targetFaceCenterY = 330;
          const faceCenterX = face.originX + face.width / 2;
          const faceCenterY = face.originY + face.height / 2;
          // Keep the AI-composed body proportions, but make the finished 3:4
          // image itself fill the preview/export frame.  The previous code used
          // only the face target scale, so a correctly-proportioned half-body
          // result could sit inside a smaller 2:3 rectangle with visible side
          // margins.  Never shrink below the scale required to cover the final
          // 3:4 canvas; scale the WHOLE generated portrait uniformly.
          const faceScale = targetFaceHeight / Math.max(1, face.height);
          const frameCoverScale = Math.max(
            canvas.width / image.naturalWidth,
            canvas.height / image.naturalHeight,
          );
          const scale = Math.max(faceScale, frameCoverScale);
          const drawWidth = image.naturalWidth * scale;
          const drawHeight = image.naturalHeight * scale;
          const drawX = targetFaceCenterX - faceCenterX * scale;
          const drawY = targetFaceCenterY - faceCenterY * scale;

          ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
          return canvas.toDataURL("image/png");
        }
      } finally {
        detector.close();
      }
    } catch {
      // Fall through to a deterministic no-face fallback.
    }

    // Fallback: fill the complete 3:4 display frame. The AI prompt already
    // generates extra waist/arm safety area, so a centered cover crop removes
    // only surplus outer background while keeping the person's proportions.
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.drawImage(
      image,
      (canvas.width - drawWidth) / 2,
      (canvas.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
    return canvas.toDataURL("image/png");
  }

  async function aiEdit() {
    if (!aiSelected.length) {
      setProcessMessage("กรุณาเลือกอย่างน้อย 1 รายการ");
      return;
    }
    setAiProcessing(true);
    setProcessMessage("AI กำลังปรับภาพจริง อาจใช้เวลาประมาณ 30–90 วินาที…");
    try {
      const [source, outfitSource] = await Promise.all([
        fetch(baseOriginal),
        fetch(outfit.image),
      ]);
      const [blob, outfitBlob] = await Promise.all([
        source.blob(),
        outfitSource.blob(),
      ]);
      const form = new FormData();
      form.append("image", blob, "portrait.png");
      form.append("outfit", outfitBlob, "outfit-reference.png");
      form.append("outfitLabel", `${outfit.label} (${outfit.sub})`);
      form.append("operations", JSON.stringify(aiSelected));
      form.append("hairVolume", hairVolume);
      form.append("skinStyle", skinStyle);
      form.append("skinStrength", String(skinStrength));
      const selectedHairstyle = hairstyleOptions.find(
        (option) => option.id === hairstyle,
      );
      form.append("hairstyle", selectedHairstyle?.label || "ทรงเดิม");
      if (selectedHairstyle?.image) {
        const hairstyleSource = await fetch(selectedHairstyle.image);
        const hairstyleBlob = await hairstyleSource.blob();
        form.append("hairstyleRef", hairstyleBlob, `${hairstyle}.png`);
      }
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        image?: string;
        error?: string;
      };
      if (!response.ok || !data.image)
        throw new Error(data.error || "AI ปรับภาพไม่สำเร็จ");
      const transparentPerson = await chromaKeyToTransparent(data.image);
      const normalizedImage = await normalizeAiResultToThreeFour(transparentPerson, bg);
      setOriginal(normalizedImage);
      setZoom(100);
      setX(0);
      setY(0);
      setAiBaseImage(normalizedImage);
      setAiComposited(true);
      setCutout(null);
      setBefore(false);
      void prepareComparison(baseOriginal, normalizedImage);
      setProcessMessage("AI ปรับภาพแบบ V3 สำเร็จแล้ว");
    } catch (e) {
      setProcessMessage(
        e instanceof Error ? e.message : "AI ปรับภาพไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setAiProcessing(false);
    }
  }
  async function changeBackground(color: string) {
    // AI results are transparent PNG cutouts. Background color is a pure UI layer,
    // so changing it must never call AI or alter the generated person pixels.
    setBg(color);
    setProcessMessage("เปลี่ยนสีพื้นหลังเรียบร้อยแล้ว");
  }
  async function removeBackground() {
    setProcessing(true);
    setProcessMessage("กำลังเตรียมระบบตัดพื้นหลัง…");
    try {
      setProcessMessage("กำลังแยกบุคคลและเก็บขอบเส้นผม…");
      setCutout(await makeTransparentCutout(original));
      setProcessMessage("ตัดพื้นหลังเรียบร้อย");
    } catch (e) {
      setProcessMessage(
        e instanceof Error
          ? e.message
          : "ตัดพื้นหลังไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setProcessing(false);
    }
  }
  async function download() {
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    const [person, cloth] = await Promise.all([
      load(shownSrc),
      load(outfit.image),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 900, 1200);
    const scale =
      Math.min(900 / person.width, 1200 / person.height) *
      (zoom / 100);
    const pw = person.width * scale,
      ph = person.height * scale;
    const previewWidth = stageRef.current?.clientWidth || 450;
    const previewHeight = stageRef.current?.clientHeight || 600;
    const exportX = x * (900 / previewWidth);
    const exportY = y * (1200 / previewHeight);
    ctx.filter = `brightness(${100 + skin}%)`;
    ctx.drawImage(
      person,
      (900 - pw) / 2 + exportX,
      (1200 - ph) / 2 + exportY,
      pw,
      ph,
    );
    ctx.filter = "none";
    if (!aiComposited) {
      const cw = 972 * (1 + neck / 100),
        ch = cloth.height * (cw / cloth.width);
      ctx.drawImage(cloth, (900 - cw) / 2, 1200 - ch + 330 + hair * 2, cw, ch);
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.94);
    a.download = "รูปพร้อมใช้.jpg";
    a.click();
  }

  return (
    <main className="photoid-shell">
      <header className="photoid-topbar">
        <div className="photoid-brand">
          <span className="photoid-logo">ID</span>
          <div><strong>PhotoID Studio TH</strong><small>รูปพร้อมใช้</small></div>
        </div>
        <span className="photoid-status"><Check /> รักษาใบหน้าจริง</span>
      </header>

      <div className="photoid-page">
        <section className="photoid-preview-card">
          <div className="photoid-card-heading"><h2>ภาพตัวอย่าง</h2><small>มาตรฐานรูปสมัครงาน 3:4</small></div>
          {!hasUploadedImage ? (
            <div className="photoid-empty-stage" aria-label="พื้นที่เพิ่มรูป">
              <button className="photoid-empty-add" onClick={() => inputRef.current?.click()}>
                <span className="photoid-empty-plus">+</span>
                <b>เพิ่มรูป</b>
                <small>JPG หรือ PNG สูงสุด 10 MB</small>
              </button>
            </div>
          ) : compareMode ? (
            <div className="photoid-compare-stage" aria-label="เปรียบเทียบก่อนและหลัง">
              <div className="photoid-compare-pane">
                <img src={compareOriginal ?? baseOriginal} alt="ภาพต้นฉบับ" />
                <span>ก่อนปรับ</span>
              </div>
              <div className="photoid-compare-pane" style={{ background: bg }}>
                <img src={shownSrc} alt="ภาพหลังปรับ" />
                <span>หลังปรับ</span>
              </div>
              {comparePreparing && (
                <div className="photoid-compare-loading">
                  <LoaderCircle className="spin" /> กำลังปรับระยะภาพต้นฉบับ…
                </div>
              )}
            </div>
          ) : (
            <div ref={stageRef} className="photoid-stage" style={{ background: bg }}
              onPointerDown={(e) => { dragStart.current = { px: e.clientX, py: e.clientY, x, y }; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => { if (!dragStart.current) return; setX(dragStart.current.x + e.clientX - dragStart.current.px); setY(dragStart.current.y + e.clientY - dragStart.current.py); }}
              onPointerUp={() => { dragStart.current = null; }} onPointerCancel={() => { dragStart.current = null; }}>
              <img className={`photoid-person ${aiComposited ? "ai-result" : ""}`} src={shownSrc} alt="ภาพลูกค้า"
                style={{ transform: `translate(${x}px, ${y}px) scale(${zoom / 100})`, filter: `brightness(${100 + skin}%)` }} />
              {!showOriginalOnly && !aiComposited && <img className="photoid-outfit-layer" src={outfit.image} alt={outfit.label}
                style={{ transform: `translateY(${hair * 2}px) scale(${1 + neck / 100})` }} />}
              {backgroundProcessing && <div className="photoid-loading"><LoaderCircle className="spin" /><b>AI กำลังเปลี่ยนพื้นหลัง…</b><small>กรุณารอสักครู่</small></div>}
            </div>
          )}
          {hasUploadedImage && (
            <div className="photoid-preview-actions">
              {!compareMode && <><button onClick={() => setZoom(Math.max(70, zoom - 5))}><ZoomOut /></button><b>{zoom}%</b>
              <button onClick={() => setZoom(Math.min(180, zoom + 5))}><ZoomIn /></button>
              <button onClick={reset}><RotateCcw /> รีเซ็ต</button></>}
              <button onClick={() => setBefore(!beforeState)}><ImageIcon /> {aiComposited ? (compareMode ? "ดูรูปหลังปรับ" : "เปรียบเทียบก่อน–หลัง") : (showOriginalOnly ? "ดูหลังปรับ" : "ดูต้นฉบับ")}</button>
            </div>
          )}
          <div className="photoid-result-title">ตัวอย่างผลลัพธ์</div>
          <div className="photoid-result-grid">
            <div className="photoid-example"><img src="/demo/official.jpg" alt="รูปสมัครงาน" /><b>รูปสมัครงาน</b></div>
            <div className="photoid-example"><img src={shownSrc} alt="สูทหญิงสุภาพ" /><b>{outfit.label}</b></div>
            <div className="photoid-example"><img src="/demo/original.png" alt="ระยะมาตรฐาน" /><b>ระยะมาตรฐาน 3:4</b></div>
          </div>
        </section>

        <aside className="photoid-builder-card">
          <h2>สร้างรูปติดบัตร</h2>
          <button className="photoid-upload" onClick={() => inputRef.current?.click()}>
            <span className="photoid-upload-icon"><UserRound /></span><span><b>ยังไม่ได้เลือกรูป</b><small>JPG หรือ PNG สูงสุด 10 MB</small></span><em>เลือกรูป</em>
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={pickFile} hidden />

          <section className="photoid-step-section">
            <div className="photoid-section-head"><b>1. เลือกแพตเทิร์นชุด</b><small>ใช้ไฟล์ชุดเดิมของคุณ</small></div>
            <div className="photoid-category-tabs">
              {["สมัครงาน", "ข้าราชการ", "นักเรียน", "นักศึกษา", "ชุดครุย"].map((category) => (
                <button key={category} className={outfitCategory === category ? "active" : ""}
                  onClick={() => { setOutfitCategory(category); const first = outfits.find((item) => item.category === category); if (first) setSelected(first.id); }}>{category}</button>
              ))}
            </div>
            <div className="photoid-outfit-grid">
              {visibleOutfits.length ? visibleOutfits.map((o) => (
                <button key={o.id} onClick={() => setSelected(o.id)} className={`photoid-outfit-card ${selected === o.id ? "selected" : ""}`}>
                  <span className="photoid-outfit-image"><img src={o.image} alt={o.label} /></span><b>{o.label}</b>
                </button>
              )) : <div className="photoid-empty-category">หมวดนี้ยังไม่มีเทมเพลตชุด</div>}
            </div>
          </section>

          <section className="photoid-step-section">
            <div className="photoid-section-head"><b>2. เลือกทรงผม</b><small>แบบทรงผม 29 แบบ</small></div>
            <div className="photoid-hair-grid">
              {hairstyleOptions.map((item) => (
                <button key={item.id} className={hairstyle === item.id ? "selected" : ""} onClick={() => setHairstyle(item.id)}>
                  {item.previewImage ? <img src={item.previewImage} alt={item.label} /> : <span className="no-hair">∅</span>}<small>{item.label}</small>
                </button>
              ))}
            </div>
          </section>

          <div className="photoid-bottom-row">
            <section className="photoid-mini-section"><b>3. เลือกพื้นหลัง</b>
              <div className="photoid-bg-options">
                {[{c:"#1682ee",l:"ฟ้ามาตรฐาน"},{c:"#ffffff",l:"ขาว"},{c:"#cfd5df",l:"เทาอ่อน"},{c:"#173b68",l:"น้ำเงินเข้ม"}].map((item) => (
                  <button key={item.c} className={bg === item.c ? "selected" : ""} onClick={() => changeBackground(item.c)} disabled={backgroundProcessing}>
                    <span style={{background:item.c}} /><small>{item.l}</small>
                  </button>))}
              </div>
            </section>
            <section className="photoid-format-section"><b>4. เลือกขนาดรูป</b>
              <select aria-label="ขนาดรูป" defaultValue="3:4"><option value="3:4">รูปสมัครงาน (3:4)</option><option value="1inch">1 นิ้ว</option><option value="1.5inch">1.5 นิ้ว</option><option value="2inch">2 นิ้ว</option></select>
            </section>
          </div>

          <details className="photoid-advanced"><summary>ตั้งค่าการปรับภาพเพิ่มเติม</summary>
            <div className="photoid-ai-options">{aiOptions.map((option) => (
              <label key={option.id}><input type="checkbox" checked={aiSelected.includes(option.id)} onChange={() => toggleAi(option.id)} /><span><b>{option.label}</b><small>{option.detail}</small></span></label>))}</div>
            <div className="photoid-manual-controls">
              <Control label="ใบหน้าซ้าย–ขวา" value={x} onChange={setX} /><Control label="ใบหน้าขึ้น–ลง" value={y} onChange={setY} />
              <Control label="ขนาดศีรษะ" value={head} min={65} max={90} onChange={setHead} suffix="%" /><Control label="ขนาดชุด" value={neck} min={-12} max={12} onChange={setNeck} />
              <Control label="ชุดขึ้น–ลง" value={hair} min={-20} max={20} onChange={setHair} /><Control label="ความสว่าง" value={skin} min={-10} max={10} onChange={setSkin} />
            </div>
          </details>
          <button className="photoid-ai-button" onClick={aiEdit} disabled={aiProcessing}>{aiProcessing ? <LoaderCircle className="spin" /> : <WandSparkles />}{aiProcessing ? "กำลังสร้างรูปด้วย AI…" : "สร้างรูปด้วย AI"}</button>
          <button className="photoid-download-button" onClick={download}><Download /> ดาวน์โหลดรูป</button>
          <small className="photoid-credit-note">ใช้เครดิตสร้างภาพ AI</small>
          {processMessage && <p className="photoid-process-message">{processMessage}</p>}
        </aside>
      </div>
    </main>
  );
}
