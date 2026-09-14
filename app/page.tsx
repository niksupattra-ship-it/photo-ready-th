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
    // Export-only micro sharpening: restore fine detail softened by resize/compositing.
    // No AI call and no changes to geometry, face, skin tone, hair, outfit, background,
    // framing, zoom, or alpha edges.
    const sharpened = document.createElement("canvas");
    sharpened.width = 900;
    sharpened.height = 1200;
    const sharpenedCtx = sharpened.getContext("2d", { willReadFrequently: true });
    if (!sharpenedCtx) return;

    sharpenedCtx.drawImage(canvas, 0, 0);
    const source = sharpenedCtx.getImageData(0, 0, 900, 1200);
    const src = source.data;
    const out = new Uint8ClampedArray(src);

    // Conservative local unsharp mask: enough for camera-like micro-contrast,
    // capped to avoid halos and artificial skin texture.
    const strength = 0.18;
    const maxDelta = 10;
    const width = 900;
    const height = 1200;

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
    a.href = sharpened.toDataURL("image/jpeg", 0.98);
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
