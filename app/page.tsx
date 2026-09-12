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
  {
    id: "women-suit",
    label: "สูทหญิง",
    sub: "สมัครงาน",
    image: "/templates/women-suit.png",
    tone: "suit",
  },
  {
    id: "men-suit",
    label: "สูทชาย",
    sub: "สมัครงาน",
    image: "/templates/men-suit.png",
    tone: "suit",
  },
  {
    id: "job-suit-women-real",
    label: "สูทหญิงสมจริง",
    sub: "สมัครงาน · เชิ้ตขาว",
    image: "/templates/job-suit-women-real.png",
    tone: "suit",
  },
  {
    id: "job-suit-men-real",
    label: "สูทชายสมจริง",
    sub: "สมัครงาน · เชิ้ตขาว",
    image: "/templates/job-suit-men-real.png",
    tone: "suit",
  },
  {
    id: "job-white-shirt-women",
    label: "เชิ้ตขาวหญิง",
    sub: "สมัครงาน",
    image: "/templates/job-white-shirt-women.png",
    tone: "suit",
  },
  {
    id: "job-white-shirt-men",
    label: "เชิ้ตขาวชาย",
    sub: "สมัครงาน",
    image: "/templates/job-white-shirt-men.png",
    tone: "suit",
  },
  {
    id: "job-navy-suit-tie-men",
    label: "สูทกรมชาย",
    sub: "สมัครงาน · ผูกไท",
    image: "/templates/job-navy-suit-tie-men.png",
    tone: "suit",
  },
  {
    id: "job-suit-open-01",
    label: "สูทสมัครงาน 1",
    sub: "ไม่ผูกไท",
    image: "/templates/job-suit-open-01.png",
    tone: "suit",
  },
  {
    id: "job-suit-tie",
    label: "สูทสมัครงาน",
    sub: "ผูกไท",
    image: "/templates/job-suit-tie.png",
    tone: "suit",
  },
  {
    id: "job-suit-open-02",
    label: "สูทสมัครงาน 2",
    sub: "ไม่ผูกไท",
    image: "/templates/job-suit-open-02.png",
    tone: "suit",
  },
  {
    id: "women-student",
    label: "นักศึกษาหญิง",
    sub: "มหาวิทยาลัย",
    image: "/templates/women-student.png",
    tone: "student",
  },
  {
    id: "men-student",
    label: "นักศึกษาชาย",
    sub: "มหาวิทยาลัย",
    image: "/templates/men-student.png",
    tone: "student",
  },
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
  { id: "original", label: "ทรงเดิม", image: null, preview: null },
  ...Array.from({ length: 29 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `hair-${number}`,
      label: `แบบ ${number}`,
      // Send the exact same reference that the user selected. This prevents
      // the visible preview and the generated hairstyle from drifting apart.
      image: `/hairstyle-previews/hair-${number}.png`,
      preview: `/hairstyle-previews/hair-${number}.png`,
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
  const [hasUploaded, setHasUploaded] = useState(false);
  const [aiBaseImage, setAiBaseImage] = useState<string | null>(null);
  const [outfitBaseImage, setOutfitBaseImage] = useState<string | null>(null);
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
  const [selected, setSelected] = useState("women-suit");
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
      setHasUploaded(true);
      setAiBaseImage(null);
      setOutfitBaseImage(null);
      setAiComposited(false);
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
  async function aiEdit(options?: {
    outfitId?: string;
    hairstyleId?: string;
    operations?: string[];
    source?: string;
    successMessage?: string;
  }) {
    const operations = options?.operations ?? aiSelected;
    const targetOutfit =
      outfits.find((item) => item.id === options?.outfitId) ?? outfit;
    const targetHairstyle =
      hairstyleOptions.find((item) => item.id === options?.hairstyleId) ??
      hairstyleOptions.find((item) => item.id === hairstyle);
    if (!operations.length) {
      setProcessMessage("กรุณาเลือกอย่างน้อย 1 รายการ");
      return;
    }
    setAiProcessing(true);
    setProcessMessage(
      operations.length === 1 && operations[0] === "hairstyle"
        ? "AI กำลังเปลี่ยนทรงผมและปรับสีดำ Pro 50%…"
        : operations.includes("outfit")
          ? "AI กำลังเปลี่ยนชุดและปรับภาพให้สมดุล…"
          : "AI กำลังปรับภาพจริง…",
    );
    try {
      const [source, outfitSource] = await Promise.all([
        fetch(options?.source ?? baseOriginal),
        fetch(targetOutfit.image),
      ]);
      const [blob, outfitBlob] = await Promise.all([
        source.blob(),
        outfitSource.blob(),
      ]);
      const form = new FormData();
      form.append("image", blob, "portrait.png");
      form.append("outfit", outfitBlob, "outfit-reference.png");
      form.append(
        "outfitLabel",
        `${targetOutfit.label} (${targetOutfit.sub})`,
      );
      form.append("background", bg);
      form.append("operations", JSON.stringify(operations));
      form.append(
        "editMode",
        operations.length === 1 && operations[0] === "hairstyle"
          ? "hairstyle-only"
          : "full",
      );
      form.append("hairVolume", hairVolume);
      form.append("skinStyle", skinStyle);
      form.append("skinStrength", String(skinStrength));
      form.append("hairstyle", targetHairstyle?.label || "ทรงเดิม");
      if (targetHairstyle?.image) {
        const hairstyleSource = await fetch(targetHairstyle.image);
        const hairstyleBlob = await hairstyleSource.blob();
        form.append(
          "hairstyleRef",
          hairstyleBlob,
          `${targetHairstyle.id}.png`,
        );
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
      setOriginal(data.image);
      setAiBaseImage(data.image);
      setAiComposited(true);
      setCutout(null);
      setProcessMessage(
        options?.successMessage || "AI ปรับภาพแบบ V3 สำเร็จแล้ว",
      );
      return data.image;
    } catch (e) {
      setProcessMessage(
        e instanceof Error ? e.message : "AI ปรับภาพไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
      return null;
    } finally {
      setAiProcessing(false);
    }
  }
  async function selectOutfit(outfitId: string) {
    if (aiProcessing) return;
    if (!hasUploaded) {
      setProcessMessage("กรุณาอัปโหลดรูปก่อนเลือกชุด");
      inputRef.current?.click();
      return;
    }
    setSelected(outfitId);
    setHairstyle("original");
    const result = await aiEdit({
      outfitId,
      hairstyleId: "original",
      source: baseOriginal,
      operations: [
        "outfit",
        ...aiSelected.filter((id) => id !== "hairstyle"),
      ],
      successMessage: "เปลี่ยนชุดด้วย AI สำเร็จแล้ว เลือกทรงผมต่อได้เลย",
    });
    if (result) setOutfitBaseImage(result);
  }
  async function selectHairstyle(hairstyleId: string) {
    if (aiProcessing) return;
    if (!hasUploaded) {
      setProcessMessage("กรุณาอัปโหลดรูปก่อนเลือกทรงผม");
      inputRef.current?.click();
      return;
    }
    if (!outfitBaseImage) {
      setProcessMessage("กรุณาเลือกชุดและรอ AI เปลี่ยนชุดให้เสร็จก่อน");
      return;
    }
    setHairstyle(hairstyleId);
    if (hairstyleId === "original") {
      setOriginal(outfitBaseImage);
      setAiBaseImage(outfitBaseImage);
      setProcessMessage("เลือกทรงผมเดิมแล้ว");
      return;
    }
    await aiEdit({
      hairstyleId,
      // Every hairstyle starts from the immutable completed-outfit portrait.
      // Never chain a hairstyle result into the next hairstyle request.
      source: outfitBaseImage ?? aiBaseImage ?? baseOriginal,
      operations: ["hairstyle"],
      successMessage: "เปลี่ยนทรงผมและปรับดำ Pro 50% สำเร็จแล้ว",
    });
  }
  async function changeBackground(color: string) {
    if (!aiComposited || !aiBaseImage) {
      setBg(color);
      return;
    }
    if (backgroundProcessing || color === bg) return;
    setBackgroundProcessing(true);
    setProcessMessage("AI กำลังเปลี่ยนเฉพาะพื้นหลังและเก็บขอบภาพ…");
    try {
      const source = await fetch(aiBaseImage);
      const blob = await source.blob();
      const form = new FormData();
      form.append("image", blob, "v3-portrait.png");
      form.append("background", color);
      const response = await fetch("/api/change-background", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        image?: string;
        error?: string;
      };
      if (!response.ok || !data.image)
        throw new Error(data.error || "AI เปลี่ยนพื้นหลังไม่สำเร็จ");
      setOriginal(data.image);
      setCutout(null);
      setBg(color);
      setProcessMessage("AI เปลี่ยนพื้นหลังและเก็บขอบเรียบร้อยแล้ว");
    } catch (e) {
      setProcessMessage(
        e instanceof Error
          ? e.message
          : "AI เปลี่ยนพื้นหลังไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setBackgroundProcessing(false);
    }
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
      (aiComposited
        ? Math.max(900 / person.width, 1200 / person.height)
        : Math.min(900 / person.width, 1200 / person.height)) *
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
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Camera />
          </div>
          <div>
            <strong>รูปพร้อมใช้</strong>
            <small>รูปสวย ถูกต้อง พร้อมใช้ทุกโอกาส</small>
          </div>
        </div>
        <nav>
          <button className="nav-active">
            <ImageIcon />
            สร้างรูปถ่าย
          </button>
          <button>
            <Clock3 />
            ประวัติการใช้งาน
          </button>
          <button>
            <Grid2X2 />
            เทมเพลต
          </button>
          <button>
            <Settings />
            ตั้งค่า
          </button>
          <button>
            <CircleHelp />
            ช่วยเหลือ
          </button>
        </nav>
        <div className="premium">
          <div className="crown">♛</div>
          <b>
            อัปเกรดเป็น
            <br />
            <em>Premium</em>
          </b>
          <ul>
            <li>ปลดล็อกทุกชุด</li>
            <li>ความละเอียดสูง</li>
            <li>ไม่มีลายน้ำ</li>
          </ul>
          <button>อัปเกรดเลย</button>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="stepper">
            {steps.map((s, i) => (
              <div
                className={`step ${i < 3 ? "done" : i === 3 ? "current" : ""}`}
                key={s}
              >
                <span>{i < 3 ? <Check /> : i + 1}</span>
                <b>{s}</b>
                {i < 4 && <i />}
              </div>
            ))}
          </div>
          <div className="actions">
            <button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
            >
              <Save />
              {saved ? "บันทึกแล้ว" : "บันทึกงาน"}
            </button>
            <button className="primary" onClick={download}>
              <Download />
              ดาวน์โหลด
            </button>
          </div>
        </header>
        <div className="editor-grid">
          <aside className="source-panel card">
            <h2>รูปต้นฉบับ</h2>
            <button
              className="source-photo"
              onClick={() => inputRef.current?.click()}
            >
              <img src={baseOriginal} alt="รูปต้นฉบับที่อัปโหลด" />
              <span>
                <Upload />
                เปลี่ยนรูป
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={pickFile}
              hidden
            />
            <button
              className="remove-bg"
              onClick={removeBackground}
              disabled={processing}
            >
              {processing ? <LoaderCircle className="spin" /> : <Scissors />}
              <span>
                <b>
                  {processing ? "กำลังตัดพื้นหลัง" : "ตัดพื้นหลังอัตโนมัติ"}
                </b>
                <small>{processMessage || "รูปประมวลผลในเครื่องของคุณ"}</small>
              </span>
            </button>
            <div className="file-info">
              <h3>ข้อมูลรูปภาพ</h3>
              <p>
                <ImageIcon />
                ขนาดไฟล์ <b>2.4 MB</b>
              </p>
              <p>
                <Maximize2 />
                ขนาดรูป <b>1024 × 1156 px</b>
              </p>
              <p>
                <ImageIcon />
                ประเภท <b>JPEG</b>
              </p>
            </div>
          </aside>
          <section className="preview-panel card">
            <div
              ref={stageRef}
              className="photo-stage"
              style={{ background: bg }}
              onPointerDown={(e) => {
                dragStart.current = { px: e.clientX, py: e.clientY, x, y };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!dragStart.current) return;
                setX(dragStart.current.x + e.clientX - dragStart.current.px);
                setY(dragStart.current.y + e.clientY - dragStart.current.py);
              }}
              onPointerUp={() => {
                dragStart.current = null;
              }}
              onPointerCancel={() => {
                dragStart.current = null;
              }}
            >
              <img
                className={`person-layer ${aiComposited ? "ai-result" : ""}`}
                src={shownSrc}
                alt="ภาพลูกค้า"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${zoom / 100})`,
                  filter: `brightness(${100 + skin}%)`,
                }}
              />
              {(aiProcessing || backgroundProcessing) && (
                <div className="background-ai-loading">
                  <LoaderCircle className="spin" />
                  <b>{processMessage || "AI กำลังประมวลผลภาพ…"}</b>
                  <small>กรุณารอประมาณ 30–90 วินาที</small>
                  <span className="ai-loading-track" aria-hidden="true">
                    <span />
                  </span>
                </div>
              )}
              {!aiComposited && (
                <img
                  className="template-layer"
                  src={outfit.image}
                  alt={outfit.label}
                  style={{
                    transform: `translateY(${hair * 2}px) scale(${1 + neck / 100})`,
                  }}
                />
              )}
              {!aiComposited && (
                <>
                  <div className="crop-box" />
                  <div className="guide vertical" />
                  <div className="guide eye" />
                  <div className="guide chin" />
                  <div
                    className="face-ring"
                    style={{ transform: `scale(${head / 75})` }}
                  />
                  <div className="guide-note">
                    ลากรูปเพื่อจัดใบหน้า
                    <br />
                    ให้อยู่กึ่งกลางกรอบ
                  </div>
                  <span className="measure">
                    ศีรษะอยู่ในกรอบ
                    <br />
                    <b>70–80%</b>
                  </span>
                </>
              )}
            </div>
            <div className="preview-tools">
              <div className="zoom">
                <button onClick={() => setZoom(Math.max(70, zoom - 5))}>
                  <ZoomOut />
                </button>
                <b>{zoom}%</b>
                <button onClick={() => setZoom(Math.min(130, zoom + 5))}>
                  <ZoomIn />
                </button>
              </div>
            </div>
          </section>
          <aside className="adjust-panel card">
            <div className="panel-title">
              <div>
                <h2>
                  <SlidersHorizontal />
                  ปรับภาพให้สมบูรณ์แบบ
                </h2>
                <p>เลือกสิ่งที่ต้องการ แล้วให้ AI ปรับภาพจริง</p>
              </div>
              <button onClick={reset}>
                <RotateCcw />
                รีเซ็ตทั้งหมด
              </button>
            </div>
            <button className="auto-button" onClick={auto}>
              <WandSparkles />
              <span>
                <b>จัดตำแหน่งอัตโนมัติ</b>
                <small>จัดขนาดใบหน้าและตำแหน่งชุด</small>
              </span>
              <b>›</b>
            </button>
            <section className="ai-editor">
              <div className="ai-editor-title">
                <b>
                  <WandSparkles />
                  ปรับด้วย AI จริง
                </b>
                <small>รักษาใบหน้าเดิมและแก้เฉพาะจุดที่เลือก</small>
              </div>
              <div className="ai-option-grid">
                {aiOptions.map((o) => (
                  <button
                    type="button"
                    key={o.id}
                    className={aiSelected.includes(o.id) ? "selected" : ""}
                    onClick={() => toggleAi(o.id)}
                  >
                    <span className="ai-check">
                      {aiSelected.includes(o.id) && <Check />}
                    </span>
                    <span>
                      <b>{o.label}</b>
                      <small>{o.detail}</small>
                    </span>
                  </button>
                ))}
              </div>
              {aiSelected.includes("hair-volume") && (
                <div className="hair-volume">
                  <span>ความหนาผม</span>
                  {(["ลด", "คงเดิม", "เพิ่ม"] as const).map((v) => (
                    <button
                      key={v}
                      className={hairVolume === v ? "active" : ""}
                      onClick={() => setHairVolume(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
              {aiSelected.includes("hairstyle") && (
                <div className="hairstyle-control">
                  <div className="hairstyle-heading">
                    <b>เลือกทรงผม</b>
                    <small>
                      {outfitBaseImage
                        ? "เลือกแล้ว AI จะปรับทันที พร้อมสีผมดำ Pro 50%"
                        : "กรุณาเลือกชุดและรอให้ AI เปลี่ยนชุดเสร็จก่อน"}
                    </small>
                  </div>
                  <div
                    className={`hairstyle-options${outfitBaseImage ? "" : " locked"}`}
                    aria-disabled={!outfitBaseImage}
                  >
                    {hairstyleOptions.map((style) => (
                      <button
                        type="button"
                        key={style.id}
                        className={hairstyle === style.id ? "active" : ""}
                        onClick={() => void selectHairstyle(style.id)}
                        disabled={aiProcessing || !outfitBaseImage}
                      >
                        {style.image ? (
                          <img
                            src={style.preview || style.image}
                            alt={`ตัวอย่างทรงผม ${style.label}`}
                          />
                        ) : (
                          <UserRound />
                        )}
                        <span>{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {aiSelected.includes("skin-light") && (
                <div className="skin-style-control">
                  <div className="skin-style-title">
                    <span>
                      <b>แสงและผิวธรรมชาติ</b>
                      <small>รักษารูขุมขนและหน้าเดิม</small>
                    </span>
                    <output>{skinStrength}%</output>
                  </div>
                  <div className="skin-style-presets">
                    {(["ธรรมชาติ", "สดใส", "สตูดิโอ"] as const).map(
                      (style) => (
                        <button
                          type="button"
                          key={style}
                          className={skinStyle === style ? "active" : ""}
                          onClick={() => setSkinStyle(style)}
                        >
                          {style}
                        </button>
                      ),
                    )}
                  </div>
                  <label>
                    <span>ระดับการปรับ</span>
                    <input
                      aria-label="ระดับการปรับแสงและผิว"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={skinStrength}
                      onChange={(e) => setSkinStrength(Number(e.target.value))}
                    />
                  </label>
                  <small className="skin-apply-hint">
                    ตั้งค่าแล้วกด “ปรับด้วย AI” ด้านล่างเพื่อใช้กับภาพ
                  </small>
                </div>
              )}
              <button
                className="run-ai"
                onClick={() => void aiEdit()}
                disabled={aiProcessing}
              >
                {aiProcessing ? (
                  <LoaderCircle className="spin" />
                ) : (
                  <WandSparkles />
                )}
                {aiProcessing
                  ? "กำลังปรับภาพ…"
                  : `ปรับด้วย AI (${aiSelected.length} รายการ)`}
              </button>
            </section>
            <details className="manual-adjust">
              <summary>จัดตำแหน่งด้วยมือ</summary>
              <div className="controls">
                <Control label="ใบหน้าซ้าย–ขวา" value={x} onChange={setX} />
                <Control label="ใบหน้าขึ้น–ลง" value={y} onChange={setY} />
                <Control
                  label="ขนาดศีรษะ"
                  value={head}
                  min={65}
                  max={90}
                  onChange={setHead}
                  suffix="%"
                />
                <Control
                  label="ขนาดชุด"
                  value={neck}
                  min={-12}
                  max={12}
                  onChange={setNeck}
                />
                <Control
                  label="ชุดขึ้น–ลง"
                  value={hair}
                  min={-20}
                  max={20}
                  onChange={setHair}
                />
                <Control
                  label="ความสว่าง"
                  value={skin}
                  min={-10}
                  max={10}
                  onChange={setSkin}
                />
              </div>
            </details>
            <div className="background-control">
              <button>
                <span className="swatch" style={{ background: bg }} />
                พื้นหลัง
                <ChevronDown />
              </button>
              <div className="colors">
                {[
                  "#1682ee",
                  "#fff",
                  "#cfd5df",
                  "#61a8f6",
                  "#cf202e",
                  "#a6d8ff",
                ].map((c) => (
                  <button
                    aria-label={`สีพื้นหลัง ${c}`}
                    className={bg === c ? "selected" : ""}
                    key={c}
                    onClick={() => changeBackground(c)}
                    disabled={backgroundProcessing}
                    style={{ background: c }}
                  >
                    {bg === c && <Check />}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
        <section className="outfit-bar">
          <div className="outfit-heading">
            <b>เลือกชุด</b>
            <div className="category-tabs">
              <button className="active">▰ ข้าราชการ</button>
              <button>♟ ชุดราชการอื่น ๆ</button>
              <button>▣ สมัครงาน</button>
              <button>◆ นักเรียน/นักศึกษา</button>
              <button>◆ รับปริญญา</button>
            </div>
          </div>
          <div className="outfit-content">
            <div className="outfit-list">
              {outfits.map((o) => (
                <button
                  key={o.id}
                  onClick={() => void selectOutfit(o.id)}
                  disabled={aiProcessing}
                  className={`outfit ${selected === o.id ? "selected" : ""} ${o.tone}`}
                >
                  <img src={o.image} alt={o.label} />
                  <b>{o.label}</b>
                  <small>({o.sub})</small>
                </button>
              ))}
              <button className="all-outfits">
                <UserRound />
                ดูเทมเพลตทั้งหมด<span>›</span>
              </button>
            </div>
            <div className="ready-card">
              <h3>▣ รูปพร้อมใช้ มาตรฐานราชการ</h3>
              <p>
                <Check />
                ขนาดและสัดส่วนถูกต้องตามระเบียบ
              </p>
              <p>
                <Check />
                พื้นหลังสีมาตรฐาน
              </p>
              <p>
                <Check />
                แต่งกายถูกต้องตามประเภท
              </p>
              <p>
                <Check />
                ใช้ได้ทั้งสมัครงานและราชการ
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
