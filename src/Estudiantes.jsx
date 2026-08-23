import { useState, useEffect } from "react";

const SUPABASE_URL = "https://smojutxbmngxuuzhbuxa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2p1dHhibW5neHV1emhidXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDA2ODEsImV4cCI6MjA5OTI3NjY4MX0.-A55wzsWR0sHEm3aJoSF3nw821JKddwYAKn4HmZbonM";

const api = async (path, token, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

const S = {
  // Colores base
  bg: "#020d1f",
  card: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.07)",
  borderBlue: "rgba(30,144,255,0.3)",
  blue: "#1e90ff",
  gold: "#ffc800",
  green: "#00e676",
  purple: "#bf5fff",
  red: "#ff5252",
  textPrimary: "rgba(255,255,255,0.85)",
  textSecondary: "rgba(255,255,255,0.45)",
  textMuted: "rgba(255,255,255,0.25)",
};

// ── HELPERS ───────────────────────────────────────────────────────
const estadoBadge = (estado) => {
  const map = {
    aprobada: { bg: "rgba(0,230,118,0.12)", color: "#00e676", label: "Aprobada" },
    pendiente: { bg: "rgba(255,200,0,0.12)", color: "#ffc800", label: "Pendiente" },
    rechazada: { bg: "rgba(255,82,82,0.12)", color: "#ff5252", label: "Rechazada" },
    retirado: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", label: "Retirado" },
  };
  const s = map[estado] || map.pendiente;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

// ── INPUT COMPONENT ───────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder, options, disabled }) {
  const base = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(30,100,255,0.2)",
    borderRadius: 8, color: "white",
    fontSize: 13, fontFamily: "'Inter',sans-serif",
    outline: "none", transition: "border-color 0.2s",
    opacity: disabled ? 0.5 : 1,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: S.blue, fontFamily: "'Orbitron',monospace", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </label>
      {options ? (
        <select style={{ ...base, cursor: "pointer" }} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
          {options.map(o => <option key={o.value} value={o.value} style={{ background: "#0a1628" }}>{o.label}</option>)}
        </select>
      ) : (
        <input
          style={base}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          onFocus={e => e.target.style.borderColor = S.blue}
          onBlur={e => e.target.style.borderColor = "rgba(30,100,255,0.2)"}
        />
      )}
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      z: 1000, zIndex: 1000, padding: 20, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: "100%", maxWidth: width,
        background: "rgba(4,14,36,0.98)",
        border: "1px solid rgba(30,144,255,0.3)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 0 60px rgba(30,100,255,0.2)",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header modal */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(30,100,255,0.06)",
        }}>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "white", letterSpacing: 1 }}>
            {title}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: S.textSecondary, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── FORMULARIO ESTUDIANTE ─────────────────────────────────────────
function FormEstudiante({ initial = {}, grados = [], grupos = [], onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    nombre: initial.nombre || "",
    apellido: initial.apellido || "",
    tipo_documento: initial.tipo_documento || "TI",
    numero_documento: initial.numero_documento || "",
    fecha_nacimiento: initial.fecha_nacimiento || "",
    genero: initial.genero || "",
    telefono: initial.telefono || "",
    email: initial.email || "",
    direccion: initial.direccion || "",
    nombre_acudiente: initial.nombre_acudiente || "",
    telefono_acudiente: initial.telefono_acudiente || "",
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Field label="Nombre" value={form.nombre} onChange={set("nombre")} placeholder="Ej: Juan" />
        <Field label="Apellido" value={form.apellido} onChange={set("apellido")} placeholder="Ej: García" />
        <Field label="Tipo de documento" value={form.tipo_documento} onChange={set("tipo_documento")} options={[
          { value: "TI", label: "Tarjeta de Identidad (TI)" },
          { value: "CC", label: "Cédula de Ciudadanía (CC)" },
          { value: "CE", label: "Cédula de Extranjería (CE)" },
        ]} />
        <Field label="Número de documento" value={form.numero_documento} onChange={set("numero_documento")} placeholder="Ej: 1234567890" />
        <Field label="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={set("fecha_nacimiento")} type="date" />
        <Field label="Género" value={form.genero} onChange={set("genero")} options={[
          { value: "", label: "— Seleccionar —" },
          { value: "masculino", label: "Masculino" },
          { value: "femenino", label: "Femenino" },
          { value: "otro", label: "Otro" },
        ]} />
        <Field label="Teléfono" value={form.telefono} onChange={set("telefono")} placeholder="Ej: 3001234567" />
        <Field label="Correo electrónico" value={form.email} onChange={set("email")} type="email" placeholder="Ej: juan@correo.com" />
      </div>
      <Field label="Dirección" value={form.direccion} onChange={set("direccion")} placeholder="Ej: Calle 5 # 3-20, Ponedera" />

      <div style={{ marginTop: 4, marginBottom: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: S.gold, letterSpacing: 2, marginBottom: 14 }}>◈ ACUDIENTE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Nombre del acudiente" value={form.nombre_acudiente} onChange={set("nombre_acudiente")} placeholder="Nombre completo" />
          <Field label="Teléfono del acudiente" value={form.telefono_acudiente} onChange={set("telefono_acudiente")} placeholder="Ej: 3007654321" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onCancel} style={{
          padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, color: S.textSecondary, cursor: "pointer", fontSize: 13,
        }}>Cancelar</button>
        <button onClick={() => onSave(form)} disabled={loading} style={{
          padding: "10px 24px",
          background: "linear-gradient(90deg,#e6a800,#ffc800)",
          border: "none", borderRadius: 8,
          color: "#0a0e1a", fontWeight: 800, fontSize: 13,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontFamily: "'Orbitron',monospace", letterSpacing: 1,
        }}>
          {loading ? "GUARDANDO..." : "GUARDAR"}
        </button>
      </div>
    </div>
  );
}

// ── FICHA ESTUDIANTE ──────────────────────────────────────────────
function FichaEstudiante({ estudiante, matricula, onClose }) {
  const initials = `${estudiante.nombre?.[0] || ""}${estudiante.apellido?.[0] || ""}`.toUpperCase();
  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: S.textMuted, letterSpacing: 1, minWidth: 120, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, color: S.textPrimary }}>{value || "—"}</span>
    </div>
  );
  return (
    <div>
      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg,#0050c8,#1e90ff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 900, color: "white",
          boxShadow: "0 0 20px rgba(30,144,255,0.4)",
        }}>{initials}</div>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "white" }}>
            {estudiante.nombre} {estudiante.apellido}
          </div>
          <div style={{ fontSize: 12, color: S.textMuted, marginTop: 3 }}>
            {estudiante.tipo_documento}: {estudiante.numero_documento}
          </div>
          <div style={{ marginTop: 6 }}>
            {estadoBadge(matricula?.estado || "pendiente")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: S.blue, letterSpacing: 2, marginBottom: 12 }}>◈ DATOS PERSONALES</div>
          <Row label="Nacimiento" value={estudiante.fecha_nacimiento ? new Date(estudiante.fecha_nacimiento).toLocaleDateString("es-CO") : null} />
          <Row label="Género" value={estudiante.genero} />
          <Row label="Teléfono" value={estudiante.telefono} />
          <Row label="Correo" value={estudiante.email} />
          <Row label="Dirección" value={estudiante.direccion} />
        </div>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: S.gold, letterSpacing: 2, marginBottom: 12 }}>◈ ACUDIENTE</div>
          <Row label="Nombre" value={estudiante.nombre_acudiente} />
          <Row label="Teléfono" value={estudiante.telefono_acudiente} />
          {matricula && (
            <>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: S.green, letterSpacing: 2, margin: "16px 0 12px" }}>◈ MATRÍCULA</div>
              <Row label="Estado" value={matricula.estado} />
              <Row label="Año" value={matricula.año} />
              <Row label="Fecha" value={matricula.fecha_matricula ? new Date(matricula.fecha_matricula).toLocaleDateString("es-CO") : null} />
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: "right" }}>
        <button onClick={onClose} style={{
          padding: "10px 24px", background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
          color: S.textSecondary, cursor: "pointer", fontSize: 13,
        }}>Cerrar</button>
      </div>
    </div>
  );
}

// ── MÓDULO PRINCIPAL ──────────────────────────────────────────────
export default function Estudiantes({ token }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modal, setModal] = useState(null); // null | "nuevo" | "editar" | "ficha" | "confirmar"
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [est, mat, grs, grps] = await Promise.all([
        api("/estudiantes?select=*&order=apellido", token),
        api("/matriculas?select=*,grupos(nombre,grados(nombre,nivel))&order=created_at.desc", token),
        api("/grados?select=*&order=nombre", token),
        api("/grupos?select=*,grados(nombre,nivel)&año=eq.2026&order=nombre", token),
      ]);
      setEstudiantes(est || []);
      setMatriculas(mat || []);
      setGrados(grs || []);
      setGrupos(grps || []);
    } catch (e) { setError("Error cargando datos."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  // Filtros
  const filtrados = estudiantes.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.nombre?.toLowerCase().includes(q) ||
      e.apellido?.toLowerCase().includes(q) ||
      e.numero_documento?.toLowerCase().includes(q);
    const mat = matriculas.find(m => m.estudiante_id === e.id);
    const matchEstado = !filtroEstado || mat?.estado === filtroEstado;
    const matchGrado = !filtroGrado || mat?.grupos?.grados?.nombre === filtroGrado;
    return matchSearch && matchEstado && matchGrado;
  });

  const getMatricula = (id) => matriculas.find(m => m.estudiante_id === id);

  const handleSave = async (form) => {
    if (!form.nombre || !form.apellido || !form.numero_documento) {
      setError("Nombre, apellido y documento son obligatorios."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal === "nuevo") {
        await api("/estudiantes", token, { method: "POST", body: JSON.stringify({ ...form, activo: true }) });
        setSuccess("Estudiante registrado exitosamente.");
      } else {
        await api(`/estudiantes?id=eq.${selected.id}`, token, { method: "PATCH", body: JSON.stringify(form) });
        setSuccess("Estudiante actualizado exitosamente.");
      }
      setModal(null); setSelected(null);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Error guardando. Verifica que el documento no esté duplicado.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api(`/estudiantes?id=eq.${selected.id}`, token, { method: "PATCH", body: JSON.stringify({ activo: false }) });
      setSuccess("Estudiante desactivado correctamente.");
      setModal(null); setSelected(null);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Error al desactivar estudiante."); }
    finally { setSaving(false); }
  };

  const gradosUnicos = [...new Set(matriculas.map(m => m.grupos?.grados?.nombre).filter(Boolean))].sort();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');
        .est-table { width: 100%; border-collapse: collapse; }
        .est-table th {
          text-align: left; padding: 12px 16px;
          font-family: 'Orbitron',monospace; font-size: 10px;
          letter-spacing: 2px; color: rgba(30,144,255,0.7);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(30,100,255,0.05);
        }
        .est-table td {
          padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px; color: rgba(255,255,255,0.75);
          vertical-align: middle;
        }
        .est-row { transition: background 0.15s; cursor: pointer; }
        .est-row:hover td { background: rgba(30,144,255,0.05); }
        .action-btn {
          background: transparent; border: 1px solid transparent;
          border-radius: 7px; padding: 6px 10px;
          cursor: pointer; font-size: 14px; transition: all 0.15s;
        }
        .action-btn:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
        .search-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,100,255,0.2);
          border-radius: 9px; padding: 10px 16px;
          color: white; font-size: 13px; font-family: 'Inter',sans-serif;
          outline: none; transition: border-color 0.2s;
          width: 260px;
        }
        .search-input:focus { border-color: rgba(30,144,255,0.6); }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .filter-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,100,255,0.2);
          border-radius: 9px; padding: 10px 14px;
          color: rgba(255,255,255,0.7); font-size: 13px;
          font-family: 'Inter',sans-serif; outline: none; cursor: pointer;
        }
        .filter-select option { background: #0a1628; }
        .btn-nuevo {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(90deg,#e6a800,#ffc800);
          border: none; border-radius: 9px;
          color: #0a0e1a; font-weight: 900; font-size: 13px;
          font-family: 'Orbitron',monospace; letter-spacing: 1px;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(255,200,0,0.3);
        }
        .btn-nuevo:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,200,0,0.4); }
      `}</style>

      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: S.blue, letterSpacing: 2, marginBottom: 4 }}>◈ GESTIÓN DE ESTUDIANTES</div>
            <div style={{ fontSize: 13, color: S.textSecondary }}>{filtrados.length} estudiante{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</div>
          </div>
          <button className="btn-nuevo" onClick={() => { setSelected(null); setModal("nuevo"); }}>
            ➕ Nuevo Estudiante
          </button>
        </div>

        {/* Alertas */}
        {error && (
          <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 8, padding: "12px 16px", color: "#ff7070", fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            ⚠️ {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#ff7070", cursor: "pointer" }}>×</button>
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.3)", borderRadius: 8, padding: "12px 16px", color: "#00e676", fontSize: 13, marginBottom: 16 }}>
            ✓ {success}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input className="search-input" placeholder="🔍 Buscar por nombre o documento..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filtroGrado} onChange={e => setFiltroGrado(e.target.value)}>
            <option value="">Todos los grados</option>
            {gradosUnicos.map(g => <option key={g} value={g}>Grado {g}</option>)}
          </select>
          <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="aprobada">Aprobada</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazada">Rechazada</option>
            <option value="retirado">Retirado</option>
          </select>
          {(search || filtroGrado || filtroEstado) && (
            <button onClick={() => { setSearch(""); setFiltroGrado(""); setFiltroEstado(""); }}
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: S.textSecondary, cursor: "pointer", fontSize: 12 }}>
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Tabla */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: S.textMuted, fontFamily: "'Orbitron',monospace", fontSize: 12, letterSpacing: 2 }}>
              CARGANDO ESTUDIANTES...
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>👨‍🎓</div>
              <div style={{ color: S.textMuted, fontFamily: "'Orbitron',monospace", fontSize: 12, letterSpacing: 2 }}>
                {search || filtroGrado || filtroEstado ? "SIN RESULTADOS" : "SIN ESTUDIANTES REGISTRADOS"}
              </div>
              {!search && !filtroGrado && !filtroEstado && (
                <button className="btn-nuevo" style={{ margin: "16px auto 0", display: "inline-flex" }} onClick={() => setModal("nuevo")}>
                  ➕ Registrar primer estudiante
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="est-table">
                <thead>
                  <tr>
                    <th>ESTUDIANTE</th>
                    <th>DOCUMENTO</th>
                    <th>GRADO / GRUPO</th>
                    <th>ESTADO</th>
                    <th>ACUDIENTE</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(e => {
                    const mat = getMatricula(e.id);
                    const initials = `${e.nombre?.[0] || ""}${e.apellido?.[0] || ""}`.toUpperCase();
                    return (
                      <tr key={e.id} className="est-row" onClick={() => { setSelected(e); setModal("ficha"); }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: "linear-gradient(135deg,#0050c8,#1e90ff)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0,
                            }}>{initials}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{e.nombre} {e.apellido}</div>
                              <div style={{ fontSize: 11, color: S.textMuted }}>{e.email || "Sin correo"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 2 }}>{e.tipo_documento}</div>
                          <div style={{ fontWeight: 600 }}>{e.numero_documento}</div>
                        </td>
                        <td>
                          {mat?.grupos ? (
                            <div>
                              <div style={{ fontWeight: 600, color: S.blue }}>
                                Grado {mat.grupos.grados?.nombre} — {mat.grupos.nombre}
                              </div>
                              <div style={{ fontSize: 11, color: S.textMuted, textTransform: "capitalize" }}>
                                {mat.grupos.grados?.nivel}
                              </div>
                            </div>
                          ) : <span style={{ color: S.textMuted, fontSize: 12 }}>Sin matrícula</span>}
                        </td>
                        <td>{estadoBadge(mat?.estado || "pendiente")}</td>
                        <td>
                          <div style={{ fontSize: 13 }}>{e.nombre_acudiente || "—"}</div>
                          <div style={{ fontSize: 11, color: S.textMuted }}>{e.telefono_acudiente || ""}</div>
                        </td>
                        <td onClick={ev => ev.stopPropagation()}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="action-btn" title="Ver ficha" onClick={() => { setSelected(e); setModal("ficha"); }}>👁️</button>
                            <button className="action-btn" title="Editar" onClick={() => { setSelected(e); setModal("editar"); }}>✏️</button>
                            <button className="action-btn" title="Desactivar" onClick={() => { setSelected(e); setModal("confirmar"); }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación / total */}
        {filtrados.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: S.textMuted, textAlign: "right" }}>
            Mostrando {filtrados.length} de {estudiantes.length} estudiantes
          </div>
        )}
      </div>

      {/* MODALES */}
      {modal === "nuevo" && (
        <Modal title="◈ REGISTRAR NUEVO ESTUDIANTE" onClose={() => setModal(null)} width={640}>
          {error && <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ff7070", fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
          <FormEstudiante grados={grados} grupos={grupos} onSave={handleSave} onCancel={() => { setModal(null); setError(""); }} loading={saving} />
        </Modal>
      )}

      {modal === "editar" && selected && (
        <Modal title="✏️ EDITAR ESTUDIANTE" onClose={() => { setModal(null); setError(""); }} width={640}>
          {error && <div style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ff7070", fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
          <FormEstudiante initial={selected} grados={grados} grupos={grupos} onSave={handleSave} onCancel={() => { setModal(null); setError(""); }} loading={saving} />
        </Modal>
      )}

      {modal === "ficha" && selected && (
        <Modal title="◈ FICHA DEL ESTUDIANTE" onClose={() => setModal(null)} width={620}>
          <FichaEstudiante estudiante={selected} matricula={getMatricula(selected.id)} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal === "confirmar" && selected && (
        <Modal title="⚠️ CONFIRMAR DESACTIVACIÓN" onClose={() => setModal(null)} width={420}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 8 }}>
              ¿Desactivar a <strong style={{ color: "white" }}>{selected.nombre} {selected.apellido}</strong>?
            </div>
            <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 24 }}>
              El estudiante no se eliminará, solo se marcará como inactivo.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setModal(null)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: S.textSecondary, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
              <button onClick={handleDelete} disabled={saving} style={{ padding: "10px 20px", background: "#ff5252", border: "none", borderRadius: 8, color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Desactivando..." : "Sí, desactivar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
