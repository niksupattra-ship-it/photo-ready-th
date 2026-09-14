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
  { id: "official-female-practitioner-finance", label: "ปฏิบัติการหญิง", sub: "กระทรวงการคลัง", category: "ข้าราชการ", image: "/templates/official-female-practitioner-finance.png", tone: "official" },
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

async function optimizeAiInputBlob(
  blob: Blob,
  maxLongEdge: number,
): Promise<Blob> {
  // Cost optimization only: downscale oversized AI INPUTS to a resolution
  // that is already sufficient for the 1024x1536 final render.
  // Never upscale, never crop, never change aspect ratio, and keep PNG/alpha.
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const longEdge = Math.max(width, height);

    if (!width || !height || longEdge <= maxLongEdge) return blob;

    const scale = maxLongEdge / longEdge;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (optimized) => resolve(optimized ?? blob),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}


async function prepareOfficialPortraitInputBlob(blob: Blob): Promise<Blob> {
  // OFFICIAL MODE COST OPTIMIZATION:
  // The AI only needs the real head, hair and neck. Crop those pixels locally
  // before upload instead of paying high-fidelity image tokens for the full body.
  const objectUrl = URL.createObjectURL(blob);
  try {
    const [{ FilesetResolver, FaceDetector }, image] = await Promise.all([
      import("@mediapipe/tasks-vision"),
      loadImage(objectUrl),
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
      const face = detector.detect(image).detections[0]?.boundingBox;
      if (!face) return optimizeAiInputBlob(blob, 896);

      const iw = image.naturalWidth || image.width;
      const ih = image.naturalHeight || image.height;
      const faceCx = face.originX + face.width / 2;
      const faceCy = face.originY + face.height / 2;

      // Include complete hairstyle + ears + enough neck, but intentionally
      // exclude most source shoulders/chest/civilian clothing.
      let cropW = face.width * 2.45;
      let cropH = face.height * 2.75;
      cropW = Math.min(cropW, iw);
      cropH = Math.min(cropH, ih);

      let sx = faceCx - cropW / 2;
      let sy = faceCy - face.height * 1.12;
      sx = Math.max(0, Math.min(iw - cropW, sx));
      sy = Math.max(0, Math.min(ih - cropH, sy));

      const maxEdge = 896;
      const scale = Math.min(1, maxEdge / Math.max(cropW, cropH));
      const tw = Math.max(1, Math.round(cropW * scale));
      const th = Math.max(1, Math.round(cropH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      if (!ctx) return optimizeAiInputBlob(blob, 896);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, sx, sy, cropW, cropH, 0, 0, tw, th);

      return await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (out) => resolve(out ?? blob),
          "image/jpeg",
          0.94,
        );
      });
    } finally {
      detector.close();
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
    const width = canvas.width;
    const height = canvas.height;
    const count = width * height;

    // Detect the ACTUAL flat AI background from the outer border.  Do not assume
    // magenta/blue/white: some image-model runs ignore the requested chroma hue.
    // Quantising the border and taking its dominant bucket makes this stable even
    // when the person's arms/waist touch part of the bottom edge.
    const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
    const addSample = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      const item = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
      item.count += 1;
      item.r += r;
      item.g += g;
      item.b += b;
      buckets.set(key, item);
    };

    const step = Math.max(1, Math.floor(Math.min(width, height) / 240));
    for (let x = 0; x < width; x += step) {
      addSample(x, 0);
      addSample(x, Math.max(0, height - 1));
    }
    for (let y = 0; y < height; y += step) {
      addSample(0, y);
      addSample(Math.max(0, width - 1), y);
    }

    let dominant: { count: number; r: number; g: number; b: number } | null = null;
    for (const item of buckets.values()) {
      if (!dominant || item.count > dominant.count) dominant = item;
    }
    if (!dominant || dominant.count < 4) return src;

    const bgR = dominant.r / dominant.count;
    const bgG = dominant.g / dominant.count;
    const bgB = dominant.b / dominant.count;
    const colorDistance = (pixel: number) => {
      const i = pixel * 4;
      const dr = data[i] - bgR;
      const dg = data[i + 1] - bgG;
      const db = data[i + 2] - bgB;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    // Only pixels CONNECTED TO THE OUTER BORDER can become background.  This is the
    // important safety rule: identical/similar colours inside the face, hair or suit
    // are not keyed out just because they resemble the background.
    const connected = new Uint8Array(count);
    const queue = new Int32Array(count);
    let head = 0;
    let tail = 0;
    const joinDistance = 128;
    const enqueue = (pixel: number) => {
      if (pixel < 0 || pixel >= count || connected[pixel]) return;
      if (colorDistance(pixel) > joinDistance) return;
      connected[pixel] = 1;
      queue[tail++] = pixel;
    };

    for (let x = 0; x < width; x++) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }

    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x > 0) enqueue(pixel - 1);
      if (x + 1 < width) enqueue(pixel + 1);
      if (y > 0) enqueue(pixel - width);
      if (y + 1 < height) enqueue(pixel + width);
    }

    // Feather only the border-connected matte.  Pure background is alpha 0;
    // anti-aliased hair/clothing fringe gets partial alpha.  For partial-alpha edge
    // pixels, mathematically remove the detected background colour (despill) so no
    // blue/purple/green halo remains when placed over the website's chosen colour.
    const transparentDistance = 34;
    const opaqueDistance = 132;
    for (let pixel = 0; pixel < count; pixel++) {
      if (!connected[pixel]) continue;
      const i = pixel * 4;
      const distance = colorDistance(pixel);
      let alpha = (distance - transparentDistance) / (opaqueDistance - transparentDistance);
      alpha = Math.max(0, Math.min(1, alpha));

      if (alpha <= 0.02) {
        data[i + 3] = 0;
        continue;
      }

      if (alpha < 0.995) {
        const inv = 1 - alpha;
        data[i] = Math.max(0, Math.min(255, Math.round((data[i] - inv * bgR) / alpha)));
        data[i + 1] = Math.max(0, Math.min(255, Math.round((data[i + 1] - inv * bgG) / alpha)));
        data[i + 2] = Math.max(0, Math.min(255, Math.round((data[i + 2] - inv * bgB) / alpha)));
        data[i + 3] = Math.round(alpha * 255);
      }
    }

    // Remove enclosed chroma pockets BEFORE edge feathering.
    // Background regions between an arm and the torso can be completely enclosed by
    // the person silhouette, so a border-connected flood fill can never reach them.
    // The AI temporary chroma is deliberately a highly saturated magenta; remove only
    // pixels that are unmistakably that chroma family. Natural skin/lips/hair/suit are
    // protected by the strong saturation + channel-dominance thresholds below.
    for (let pixel = 0; pixel < count; pixel++) {
      const i = pixel * 4;
      if (data[i + 3] <= 12) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const magentaDominance = Math.min(r, b) - g;
      const rbBalance = Math.abs(r - b);

      // Pure / near-pure temporary magenta, including enclosed holes between arms/body.
      if (
        r >= 145 &&
        b >= 105 &&
        g <= 125 &&
        magentaDominance >= 62 &&
        rbBalance <= 135
      ) {
        data[i + 3] = 0;
      }
    }

    // Final chroma-fringe cleanup. The AI sometimes leaves a thin magenta halo
    // (#FF00FF spill) just OUTSIDE the true hair/clothing edge. Those pixels can
    // survive the background flood-fill because they are too far from the detected
    // blue/flat background colour. Remove ONLY strong magenta pixels that sit within
    // a few pixels of transparency; interior face/skin/hair/suit pixels are untouched.
    const alphaSnapshot = new Uint8ClampedArray(count);
    for (let pixel = 0; pixel < count; pixel++) alphaSnapshot[pixel] = data[pixel * 4 + 3];

    const nearTransparent = (x: number, y: number, radius = 4) => {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(height - 1, y + radius);
      for (let yy = y0; yy <= y1; yy++) {
        for (let xx = x0; xx <= x1; xx++) {
          if (alphaSnapshot[yy * width + xx] <= 12) return true;
        }
      }
      return false;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x;
        const i = pixel * 4;
        const a = data[i + 3];
        if (a <= 12 || !nearTransparent(x, y, 4)) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const magentaStrength = Math.min(r, b) - g;
        const rbBalance = Math.abs(r - b);

        // Strong magenta/cyclamen spill: remove it completely when it hugs the edge.
        if (r > 95 && b > 95 && magentaStrength > 58 && rbBalance < 115) {
          data[i + 3] = 0;
          continue;
        }

        // Softer magenta anti-alias fringe: fade alpha only. Do not repaint RGB, so
        // natural hair/skin/clothing colour remains exactly as generated.
        if (r > 80 && b > 80 && magentaStrength > 34 && rbBalance < 130) {
          const fade = Math.max(0.08, Math.min(1, 1 - (magentaStrength - 34) / 70));
          data[i + 3] = Math.round(a * fade);
        }
      }
    }

    ctx.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  }


  async function officialPersonToTransparent(src: string) {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return src;

    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = pixels.data;
    const w = canvas.width;
    const h = canvas.height;

    // Sample only the outer border. The AI is instructed to return a flat
    // chroma background, but it may occasionally choose blue/cyan instead of
    // magenta. We therefore detect the ACTUAL border colour rather than
    // guessing a fixed colour. This never recolours retained skin/hair pixels.
    const samples: Array<[number, number, number]> = [];
    const pushSample = (x: number, y: number) => {
      const i = (y * w + x) * 4;
      samples.push([d[i], d[i + 1], d[i + 2]]);
    };
    const step = Math.max(1, Math.floor(Math.min(w, h) / 80));
    for (let x = 0; x < w; x += step) {
      pushSample(x, 0);
      pushSample(x, h - 1);
    }
    for (let y = 0; y < h; y += step) {
      pushSample(0, y);
      pushSample(w - 1, y);
    }

    const median = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)] ?? 0;
    };
    const bgR = median(samples.map((v) => v[0]));
    const bgG = median(samples.map((v) => v[1]));
    const bgB = median(samples.map((v) => v[2]));

    const colorDistance = (i: number) => {
      const dr = d[i] - bgR;
      const dg = d[i + 1] - bgG;
      const db = d[i + 2] - bgB;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    // Flood-fill only background pixels that are connected to the OUTER BORDER.
    // This prevents any internal skin/hair colour from being removed even if it
    // happens to resemble the background.
    const visited = new Uint8Array(w * h);
    const queueX = new Int32Array(w * h);
    const queueY = new Int32Array(w * h);
    let head = 0;
    let tail = 0;

    const enqueue = (x: number, y: number) => {
      const index = y * w + x;
      if (visited[index]) return;
      const i = index * 4;
      if (d[i + 3] === 0) {
        visited[index] = 1;
        return;
      }
      // Conservative distance: flat border backgrounds are removed; face/hair
      // edges are protected unless connected and extremely close to the border
      // colour.
      if (colorDistance(i) > 72) return;
      visited[index] = 1;
      queueX[tail] = x;
      queueY[tail] = y;
      tail++;
    };

    for (let x = 0; x < w; x++) {
      enqueue(x, 0);
      enqueue(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      enqueue(0, y);
      enqueue(w - 1, y);
    }

    while (head < tail) {
      const x = queueX[head];
      const y = queueY[head];
      head++;
      const i = (y * w + x) * 4;
      d[i + 3] = 0;

      if (x > 0) enqueue(x - 1, y);
      if (x + 1 < w) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y + 1 < h) enqueue(x, y + 1);
    }

    // Soft 2-pixel alpha feather on the removed boundary only.
    // RGB is never altered, so skin tone and hair colour remain unchanged.
    const alpha = new Uint8ClampedArray(w * h);
    for (let i = 0; i < w * h; i++) alpha[i] = d[i * 4 + 3];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (alpha[idx] === 0) continue;
        let transparentNeighbours = 0;
        for (let yy = -1; yy <= 1; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            if (xx === 0 && yy === 0) continue;
            if (alpha[(y + yy) * w + (x + xx)] === 0) {
              transparentNeighbours++;
            }
          }
        }
        if (transparentNeighbours >= 2) {
          d[idx * 4 + 3] = Math.min(
            d[idx * 4 + 3],
            Math.max(90, 255 - transparentNeighbours * 20),
          );
        }
      }
    }

    ctx.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function composeOfficialExactTemplate(
    personSrc: string,
    templateSrc: string,
    outfitId: string,
  ) {
    const [{ FilesetResolver, FaceDetector }, person, template] =
      await Promise.all([
        import("@mediapipe/tasks-vision"),
        loadImage(personSrc),
        loadImage(templateSrc),
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
      const face = detector.detect(person).detections[0]?.boundingBox;
      if (!face) throw new Error("ไม่พบใบหน้าหลังประมวลผล");

      const isMale = /male|ชาย/.test(outfitId);

      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("รวมเทมเพลตข้าราชการไม่ได้");
      ctx.clearRect(0, 0, 900, 1200);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ------------------------------------------------------------
      // 1) Measure the REAL uniform template first.
      //    The person's scale is derived from the template shoulders,
      //    not from a fixed faceHeight number.
      // ------------------------------------------------------------
      const templateMeasure = document.createElement("canvas");
      templateMeasure.width = 900;
      templateMeasure.height = 1200;
      const tm = templateMeasure.getContext("2d", { willReadFrequently: true });
      if (!tm) throw new Error("วัดเทมเพลตไม่ได้");
      tm.drawImage(template, 0, 0, 900, 1200);

      const templatePixels = tm.getImageData(0, 0, 900, 1200);
      const td = templatePixels.data;
      const alphaAt = (x: number, y: number) =>
        td[(y * 900 + x) * 4 + 3];

      // Find the widest opaque span in the shoulder/chest band.
      // This is robust across future official templates with different insignia.
      let shoulderLeft = 450;
      let shoulderRight = 450;
      let measuredShoulderWidth = 0;

      for (let y = 560; y <= 760; y += 4) {
        let left = -1;
        let right = -1;

        for (let x = 0; x < 900; x++) {
          if (alphaAt(x, y) > 80) {
            left = x;
            break;
          }
        }
        for (let x = 899; x >= 0; x--) {
          if (alphaAt(x, y) > 80) {
            right = x;
            break;
          }
        }

        if (left >= 0 && right > left) {
          const width = right - left + 1;
          if (width > measuredShoulderWidth) {
            measuredShoulderWidth = width;
            shoulderLeft = left;
            shoulderRight = right;
          }
        }
      }

      if (measuredShoulderWidth < 300) {
        measuredShoulderWidth = 720;
        shoulderLeft = 90;
        shoulderRight = 810;
      }

      const templateCenterX = (shoulderLeft + shoulderRight) / 2;

      // Detect the central transparent neck/collar opening around the expected
      // collar area. We use the widest centre-connected transparent run.
      let collarJoinY = 620;
      let collarOpeningWidth = 92;
      let bestScore = -1;

      for (let y = 560; y <= 660; y += 2) {
        if (alphaAt(450, y) > 40) continue;

        let left = 450;
        while (left > 1 && alphaAt(left - 1, y) <= 40) left--;
        let right = 450;
        while (right < 898 && alphaAt(right + 1, y) <= 40) right++;

        const width = right - left + 1;
        if (width < 20 || width > 220) continue;

        // Prefer a useful lower-collar width around 70–130px.
        const widthScore = 1 - Math.min(1, Math.abs(width - 95) / 95);
        const yScore = 1 - Math.min(1, Math.abs(y - 620) / 100);
        const score = widthScore * 0.65 + yScore * 0.35;

        if (score > bestScore) {
          bestScore = score;
          collarJoinY = y;
          collarOpeningWidth = width;
        }
      }

      // ------------------------------------------------------------
      // 2) Measure the actual transparent person layer (head/hair/neck).
      //    Use the complete alpha silhouette so selected hairstyles remain intact.
      // ------------------------------------------------------------
      const personMeasure = document.createElement("canvas");
      personMeasure.width = person.naturalWidth || person.width;
      personMeasure.height = person.naturalHeight || person.height;
      const pm = personMeasure.getContext("2d", { willReadFrequently: true });
      if (!pm) throw new Error("วัดสัดส่วนศีรษะไม่ได้");
      pm.drawImage(person, 0, 0);

      const personPixels = pm.getImageData(
        0,
        0,
        personMeasure.width,
        personMeasure.height,
      );
      const pd = personPixels.data;
      const pw = personMeasure.width;
      const ph = personMeasure.height;

      let headLeft = pw;
      let headRight = 0;
      let headTop = ph;
      let headBottom = 0;

      // Only measure the head/hair area around and above the face plus enough
      // room below the jaw for the neck. This avoids accidental invisible
      // chroma remnants affecting the measurement.
      const measureTop = Math.max(0, Math.floor(face.originY - face.height * 0.85));
      const measureBottom = Math.min(
        ph - 1,
        Math.ceil(face.originY + face.height * 1.75),
      );
      const measureLeft = Math.max(
        0,
        Math.floor(face.originX - face.width * 0.95),
      );
      const measureRight = Math.min(
        pw - 1,
        Math.ceil(face.originX + face.width * 1.95),
      );

      for (let y = measureTop; y <= measureBottom; y++) {
        for (let x = measureLeft; x <= measureRight; x++) {
          const a = pd[(y * pw + x) * 4 + 3];
          if (a > 18) {
            if (x < headLeft) headLeft = x;
            if (x > headRight) headRight = x;
            if (y < headTop) headTop = y;
            if (y > headBottom) headBottom = y;
          }
        }
      }

      const measuredHeadWidth =
        headRight > headLeft ? headRight - headLeft + 1 : face.width * 1.75;

      // Standard shoulder-to-head relationship:
      // female ~1.55–1.80 head widths; male ~2.0–2.3.
      // Use the middle of each range so the head does not look oversized.
      // Official portrait fit: the previous female ratio (1.68) made the complete
      // head/hair unit visibly too small against this fixed government template.
      // Use a slightly larger, still natural head scale while preserving the
      // entire head+hair as ONE unit (never enlarge facial features separately).
      const shoulderToHeadRatio = isMale ? 2.02 : 1.48;

      const targetHeadWidth =
        measuredShoulderWidth / shoulderToHeadRatio;

      let personScale = targetHeadWidth / Math.max(1, measuredHeadWidth);

      // Keep the adjustment within a realistic safety range relative to face size.
      const targetFaceHeight = face.height * personScale;
      const minFaceHeight = isMale ? 182 : 188;
      const maxFaceHeight = isMale ? 225 : 228;

      if (targetFaceHeight < minFaceHeight) {
        personScale *= minFaceHeight / Math.max(1, targetFaceHeight);
      } else if (targetFaceHeight > maxFaceHeight) {
        personScale *= maxFaceHeight / targetFaceHeight;
      }

      const scaledFaceWidth = face.width * personScale;
      const scaledFaceHeight = face.height * personScale;

      // ------------------------------------------------------------
      // 3) Compute a natural neck from the measured face and sex standard.
      // ------------------------------------------------------------
      const neckWidthRatio = isMale ? 0.60 : 0.54;
      const minNeck = isMale ? 76 : 66;
      const maxNeck = isMale ? 110 : 96;
      const targetNeckWidth = Math.max(
        minNeck,
        Math.min(maxNeck, scaledFaceWidth * neckWidthRatio),
      );

      const neckLengthRatio = isMale ? 0.38 : 0.40;
      const targetNeckLength = scaledFaceHeight * neckLengthRatio;

      // The jaw (bottom of detected face bbox) is placed ABOVE the collar join,
      // leaving a natural neck length plus a small overlap under the real collar.
      const templateScale = 0.93;
      const originalTemplateTop = 524;
      const templateY =
        originalTemplateTop - originalTemplateTop * templateScale;

      const finalCollarJoinY =
        templateY + collarJoinY * templateScale;

      // Let 12–16px of neck sit behind the collar so no cut-and-paste seam appears.
      const underCollarOverlap = isMale ? 14 : 16;
      const targetJawY =
        finalCollarJoinY -
        targetNeckLength +
        underCollarOverlap;

      const sourceFaceCenterX = face.originX + face.width / 2;
      const sourceJawY = face.originY + face.height;

      const dx =
        templateCenterX - sourceFaceCenterX * personScale;
      const dy =
        targetJawY - sourceJawY * personScale;

      // Draw the COMPLETE person layer with one uniform transform.
      // No hard mask. No head crop. No neck crop.
      ctx.drawImage(
        person,
        dx,
        dy,
        person.naturalWidth * personScale,
        person.naturalHeight * personScale,
      );

      // ------------------------------------------------------------
      // 4) Adapt ONLY the transparent inner collar opening of the REAL template.
      //    The uniform itself is never AI-generated.
      // ------------------------------------------------------------
      const templateCanvas = document.createElement("canvas");
      templateCanvas.width = 900;
      templateCanvas.height = 1200;
      const templateCtx = templateCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!templateCtx) throw new Error("ปรับช่องคอเทมเพลตไม่ได้");
      templateCtx.drawImage(template, 0, 0, 900, 1200);

      const adaptivePixels = templateCtx.getImageData(0, 0, 900, 1200);
      const ad = adaptivePixels.data;
      const adaptiveAlphaAt = (x: number, y: number) =>
        ad[(y * 900 + x) * 4 + 3];

      const desiredTemplateOpening =
        (targetNeckWidth + (isMale ? 10 : 8)) / templateScale;

      const collarFactor = Math.max(
        0.88,
        Math.min(
          1.12,
          desiredTemplateOpening / Math.max(1, collarOpeningWidth),
        ),
      );

      const collarStartY = Math.max(520, collarJoinY - 78);
      const collarEndY = Math.min(680, collarJoinY + 38);

      for (let y = collarStartY; y <= collarEndY; y++) {
        if (adaptiveAlphaAt(450, y) > 40) continue;

        let left = 450;
        while (left > 1 && adaptiveAlphaAt(left - 1, y) <= 40) left--;
        let right = 450;
        while (right < 898 && adaptiveAlphaAt(right + 1, y) <= 40) right++;

        const currentWidth = right - left + 1;
        if (currentWidth < 10 || currentWidth > 240) continue;

        const distance = Math.abs(y - collarJoinY);
        const weight = Math.max(0, 1 - distance / 82);
        const localFactor = 1 + (collarFactor - 1) * weight;

        const newWidth = Math.max(
          8,
          Math.round(currentWidth * localFactor),
        );
        const newLeft = Math.round(450 - newWidth / 2);
        const newRight = newLeft + newWidth - 1;

        if (newWidth > currentWidth) {
          // Open only the inner edge.
          for (let x = newLeft; x < left; x++) {
            if (x >= 0 && x < 900) {
              ad[(y * 900 + x) * 4 + 3] = 0;
            }
          }
          for (let x = right + 1; x <= newRight; x++) {
            if (x >= 0 && x < 900) {
              ad[(y * 900 + x) * 4 + 3] = 0;
            }
          }
        } else if (newWidth < currentWidth) {
          // Close using the nearest genuine collar pixels.
          let leftSource = left - 1;
          while (
            leftSource > 0 &&
            adaptiveAlphaAt(leftSource, y) < 180
          ) {
            leftSource--;
          }
          let rightSource = right + 1;
          while (
            rightSource < 899 &&
            adaptiveAlphaAt(rightSource, y) < 180
          ) {
            rightSource++;
          }

          const lsi = (y * 900 + leftSource) * 4;
          const rsi = (y * 900 + rightSource) * 4;

          for (let x = left; x < newLeft; x++) {
            const i = (y * 900 + x) * 4;
            ad[i] = ad[lsi];
            ad[i + 1] = ad[lsi + 1];
            ad[i + 2] = ad[lsi + 2];
            ad[i + 3] = ad[lsi + 3];
          }
          for (let x = newRight + 1; x <= right; x++) {
            const i = (y * 900 + x) * 4;
            ad[i] = ad[rsi];
            ad[i + 1] = ad[rsi + 1];
            ad[i + 2] = ad[rsi + 2];
            ad[i + 3] = ad[rsi + 3];
          }
        }
      }

      templateCtx.putImageData(adaptivePixels, 0, 0);

      // Real template last = lower neck naturally disappears under the collar.
      const tw = 900 * templateScale;
      const th = 1200 * templateScale;
      const tx = (900 - tw) / 2;

      ctx.drawImage(
        templateCanvas,
        tx,
        templateY,
        tw,
        th,
      );

      return canvas.toDataURL("image/png");
    } finally {
      detector.close();
    }
  }

  async function normalizeAiResultToThreeFour(src: string, backgroundColor = bg) {
    const image = await loadImage(src);
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth || image.width;
    sourceCanvas.height = image.naturalHeight || image.height;
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx) return src;
    sourceCtx.drawImage(image, 0, 0);

    const sourcePixels = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = sourcePixels.data;
    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;

    // Find the visible PERSON silhouette from alpha after background removal.
    // The final composition is based on this bbox, not on the raw AI rectangle, so
    // zoom-out never reveals a smaller coloured rectangle inside the 3:4 stage.
    let minX = sw;
    let minY = sh;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const a = data[(y * sw + x) * 4 + 3];
        if (a < 20) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (maxX < minX || maxY < minY) return src;

    const personWidth = Math.max(1, maxX - minX + 1);
    const personHeight = Math.max(1, maxY - minY + 1);

    // Keep the ENTIRE generated half-body visible: complete head/hair, both arms and
    // waist.  Uniform scaling preserves the AI's head/body proportions.  The website
    // background shows through all transparent margins, therefore the image fills the
    // stage visually without ever cropping the person.
    const targetLeft = 36;
    const targetRight = 864;
    const targetTop = 72;
    const targetBottom = 1190;
    const targetWidth = targetRight - targetLeft;
    const targetHeight = targetBottom - targetTop;
    const scale = Math.min(targetWidth / personWidth, targetHeight / personHeight);

    const visibleWidth = personWidth * scale;
    const visibleHeight = personHeight * scale;
    const targetPersonX = (canvas.width - visibleWidth) / 2;
    // Keep a consistent headroom while allowing the waist to extend naturally down.
    const targetPersonY = targetTop + Math.max(0, (targetHeight - visibleHeight) * 0.12);

    const drawX = targetPersonX - minX * scale;
    const drawY = targetPersonY - minY * scale;
    ctx.drawImage(image, drawX, drawY, sw * scale, sh * scale);

    return canvas.toDataURL("image/png");
  }


  async function prepareOfficialAiBalanceInput(
    sourceBlob: Blob,
    outfitId: string,
  ) {
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
      const [{ FilesetResolver, FaceDetector }, source] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        loadImage(objectUrl),
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
        const face = detector.detect(source).detections[0]?.boundingBox;
        if (!face) throw new Error("ไม่พบใบหน้าในรูปต้นฉบับ");

        const inputSize = 768;
        const inputCanvas = document.createElement("canvas");
        inputCanvas.width = inputSize;
        inputCanvas.height = inputSize;
        const inputCtx = inputCanvas.getContext("2d");
        if (!inputCtx) throw new Error("สร้าง AI input ไม่ได้");

        // Flat chroma background. AI returns only head/hair/neck on this field.
        inputCtx.fillStyle = "#FF00FF";
        inputCtx.fillRect(0, 0, inputSize, inputSize);
        inputCtx.imageSmoothingEnabled = true;
        inputCtx.imageSmoothingQuality = "high";

        // Keep the real face large enough for identity fidelity while leaving
        // generous safety margin for the COMPLETE hairstyle and full neck.
        const targetFaceHeight = 220;
        const targetFaceCenterX = inputSize / 2;
        const targetFaceCenterY = 310;

        const scale = targetFaceHeight / Math.max(1, face.height);
        const sourceFaceCenterX = face.originX + face.width / 2;
        const sourceFaceCenterY = face.originY + face.height / 2;
        const dx = targetFaceCenterX - sourceFaceCenterX * scale;
        const dy = targetFaceCenterY - sourceFaceCenterY * scale;

        inputCtx.drawImage(
          source,
          dx,
          dy,
          (source.naturalWidth || source.width) * scale,
          (source.naturalHeight || source.height) * scale,
        );

        // Mask:
        // transparent = editable by AI, opaque = protected.
        // Hair + jaw-to-neck are editable; central identity face is locked.
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = inputSize;
        maskCanvas.height = inputSize;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) throw new Error("สร้าง AI mask ไม่ได้");

        // IMPORTANT: everything outside the identity face is editable.
        // Do NOT use an ellipse/trapezoid edit window: its geometric boundary
        // was the cause of the straight hair/neck cut visible in official mode.
        maskCtx.clearRect(0, 0, inputSize, inputSize);

        // Protect only the real identity face. Hair, ears, jaw edge, neck, source
        // clothes and source background remain editable so AI can return one
        // continuous head+hair+neck layer on chroma with no rectangular residue.
        maskCtx.globalCompositeOperation = "source-over";
        maskCtx.fillStyle = "#000";

        const lockedFaceWidth = face.width * scale * 0.80;
        const lockedFaceHeight = face.height * scale * 0.72;
        maskCtx.beginPath();
        maskCtx.ellipse(
          targetFaceCenterX,
          targetFaceCenterY + 8,
          lockedFaceWidth / 2,
          lockedFaceHeight / 2,
          0,
          0,
          Math.PI * 2,
        );
        maskCtx.fill();


        const [imageBlob, maskBlob] = await Promise.all([
          new Promise<Blob>((resolve) =>
            inputCanvas.toBlob(
              (blob) => resolve(blob ?? sourceBlob),
              "image/png",
            ),
          ),
          new Promise<Blob>((resolve) =>
            maskCanvas.toBlob(
              (blob) => resolve(blob ?? sourceBlob),
              "image/png",
            ),
          ),
        ]);

        return { imageBlob, maskBlob };
      } finally {
        detector.close();
      }
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function finalizeOfficialAiBalancedResult(
    aiPatchSrc: string,
    templateSrc: string,
    outfitId: string,
  ) {
    const [
      { FilesetResolver, FaceDetector },
      aiPatchRaw,
      template,
    ] = await Promise.all([
      import("@mediapipe/tasks-vision"),
      officialPersonToTransparent(aiPatchSrc),
      loadImage(templateSrc),
    ]);

    const aiPatch = await loadImage(aiPatchRaw);

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
      const face = detector.detect(aiPatch).detections[0]?.boundingBox;
      if (!face) throw new Error("ไม่พบใบหน้าหลัง AI ปรับ");

      const isMale = /male|ชาย/.test(outfitId);

      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("รวมผลชุดข้าราชการไม่ได้");
      ctx.clearRect(0, 0, 900, 1200);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // ------------------------------------------------------------
      // Measure the REAL template geometry.
      // ------------------------------------------------------------
      const templateMeasure = document.createElement("canvas");
      templateMeasure.width = 900;
      templateMeasure.height = 1200;
      const tm = templateMeasure.getContext("2d", { willReadFrequently: true });
      if (!tm) throw new Error("วัดเทมเพลตไม่ได้");
      tm.drawImage(template, 0, 0, 900, 1200);

      const templatePixels = tm.getImageData(0, 0, 900, 1200);
      const td = templatePixels.data;
      const alphaAt = (x: number, y: number) =>
        td[(y * 900 + x) * 4 + 3];

      // Shoulder width: measure across the real upper-body template band.
      let shoulderWidth = 0;
      let shoulderCenterX = 450;

      for (let y = 650; y <= 760; y += 5) {
        let left = -1;
        let right = -1;

        for (let x = 0; x < 900; x++) {
          if (alphaAt(x, y) > 60) {
            left = x;
            break;
          }
        }
        for (let x = 899; x >= 0; x--) {
          if (alphaAt(x, y) > 60) {
            right = x;
            break;
          }
        }

        if (left >= 0 && right > left) {
          const width = right - left + 1;
          if (width > shoulderWidth) {
            shoulderWidth = width;
            shoulderCenterX = (left + right) / 2;
          }
        }
      }

      if (shoulderWidth < 600) {
        shoulderWidth = 800;
        shoulderCenterX = 450;
      }

      // Find the transparent collar opening near the neck.
      let collarY = 600;
      let collarWidth = 138;
      let bestScore = -1;

      for (let y = 570; y <= 630; y += 2) {
        if (alphaAt(450, y) > 40) continue;

        let left = 450;
        while (left > 1 && alphaAt(left - 1, y) <= 40) left--;

        let right = 450;
        while (right < 898 && alphaAt(right + 1, y) <= 40) right++;

        const width = right - left + 1;
        if (width < 60 || width > 190) continue;

        const score =
          1 -
          Math.min(1, Math.abs(width - 125) / 125) * 0.65 -
          Math.min(1, Math.abs(y - 600) / 60) * 0.35;

        if (score > bestScore) {
          bestScore = score;
          collarY = y;
          collarWidth = width;
        }
      }

      // Existing official framing: preserve it exactly.
      const templateScale = 0.93;
      const tw = 900 * templateScale;
      const th = 1200 * templateScale;
      const tx = (900 - tw) / 2;
      const originalTop = 524;
      const ty = originalTop - originalTop * templateScale;

      const finalShoulderWidth = shoulderWidth * templateScale;
      const finalShoulderCenterX =
        tx + shoulderCenterX * templateScale;
      const finalCollarY = ty + collarY * templateScale;
      const finalCollarWidth = collarWidth * templateScale;

      // ------------------------------------------------------------
      // Compute human proportions from template + actual AI face.
      // ------------------------------------------------------------
      // Formal portrait target: face width relative to shoulder width.
      // These ranges avoid both "big head" and "tiny head".
      const faceToShoulderRatio = isMale ? 0.285 : 0.31;
      const desiredFaceWidth =
        finalShoulderWidth * faceToShoulderRatio;

      let personScale =
        desiredFaceWidth / Math.max(1, face.width);

      // Safety clamp from actual face height.
      let desiredFaceHeight = face.height * personScale;
      const minFaceHeight = isMale ? 225 : 215;
      const maxFaceHeight = isMale ? 270 : 260;

      if (desiredFaceHeight < minFaceHeight) {
        personScale *= minFaceHeight / Math.max(1, desiredFaceHeight);
      } else if (desiredFaceHeight > maxFaceHeight) {
        personScale *= maxFaceHeight / desiredFaceHeight;
      }

      const scaledFaceWidth = face.width * personScale;
      const scaledFaceHeight = face.height * personScale;

      // Neck width calculated from BOTH real face and actual collar opening.
      const anatomicalNeckWidth =
        scaledFaceWidth * (isMale ? 0.47 : 0.43);
      const collarDrivenNeckWidth =
        finalCollarWidth * (isMale ? 0.84 : 0.80);

      const targetNeckWidth = Math.max(
        isMale ? 82 : 72,
        Math.min(
          isMale ? 118 : 104,
          anatomicalNeckWidth * 0.55 +
            collarDrivenNeckWidth * 0.45,
        ),
      );

      // Natural neck length. Put its lower 12–16 px under the real collar so the
      // uniform overlaps the skin like a real photograph.
      const targetNeckLength =
        scaledFaceHeight * (isMale ? 0.38 : 0.40);
      const underCollarOverlap = isMale ? 12 : 16;

      const targetJawY =
        finalCollarY -
        targetNeckLength +
        underCollarOverlap;

      const sourceFaceCenterX =
        face.originX + face.width / 2;
      const sourceJawY =
        face.originY + face.height;

      const dx =
        finalShoulderCenterX -
        sourceFaceCenterX * personScale;
      const dy =
        targetJawY -
        sourceJawY * personScale;

      // ------------------------------------------------------------
      // Draw the COMPLETE AI person layer with one uniform transform.
      // No post-AI geometric mask is allowed here. The previous jaw-height
      // rectangle + narrow neck corridor physically clipped long hairstyles
      // and produced the pasted/cut appearance. The AI output is already
      // chroma-keyed to head + complete hair + ears + neck only.
      // ------------------------------------------------------------
      ctx.drawImage(
        aiPatch,
        dx,
        dy,
        (aiPatch.naturalWidth || aiPatch.width) * personScale,
        (aiPatch.naturalHeight || aiPatch.height) * personScale,
      );

      // ...then the exact REAL template on top. This hides the lower neck under
      // the collar naturally. No AI-generated shoulder board, insignia, ribbon,
      // tie, button, sleeve or outer uniform is used.
      ctx.drawImage(template, tx, ty, tw, th);

      return canvas.toDataURL("image/png");
    } finally {
      detector.close();
    }
  }

  async function aiEdit() {
    if (!aiSelected.length) {
      setProcessMessage("กรุณาเลือกอย่างน้อย 1 รายการ");
      return;
    }
    setAiProcessing(true);
    setProcessMessage(
      outfit.id.startsWith("official-")
        ? "AI กำลังปรับคนให้เข้ากับเทมเพลตชุดข้าราชการจริง โดยล็อกรายละเอียดชุด…"
        : "AI กำลังปรับภาพจริง อาจใช้เวลาประมาณ 30–90 วินาที…",
    );
    try {
      const isOfficialTemplate = outfit.id.startsWith("official-");
      const isJobApplication = outfit.category === "สมัครงาน";
      const source = await fetch(baseOriginal);
      const sourceBlob = await source.blob();

      // Official mode still uses ONE AI request only. Instead of sending a
      // separate uniform reference, build one local composite that already
      // contains the exact real template. AI sees the real collar/shoulders and
      // may edit only head/hair/neck + immediate inner-collar contact.
      const officialPrepared = isOfficialTemplate
        ? await prepareOfficialAiBalanceInput(
            sourceBlob,
            outfit.id,
          )
        : null;

      const blob = isOfficialTemplate
        ? officialPrepared!.imageBlob
        : await optimizeAiInputBlob(
            sourceBlob,
            isJobApplication ? 1280 : 1536,
          );

      const form = new FormData();
      form.append("image", blob, "portrait.png");
      if (isOfficialTemplate) {
        form.append("mask", officialPrepared!.maskBlob, "official-mask.png");
      }

      // All existing non-official/job-application behaviour remains unchanged.
      if (!isOfficialTemplate) {
        const outfitSource = await fetch(outfit.image);
        const outfitSourceBlob = await outfitSource.blob();
        const outfitBlob = await optimizeAiInputBlob(
          outfitSourceBlob,
          isJobApplication ? 1024 : 1536,
        );
        form.append("outfit", outfitBlob, "outfit-reference.png");
      }
      form.append("outfitLabel", `${outfit.label} (${outfit.sub})`);
      form.append("outfitId", outfit.id);
      form.append("outfitCategory", outfit.category);
      form.append("operations", JSON.stringify(aiSelected));
      form.append("hairVolume", hairVolume);
      form.append("skinStyle", skinStyle);
      form.append("skinStrength", String(skinStrength));
      const selectedHairstyle = hairstyleOptions.find(
        (option) => option.id === hairstyle,
      );
      form.append("hairstyle", selectedHairstyle?.label || "ทรงเดิม");
      if (aiSelected.includes("hairstyle") && selectedHairstyle?.image) {
        const hairstyleSource = await fetch(selectedHairstyle.image);
        const hairstyleSourceBlob = await hairstyleSource.blob();
        const hairstyleBlob = await optimizeAiInputBlob(
          hairstyleSourceBlob,
          isOfficialTemplate ? 640 : isJobApplication ? 896 : 1280,
        );
        form.append("hairstyleRef", hairstyleBlob, `${hairstyle}.png`);
      }
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        image?: string;
        error?: string;
        usage?: unknown;
      };
      if (!response.ok || !data.image)
        throw new Error(data.error || "AI ปรับภาพไม่สำเร็จ");
      if (data.usage) {
        console.info("[PhotoID AI usage]", data.usage);
      }
      const normalizedImage = isOfficialTemplate
        ? await finalizeOfficialAiBalancedResult(
            data.image,
            outfit.image,
            outfit.id,
          )
        : await normalizeAiResultToThreeFour(
            await chromaKeyToTransparent(data.image),
            bg,
          );
      setOriginal(normalizedImage);
      setZoom(100);
      setX(0);
      setY(0);
      setAiBaseImage(normalizedImage);
      setAiComposited(true);
      setCutout(null);
      setBefore(false);
      void prepareComparison(baseOriginal, normalizedImage);
      setProcessMessage(
        outfit.id.startsWith("official-")
          ? "สำเร็จ — ใช้เทมเพลตชุดข้าราชการจริง และปรับคน/คอให้สมดุล"
          : "AI ปรับภาพแบบ V3 สำเร็จแล้ว",
      );
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
    const EXPORT_SCALE = 2.5;
    const EXPORT_WIDTH = Math.round(900 * EXPORT_SCALE);   // 2250 px
    const EXPORT_HEIGHT = Math.round(1200 * EXPORT_SCALE); // 3000 px

    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render directly at 2.5x resolution instead of creating 900x1200 first
    // and enlarging afterward. This preserves the maximum detail available
    // from the AI/source image and keeps all geometry identical.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

    const scale =
      Math.min(EXPORT_WIDTH / person.width, EXPORT_HEIGHT / person.height) *
      (zoom / 100);
    const pw = person.width * scale,
      ph = person.height * scale;
    const previewWidth = stageRef.current?.clientWidth || 450;
    const previewHeight = stageRef.current?.clientHeight || 600;
    const exportX = x * (EXPORT_WIDTH / previewWidth);
    const exportY = y * (EXPORT_HEIGHT / previewHeight);

    ctx.filter = `brightness(${100 + skin}%)`;
    ctx.drawImage(
      person,
      (EXPORT_WIDTH - pw) / 2 + exportX,
      (EXPORT_HEIGHT - ph) / 2 + exportY,
      pw,
      ph,
    );
    ctx.filter = "none";

    if (!aiComposited) {
      const cw = 972 * EXPORT_SCALE * (1 + neck / 100),
        ch = cloth.height * (cw / cloth.width);
      ctx.drawImage(
        cloth,
        (EXPORT_WIDTH - cw) / 2,
        EXPORT_HEIGHT - ch + (330 + hair * 2) * EXPORT_SCALE,
        cw,
        ch,
      );
    }

    // Export-only high-resolution micro sharpening.
    // No AI call and no changes to face geometry, skin tone, hair, outfit,
    // background, framing, zoom or alpha edges.
    const sharpened = document.createElement("canvas");
    sharpened.width = EXPORT_WIDTH;
    sharpened.height = EXPORT_HEIGHT;
    const sharpenedCtx = sharpened.getContext("2d", { willReadFrequently: true });
    if (!sharpenedCtx) return;
    sharpenedCtx.imageSmoothingEnabled = true;
    sharpenedCtx.imageSmoothingQuality = "high";

    sharpenedCtx.drawImage(canvas, 0, 0);
    const source = sharpenedCtx.getImageData(
      0,
      0,
      EXPORT_WIDTH,
      EXPORT_HEIGHT,
    );
    const src = source.data;
    const out = new Uint8ClampedArray(src);

    // Slightly gentler sharpening at 2.5x resolution to keep pores, hair and
    // fabric natural while improving fine-edge clarity without halos.
    const strength = 0.12;
    const maxDelta = 8;
    const width = EXPORT_WIDTH;
    const height = EXPORT_HEIGHT;

    for (let yy = 1; yy < height - 1; yy++) {
      for (let xx = 1; xx < width - 1; xx++) {
        const i = (yy * width + xx) * 4;
        const left = i - 4;
        const right = i + 4;
        const up = i - width * 4;
        const down = i + width * 4;

        for (let c = 0; c < 3; c++) {
          const center = src[i + c];
          const blur =
            (src[left + c] + src[right + c] + src[up + c] + src[down + c]) / 4;
          let delta = (center - blur) * strength;
          delta = Math.max(-maxDelta, Math.min(maxDelta, delta));
          out[i + c] = Math.max(0, Math.min(255, Math.round(center + delta)));
        }
        out[i + 3] = src[i + 3];
      }
    }

    source.data.set(out);
    sharpenedCtx.putImageData(source, 0, 0);

    const a = document.createElement("a");
    a.href = sharpened.toDataURL("image/jpeg", 0.995);
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
            <div className="photoid-example"><img src="/reviews/review-01.png" alt="ตัวอย่างผลลัพธ์ 1" /></div>
            <div className="photoid-example"><img src="/reviews/review-02.jpg" alt="ตัวอย่างผลลัพธ์ 2" /></div>
            <div className="photoid-example"><img src="/reviews/review-03.png" alt="ตัวอย่างผลลัพธ์ 3" /></div>
            <div className="photoid-example"><img src="/reviews/review-04.png" alt="ตัวอย่างผลลัพธ์ 4" /></div>
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
