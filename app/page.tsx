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
  { id: "hairstyle", label: "เปลี่ยนทรงผม", detail: "เลือกทรงผมสุภาพ 29 แบบ" },
  {
    id: "hair-edge",
    label: "ทำขอบผมให้เนียน",
    detail: "เก็บขอบละเอียด ไม่แข็ง",
  },
];
const hairstyleOptions = [
  "original",
  ...Array.from(
    { length: 29 },
    (_, index) => `hair-${String(index + 1).padStart(2, "0")}`,
  ),
].map((id) => ({
  id,
  label: id === "original" ? "ทรงเดิม" : `แบบ ${id.slice(-2)}`,
  image: id === "original" ? "" : `/hairstyles/${id}.png`,
  preview: id === "original" ? "" : `/hairstyle-previews/${id}.png`,
}));

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
  const dragStart = useRef<{
    px: number;
    py: number;
    x: number;
    y: number;
  } | null>(null);
  const [original, setOriginal] = useState("/demo/original.png");
  const [cutout, setCutout] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSelected, setAiSelected] = useState<string[]>(
    aiOptions.map((o) => o.id),
  );
  const [hairVolume, setHairVolume] = useState<"ลด" | "คงเดิม" | "เพิ่ม">(
    "คงเดิม",
  );
  const [skinStyle, setSkinStyle] = useState<"ธรรมชาติ" | "สดใส" | "สตูดิโอ">(
    "ธรรมชาติ",
  );
  const [skinStrength, setSkinStrength] = useState(15);
  const [hairstyle, setHairstyle] = useState("original");
  const hairstyleBase = useRef<string | null>(null);
  const outfitCutout = useRef<string | null>(null);
  const uploadBase = useRef("/demo/original.png");
  const outfitBase = useRef<string | null>(null);
  const [aiComposited, setAiComposited] = useState(false);
  const [processMessage, setProcessMessage] = useState("");
  const [selected, setSelected] = useState("women-suit");
  const [before, setBefore] = useState(false);
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
      const src = URL.createObjectURL(f);
      setOriginal(src);
      uploadBase.current = src;
      outfitBase.current = null;
      outfitCutout.current = null;
      setAiComposited(false);
      setCutout(null);
      setHairstyle("original");
      hairstyleBase.current = null;
      setProcessMessage("");
    }
  }
  function toggleAi(id: string) {
    setAiSelected((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  }
  async function restoreOriginalFace(
    sourceUrl: string,
    editedUrl: string,
  ): Promise<string> {
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    try {
      const [{ FilesetResolver, FaceDetector }, source, edited] =
        await Promise.all([
          import("@mediapipe/tasks-vision"),
          loadImage(sourceUrl),
          loadImage(editedUrl),
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
      const face = detector.detect(source).detections[0]?.boundingBox;
      detector.close();
      if (!face) return editedUrl;

      const canvas = document.createElement("canvas");
      canvas.width = edited.naturalWidth;
      canvas.height = edited.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return editedUrl;
      ctx.drawImage(edited, 0, 0, canvas.width, canvas.height);

      const layer = document.createElement("canvas");
      layer.width = canvas.width;
      layer.height = canvas.height;
      const layerCtx = layer.getContext("2d");
      if (!layerCtx) return editedUrl;
      layerCtx.drawImage(source, 0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / source.naturalWidth;
      const scaleY = canvas.height / source.naturalHeight;
      const cx = (face.originX + face.width / 2) * scaleX;
      const cy = (face.originY + face.height * 0.56) * scaleY;
      const rx = face.width * 0.43 * scaleX;
      const ry = face.height * 0.47 * scaleY;
      layerCtx.globalCompositeOperation = "destination-in";
      layerCtx.filter = "blur(2px)";
      layerCtx.beginPath();
      layerCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      layerCtx.fill();
      layerCtx.filter = "none";
      layerCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(layer, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return editedUrl;
    }
  }
  async function aiEdit(hairstyleId = hairstyle) {
    if (!aiSelected.length) {
      setProcessMessage("กรุณาเลือกอย่างน้อย 1 รายการ");
      return;
    }
    setAiProcessing(true);
    setProcessMessage("AI กำลังปรับภาพจริง อาจใช้เวลาประมาณ 30–90 วินาที…");
    try {
      const selectedHairstyle = hairstyleOptions.find(
        (item) => item.id === hairstyleId,
      );
      const hairOnly = hairstyleId !== "original";
      const sourceUrl = hairOnly ? hairstyleBase.current || original : original;
      const source = await fetch(sourceUrl);
      const blob = await source.blob();
      const form = new FormData();
      form.append("image", blob, "portrait.png");
      form.append("operations", JSON.stringify(aiSelected));
      form.append("hairVolume", hairVolume);
      form.append("skinStyle", skinStyle);
      form.append("skinStrength", String(skinStrength));
      if (hairOnly && selectedHairstyle?.image) {
        const ref = await fetch(selectedHairstyle.image);
        form.append("hairstyleRef", await ref.blob(), `${hairstyleId}.png`);
        form.append("hairstyle", selectedHairstyle.label);
        form.append("operations", JSON.stringify(["hairstyle"]));
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
      const finalImage = hairOnly
        ? await restoreOriginalFace(sourceUrl, data.image)
        : data.image;
      setOriginal(finalImage);
      setX(0);
      setY(0);
      setZoom(100);
      if (hairOnly && aiComposited) setCutout(finalImage);
      else if (aiComposited) await removeBackground(finalImage);
      else setCutout(null);
      setBefore(false);
      setProcessMessage(
        aiComposited
          ? "เปลี่ยนทรงผมและแยกพื้นหลังเรียบร้อยแล้ว"
          : "ปรับภาพเรียบร้อยแล้ว",
      );
    } catch (e) {
      setProcessMessage(
        e instanceof Error ? e.message : "AI ปรับภาพไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setAiProcessing(false);
    }
  }
  async function confirmOutfit() {
    if (aiProcessing) return;
    setAiProcessing(true);
    setProcessMessage("กำลังเปลี่ยนชุดและปรับภาพให้สมดุล…");
    try {
      const [source, outfitSource] = await Promise.all([
        fetch(uploadBase.current),
        fetch(outfit.image),
      ]);
      const form = new FormData();
      form.append("image", await source.blob(), "portrait.png");
      form.append("outfit", await outfitSource.blob(), "outfit-reference.png");
      form.append("outfitLabel", `${outfit.label} (${outfit.sub})`);
      form.append(
        "operations",
        JSON.stringify([
          "outfit",
          ...aiSelected.filter((id) => id !== "hairstyle"),
        ]),
      );
      form.append("hairVolume", hairVolume);
      form.append("skinStyle", skinStyle);
      form.append("skinStrength", String(skinStrength));
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as {
        image?: string;
        error?: string;
      };
      if (!response.ok || !data.image)
        throw new Error(data.error || "เปลี่ยนชุดไม่สำเร็จ");
      setOriginal(data.image);
      setX(0);
      setY(0);
      setZoom(100);
      outfitBase.current = data.image;
      hairstyleBase.current = data.image;
      setHairstyle("original");
      setAiComposited(true);
      const separated = await removeBackground(data.image);
      outfitCutout.current = separated;
      setProcessMessage(
        separated
          ? "เปลี่ยนชุดและแยกพื้นหลังเรียบร้อยแล้ว"
          : "เปลี่ยนชุดสำเร็จ แต่ยังแยกพื้นหลังไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } catch (e) {
      setProcessMessage(
        e instanceof Error ? e.message : "เปลี่ยนชุดไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setAiProcessing(false);
    }
  }
  async function selectHairstyle(id: string) {
    if (aiProcessing) return;
    if (id !== "original" && !aiComposited) {
      setProcessMessage("กรุณายืนยันเปลี่ยนชุดก่อนเลือกทรงผม");
      return;
    }
    setHairstyle(id);
    if (id === "original") {
      if (outfitBase.current) {
        setOriginal(outfitBase.current);
        setCutout(outfitCutout.current);
        setProcessMessage("กลับมาใช้ทรงผมเดิมแล้ว");
      }
      return;
    }
    if (!hairstyleBase.current) hairstyleBase.current = original;
    await aiEdit(id);
  }
  async function removeBackground(sourceImage = original) {
    setProcessing(true);
    setProcessMessage("กำลังตัดพื้นหลังโดยคงภาพบุคคลเดิม…");
    try {
      const [{ FilesetResolver, ImageSegmenter }, img] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = sourceImage;
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
      if (!mask) throw new Error("ไม่พบตัวบุคคล");

      // สร้างหน้ากากที่ความละเอียดต้นทางก่อน แล้วค่อยขยายแบบ smoothing
      // เพื่อไม่ให้ภาพบุคคลถูกลดเหลือเท่าความละเอียดของโมเดล segmentation
      const smallMask = document.createElement("canvas");
      smallMask.width = mask.width;
      smallMask.height = mask.height;
      const smallCtx = smallMask.getContext("2d");
      if (!smallCtx) throw new Error("สร้างหน้ากากไม่ได้");
      const maskPixels = smallCtx.createImageData(mask.width, mask.height);
      const values = mask.getAsFloat32Array();
      for (let i = 0; i < values.length; i++) {
        const t = Math.max(0, Math.min(1, (values[i] - 0.18) / 0.68));
        const alpha = t * t * (3 - 2 * t);
        maskPixels.data[i * 4] = 255;
        maskPixels.data[i * 4 + 1] = 255;
        maskPixels.data[i * 4 + 2] = 255;
        maskPixels.data[i * 4 + 3] = Math.round(alpha * 255);
      }
      smallCtx.putImageData(maskPixels, 0, 0);

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("เปิดพื้นที่ประมวลผลไม่ได้");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-in";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.filter = "blur(0.65px)";
      ctx.drawImage(smallMask, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
      mask.close();
      segmenter.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("สร้างภาพโปร่งใสไม่ได้");
      const cutoutUrl = URL.createObjectURL(blob);
      setCutout(cutoutUrl);
      setProcessMessage("ตัดพื้นหลังเรียบร้อย ใบหน้าและภาพบุคคลคงเดิม");
      return cutoutUrl;
    } catch (e) {
      setProcessMessage(
        e instanceof Error
          ? e.message
          : "ตัดพื้นหลังไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setProcessing(false);
    }
    return null;
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
      Math.min(900 / person.width, 1200 / person.height) * (zoom / 100);
    const pw = person.width * scale,
      ph = person.height * scale;
    ctx.filter = `brightness(${100 + skin}%)`;
    ctx.drawImage(
      person,
      (900 - pw) / 2 + x * 2,
      (1200 - ph) / 2 + y * 2,
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
            <div className="brand-title">
              <strong>รูปพร้อมใช้</strong>
              <span className="version-badge">V3.4</span>
            </div>
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
              <img src={original} alt="รูปต้นฉบับ" />
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
            <div className="before-label">ก่อนปรับ (Before)</div>
            <button
              className="remove-bg"
              onClick={() => void removeBackground()}
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
                className="person-layer"
                src={shownSrc}
                alt="ภาพลูกค้า"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${zoom / 100})`,
                  filter: `brightness(${100 + skin}%)`,
                }}
              />
              {!before && !aiComposited && (
                <img
                  className="template-layer"
                  src={outfit.image}
                  alt={outfit.label}
                  style={{
                    transform: `translateY(${hair * 2}px) scale(${1 + neck / 100})`,
                  }}
                />
              )}
              {aiProcessing && (
                <div className="ai-loading">
                  <LoaderCircle className="spin" />
                  <b>{processMessage || "กำลังประมวลผลภาพ…"}</b>
                  <small>กรุณารอประมาณ 30–90 วินาที</small>
                  <span>
                    <i />
                  </span>
                </div>
              )}
              {!before && !aiComposited && (
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
              <button onClick={() => setBefore(!before)}>
                <ImageIcon />
                เปรียบเทียบ
              </button>
              <div className="segmented">
                <button
                  className={before ? "active" : ""}
                  onClick={() => setBefore(true)}
                >
                  ก่อนปรับ
                </button>
                <button
                  className={!before ? "active" : ""}
                  onClick={() => setBefore(false)}
                >
                  หลังปรับ
                </button>
              </div>
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
            <button
              className="confirm-outfit"
              onClick={confirmOutfit}
              disabled={aiProcessing}
            >
              {aiProcessing ? <LoaderCircle className="spin" /> : <Check />}
              <span>
                <b>{aiProcessing ? "กำลังเปลี่ยนชุด…" : "ยืนยันเปลี่ยนชุด"}</b>
                <small>ใช้ชุดที่แสดงอยู่ในพรีวิว</small>
              </span>
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
                  <b>เลือกทรงผม</b>
                  <div className="hairstyle-options">
                    {hairstyleOptions.map((style) => (
                      <button
                        type="button"
                        key={style.id}
                        className={hairstyle === style.id ? "active" : ""}
                        onClick={() => selectHairstyle(style.id)}
                        disabled={aiProcessing}
                      >
                        {style.preview ? (
                          <img
                            src={style.preview}
                            alt={`ตัวอย่างทรงผม ${style.label}`}
                          />
                        ) : (
                          <UserRound />
                        )}
                        <small>{style.label}</small>
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
                      <small>รักษารูขุมขนและใบหน้าเดิม</small>
                    </span>
                    <output>{skinStrength}%</output>
                  </div>
                  <div className="skin-style-presets">
                    {(["ธรรมชาติ", "สดใส", "สตูดิโอ"] as const).map((style) => (
                      <button
                        type="button"
                        key={style}
                        className={skinStyle === style ? "active" : ""}
                        onClick={() => setSkinStyle(style)}
                      >
                        {style}
                      </button>
                    ))}
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
                </div>
              )}
              <button
                className="run-ai"
                onClick={() => aiEdit()}
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
                    onClick={() => setBg(c)}
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
                  onClick={() => {
                    setSelected(o.id);
                    setOriginal(uploadBase.current);
                    setCutout(null);
                    setAiComposited(false);
                    setHairstyle("original");
                    outfitBase.current = null;
                    outfitCutout.current = null;
                    hairstyleBase.current = null;
                  }}
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
