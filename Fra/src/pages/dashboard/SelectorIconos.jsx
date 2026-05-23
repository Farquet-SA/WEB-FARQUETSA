// components/IconPicker/IconPicker.jsx
import { useState } from "react";

import {
  Heart,
  Star,
  ShoppingBag,
  ShoppingCart,
  Gift,
  Leaf,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Award,
  Smile,
  Sun,
  Sparkles,
  Camera,
  Package,
  Tag,
  Scissors,
  Palette,
  Users,
  Home,
  Image,
  Flower,
  Lock,

  // Nuevos íconos para farmacia
  Pill,
  Cross,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Thermometer,
  Hospital,
  Activity,
  BadgeCheck,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Ambulance,
  Baby,
  Bone,
  Eye,
  ScanLine,
  Microscope,
  Droplets,
  UserRound,
  Shield,
  Plus,
  CircleHelp,
  BicepsFlexed,
} from "lucide-react";

// Mapa de íconos disponibles
const ICONS = [
  // Generales
  { name: "Lock", label: "Seguridad", Icon: Lock },
  { name: "Heart", label: "Corazón", Icon: Heart },
  { name: "Star", label: "Estrella", Icon: Star },
  { name: "ShoppingBag", label: "Bolsa", Icon: ShoppingBag },
  { name: "ShoppingCart", label: "Carrito", Icon: ShoppingCart },
  { name: "Gift", label: "Regalo", Icon: Gift },
  { name: "Flower", label: "Flor", Icon: Flower },
  { name: "Leaf", label: "Hoja", Icon: Leaf },
  { name: "Truck", label: "Envío", Icon: Truck },
  { name: "Clock", label: "Tiempo", Icon: Clock },
  { name: "MapPin", label: "Lugar", Icon: MapPin },
  { name: "Phone", label: "Teléfono", Icon: Phone },
  { name: "Mail", label: "Correo", Icon: Mail },
  { name: "CheckCircle", label: "Verificado", Icon: CheckCircle },
  { name: "Award", label: "Premio", Icon: Award },
  { name: "Smile", label: "Sonrisa", Icon: Smile },
  { name: "Sun", label: "Sol", Icon: Sun },
  { name: "Sparkles", label: "Destellos", Icon: Sparkles },
  { name: "Camera", label: "Cámara", Icon: Camera },
  { name: "Package", label: "Paquete", Icon: Package },
  { name: "Tag", label: "Etiqueta", Icon: Tag },
  { name: "Scissors", label: "Tijeras", Icon: Scissors },
  { name: "Palette", label: "Paleta", Icon: Palette },
  { name: "Users", label: "Clientes", Icon: Users },
  { name: "Home", label: "Inicio", Icon: Home },
  { name: "Image", label: "Imagen", Icon: Image },

  // Farmacia / Salud
  { name: "Pill", label: "Medicamentos", Icon: Pill },
  { name: "Cross", label: "Salud", Icon: Cross },
  { name: "ShieldCheck", label: "Protección", Icon: ShieldCheck },
  { name: "Shield", label: "Seguro", Icon: Shield },
  { name: "Stethoscope", label: "Consulta", Icon: Stethoscope },
  { name: "Syringe", label: "Vacunas", Icon: Syringe },
  { name: "Thermometer", label: "Temperatura", Icon: Thermometer },
  { name: "Hospital", label: "Hospital", Icon: Hospital },
  { name: "Activity", label: "Actividad", Icon: Activity },
  { name: "BadgeCheck", label: "Certificado", Icon: BadgeCheck },
  { name: "ClipboardList", label: "Recetas", Icon: ClipboardList },
  { name: "FileText", label: "Documentos", Icon: FileText },
  { name: "FlaskConical", label: "Laboratorio", Icon: FlaskConical },
  { name: "HeartPulse", label: "Cardiología", Icon: HeartPulse },
  { name: "Ambulance", label: "Emergencias", Icon: Ambulance },
  { name: "Baby", label: "Bebés", Icon: Baby },
  { name: "Bone", label: "Ortopedia", Icon: Bone },
  { name: "Eye", label: "Visión", Icon: Eye },
  { name: "ScanLine", label: "Escaneo", Icon: ScanLine },
  { name: "Microscope", label: "Análisis", Icon: Microscope },
  { name: "Droplets", label: "Hidratación", Icon: Droplets },
  { name: "UserRound", label: "Paciente", Icon: UserRound },
  { name: "Plus", label: "Cruz Médica", Icon: Plus },
  { name: "CircleHelp", label: "Ayuda", Icon: CircleHelp },
  { name: "BicepsFlexed", label: "Suplementos", Icon: BicepsFlexed },
];
export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = ICONS.filter(
    (i) =>
      i.label.toLowerCase().includes(search.toLowerCase()) ||
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = ICONS.find((i) => i.name === value);
  const SelectedIcon = selected?.Icon;

  return (
    <div style={{ position: "relative" }}>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={triggerStyle}
      >
        {SelectedIcon ? (
          <SelectedIcon size={18} />
        ) : (
          <span style={{ color: "#aaa" }}></span>
        )}
        <span
          style={{
            flex: 1,
            textAlign: "left",
            color: selected ? "#0b2b4b" : "#666",
            fontSize: 15,
          }}
        >
          {selected ? selected.label : "Seleccionar ícono *"}
        </span>
        <span style={{ fontSize: 12, color: "#aaa" }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Panel desplegable */}
      {open && (
        <div style={panelStyle}>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={searchStyle}
          />

          <div style={gridStyle}>
            {filtered.length === 0 && (
              <p
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                Sin resultados
              </p>
            )}
            {filtered.map((item) => {
              const ItemIcon = item.Icon;
              return (
              <button
                key={item.name}
                type="button"
                title={item.label}
                onClick={() => {
                  onChange(item.name);
                  setOpen(false);
                  setSearch("");
                }}
                style={{
                  ...itemStyle,
                  ...(value === item.name ? selectedItemStyle : {}),
                }}
              >
                <ItemIcon size={20} />
                <span style={itemLabelStyle}>{item.label}</span>
              </button>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Estilos ---
const triggerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5edf7",
  background: "#fff",
  cursor: "pointer",
  font: "inherit",
  width: "100%",
  fontSize: 14,
};
const panelStyle = {
  position: "absolute",
  zIndex: 100,
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #e5edf7",
  borderRadius: 14,
  padding: 14,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};
const searchStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5edf7",
  font: "inherit",
  fontSize: 13,
  marginBottom: 12,
  background: "#f7fafd",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 6,
  maxHeight: 220,
  overflowY: "auto",
};
const itemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "8px 4px",
  borderRadius: 10,
  border: "1px solid transparent",
  cursor: "pointer",
  background: "#f7fafd",
  font: "inherit",
};
const selectedItemStyle = {
  border: "1px solid #0b2b4b",
  background: "#eef4fc",
  color: "#0b2b4b",
};
const itemLabelStyle = {
  fontSize: 9,
  textAlign: "center",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100%",
};
