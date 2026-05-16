import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { parseTime, formatTime } from "@/lib/booking-utils";

interface Booking {
  id: number;
  service: string;
  price: string;
  date: string;
  time: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  vehicle: string | null;
  location: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

interface AvailRow {
  id: number;
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let m = 360; m <= 1260; m += 30) opts.push(formatTime(m));
  return opts;
})();

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<"bookings" | "availability">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailRow[]>([]);
  const [blockedDates, setBlockedDates] = useState<{ id: number; date: string; reason: string | null }[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editName, setEditName] = useState("");
  const [editService, setEditService] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoginError(error.message); setLoginLoading(false); return; }
    setAuthed(true);
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  // Load data
  const loadBookings = useCallback(async () => {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data);
  }, []);

  const loadAvailability = useCallback(async () => {
    const { data } = await supabase.from("availability").select("*").order("day_of_week");
    if (data) setAvailability(data);
  }, []);

  const loadBlocked = useCallback(async () => {
    const { data } = await supabase.from("blocked_dates").select("*").order("date");
    if (data) setBlockedDates(data);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadBookings();
    loadAvailability();
    loadBlocked();
  }, [authed, loadBookings, loadAvailability, loadBlocked]);

  // Stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      today: bookings.filter(b => b.date === todayStr && b.status !== "cancelled").length,
    };
  }, [bookings]);

  // Actions
  const updateBookingStatus = async (id: number, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    loadBookings();
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Delete this booking permanently?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    loadBookings();
  };

  const openEditModal = (b: Booking) => {
    setEditBooking(b);
    setEditName(b.customer_name);
    setEditService(b.service);
    setEditDate(b.date);
    setEditTime(b.time);
    setEditPhone(b.customer_phone);
    setEditStatus(b.status);
  };

  const saveEdit = async () => {
    if (!editBooking) return;
    await supabase.from("bookings").update({
      customer_name: editName, service: editService,
      date: editDate, time: editTime,
      customer_phone: editPhone, status: editStatus,
    }).eq("id", editBooking.id);
    setEditBooking(null);
    loadBookings();
  };

  const toggleDay = (row: AvailRow) => {
    setAvailability(prev => prev.map(a => a.id === row.id ? { ...a, is_active: !a.is_active } : a));
  };

  const updateAvailField = (id: number, field: string, value: string | number) => {
    setAvailability(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const saveAvailability = async () => {
    for (const row of availability) {
      await supabase.from("availability").update({
        is_active: row.is_active, start_time: row.start_time,
        end_time: row.end_time, slot_duration: row.slot_duration,
      }).eq("id", row.id);
    }
    alert("Schedule saved!");
  };

  const addBlockedDate = async () => {
    if (!blockDate) return;
    await supabase.from("blocked_dates").insert([{ date: blockDate, reason: blockReason || null }]);
    setBlockDate(""); setBlockReason("");
    loadBlocked();
  };

  const removeBlockedDate = async (id: number) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    loadBlocked();
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--color-ink-muted)" }}>Loading...</div>;

  // ===== LOGIN SCREEN =====
  if (!authed) {
    return (
      <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{
          maxWidth: 420, width: "100%", margin: "0 auto",
          background: "linear-gradient(145deg, rgba(30,30,30,0.9), rgba(20,20,20,0.95))",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
          padding: "48px 40px", backdropFilter: "blur(20px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          animation: "fadeUp 0.6s ease-out",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img src="/sp-logo.png" alt="SP Detailing" style={{ height: 60, margin: "0 auto 12px", display: "block" }} />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, fontStyle: "italic" }}>
              SP <span style={{ color: "var(--color-accent)" }}>Admin</span>
            </h1>
            <p style={{ color: "var(--color-ink-muted)", fontSize: 14, marginTop: 4 }}>Sign in to manage your bookings</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={adminLabel}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@spdetailing.com" style={adminInput} autoFocus />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={adminLabel}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" style={adminInput} />
          </div>

          <button type="submit" disabled={loginLoading} style={{
            width: "100%", padding: 16, background: "var(--color-accent)", color: "#fff",
            border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16,
            cursor: loginLoading ? "not-allowed" : "pointer", opacity: loginLoading ? 0.6 : 1,
            transition: "all 0.3s", marginTop: 8,
          }}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>

          {loginError && <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#ff6b6b" }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, fontStyle: "italic" }}>
          <span style={{ color: "var(--color-accent)" }}>SP</span> Dashboard
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadBookings} style={dashBtn("primary")}>Refresh</button>
          <button onClick={handleLogout} style={dashBtn("ghost")}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["bookings","availability"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13,
            cursor: "pointer", border: "none", transition: "all 0.3s",
            background: tab === t ? "var(--color-accent)" : "transparent",
            color: tab === t ? "#fff" : "var(--color-ink-muted)",
          }}>{t === "bookings" ? "Bookings" : "Availability"}</button>
        ))}
      </div>

      {/* BOOKINGS TAB */}
      {tab === "bookings" && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "TOTAL", value: stats.total },
              { label: "PENDING", value: stats.pending },
              { label: "CONFIRMED", value: stats.confirmed },
              { label: "TODAY", value: stats.today },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--color-accent)", fontStyle: "italic" }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "var(--color-ink-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Customer","Service","Date","Time","Phone","Status","Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 40, color: "var(--color-ink-muted)" }}>No bookings yet</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id} style={{ transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={tdStyle} data-label="Customer">{b.customer_name}</td>
                    <td style={tdStyle} data-label="Service">{b.service}</td>
                    <td style={tdStyle} data-label="Date">{b.date}</td>
                    <td style={tdStyle} data-label="Time">{b.time}</td>
                    <td style={tdStyle} data-label="Phone">{b.customer_phone}</td>
                    <td style={tdStyle} data-label="Status">
                      <span style={statusPill(b.status)}>{b.status}</span>
                    </td>
                    <td style={tdStyle} data-label="Actions">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {b.status !== "confirmed" && <button onClick={() => updateBookingStatus(b.id, "confirmed")} style={actionBtn("confirm")}>✓</button>}
                        {b.status !== "completed" && <button onClick={() => updateBookingStatus(b.id, "completed")} style={actionBtn("complete")}>✔</button>}
                        {b.status !== "cancelled" && <button onClick={() => updateBookingStatus(b.id, "cancelled")} style={actionBtn("danger")}>✕</button>}
                        <button onClick={() => openEditModal(b)} style={actionBtn("ghost")}>✎</button>
                        <button onClick={() => deleteBooking(b.id)} style={actionBtn("danger")}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AVAILABILITY TAB */}
      {tab === "availability" && (
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20, fontStyle: "italic" }}>Weekly Schedule</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {availability.map(row => (
              <div key={row.id} style={{
                display: "grid", gridTemplateColumns: "100px 60px 1fr 1fr",
                gap: 12, alignItems: "center", padding: "16px 20px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
              }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{DAY_NAMES[row.day_of_week]}</span>
                <button type="button" onClick={() => toggleDay(row)} style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: row.is_active ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                  position: "relative" as const, transition: "background 0.3s",
                }}>
                  <span style={{
                    position: "absolute" as const, width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", top: 3, left: row.is_active ? 23 : 3, transition: "left 0.3s",
                  }} />
                </button>
                <select value={row.start_time} onChange={e => updateAvailField(row.id, "start_time", e.target.value)} style={selectStyle} disabled={!row.is_active}>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={row.end_time} onChange={e => updateAvailField(row.id, "end_time", e.target.value)} style={selectStyle} disabled={!row.is_active}>
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <button onClick={saveAvailability} style={dashBtn("primary")}>Save Schedule</button>
          </div>

          {/* Blocked dates */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 16, fontStyle: "italic" }}>Blocked Dates</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} style={{ ...adminInput, maxWidth: 200 }} />
              <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Reason (optional)" style={{ ...adminInput, maxWidth: 200 }} />
              <button onClick={addBlockedDate} style={dashBtn("primary")}>Block Date</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {blockedDates.map(bd => (
                <span key={bd.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", background: "rgba(244,67,54,0.1)",
                  border: "1px solid rgba(244,67,54,0.2)", borderRadius: 20,
                  fontSize: 13, color: "#f44336",
                }}>
                  {bd.date} {bd.reason && `— ${bd.reason}`}
                  <button onClick={() => removeBlockedDate(bd.id)} style={{ background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editBooking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }} onClick={() => setEditBooking(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: 32, width: "90%", maxWidth: 480,
          }}>
            <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 24, fontSize: 22, fontStyle: "italic" }}>Edit Booking</h2>
            {[
              { label: "Customer Name", value: editName, set: setEditName, type: "text" },
              { label: "Service", value: editService, set: setEditService, type: "text" },
              { label: "Date", value: editDate, set: setEditDate, type: "date" },
              { label: "Phone", value: editPhone, set: setEditPhone, type: "text" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={adminLabel}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} style={adminInput} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={adminLabel}>Time</label>
              <select value={editTime} onChange={e => setEditTime(e.target.value)} style={adminInput}>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={adminLabel}>Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={adminInput}>
                {["pending","confirmed","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setEditBooking(null)} style={{ ...dashBtn("ghost"), flex: 1, textAlign: "center" }}>Cancel</button>
              <button onClick={saveEdit} style={{ ...dashBtn("primary"), flex: 1, textAlign: "center" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) {
          table thead { display: none; }
          table tbody { display: flex; flex-direction: column; gap: 12px; }
          table tbody tr { display: flex; flex-direction: column; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; gap: 8px; }
          table tbody td { padding: 0; border-bottom: none; display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
          table tbody td::before { content: attr(data-label); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--color-ink-muted); font-weight: 600; min-width: 80px; }
        }
      `}</style>
    </div>
  );
}

/* ===== STYLE HELPERS ===== */
const adminLabel: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "2px",
  textTransform: "uppercase", color: "var(--color-ink-muted)", marginBottom: 8,
};

const adminInput: React.CSSProperties = {
  width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
  color: "var(--color-ink)", fontSize: 15, outline: "none", transition: "border-color 0.3s",
};

const selectStyle: React.CSSProperties = {
  ...adminInput, padding: "10px 12px", fontSize: 13, borderRadius: 8,
};

const thStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
  color: "var(--color-ink-muted)", padding: "14px 16px", textAlign: "left",
  background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px", fontSize: 13, color: "var(--color-ink-muted)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

function dashBtn(variant: "primary" | "ghost"): React.CSSProperties {
  return {
    padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13,
    cursor: "pointer", transition: "all 0.3s", border: "none",
    background: variant === "primary" ? "rgba(200,16,46,0.15)" : "rgba(255,255,255,0.05)",
    color: variant === "primary" ? "var(--color-accent)" : "var(--color-ink-muted)",
    borderStyle: "solid", borderWidth: 1,
    borderColor: variant === "primary" ? "rgba(200,16,46,0.3)" : "rgba(255,255,255,0.1)",
  };
}

function actionBtn(type: "confirm" | "complete" | "danger" | "ghost"): React.CSSProperties {
  const colors = {
    confirm: { bg: "rgba(76,175,80,0.12)", color: "#4caf50", border: "rgba(76,175,80,0.25)" },
    complete: { bg: "rgba(76,175,80,0.12)", color: "#4caf50", border: "rgba(76,175,80,0.25)" },
    danger: { bg: "rgba(244,67,54,0.12)", color: "#f44336", border: "rgba(244,67,54,0.25)" },
    ghost: { bg: "rgba(255,255,255,0.05)", color: "var(--color-ink-muted)", border: "rgba(255,255,255,0.1)" },
  };
  const c = colors[type];
  return {
    padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
    background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    transition: "all 0.2s",
  };
}

function statusPill(status: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: "rgba(255,193,7,0.12)", color: "#ffc107" },
    confirmed: { bg: "rgba(76,175,80,0.12)", color: "#4caf50" },
    completed: { bg: "rgba(33,150,243,0.12)", color: "#2196f3" },
    cancelled: { bg: "rgba(244,67,54,0.12)", color: "#f44336" },
  };
  const c = map[status] || map.pending;
  return {
    display: "inline-block", padding: "4px 12px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    textTransform: "uppercase", background: c.bg, color: c.color,
  };
}
