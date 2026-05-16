import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { parseTime, formatTime } from "@/lib/booking-utils";

/* ===== SERVICES ===== */
const services = [
  { id: "exterior", name: "Exterior Wash", price: "$75", duration: "60 min", desc: "Hand wash, wheels, tires, glass" },
  { id: "interior", name: "Interior Detail", price: "$120", duration: "90 min", desc: "Vacuum, plastics, spot treatment" },
  { id: "full", name: "Full Detail", price: "$200", duration: "120 min", desc: "Complete interior + exterior reset" },
];

/* ===== TYPES ===== */
interface AvailRow {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

/* ===== COMPONENT ===== */
export default function BookingSection() {
  /* -- state -- */
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [availability, setAvailability] = useState<AvailRow[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  /* -- section unlock logic (progressive reveal like 207) -- */
  const sectionServiceDone = !!selectedService;
  const sectionDateTimeDone = !!selectedDate && !!selectedTime;

  /* -- helpers -- */
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayLabels = ["SU","MO","TU","WE","TH","FR","SA"];

  /* -- load availability from Supabase -- */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("availability").select("*").order("day_of_week");
        if (!error && data) setAvailability(data);
      } catch { /* fallback: empty */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("blocked_dates").select("date");
        if (!error && data) setBlockedDates(data.map((d: { date: string }) => d.date));
      } catch { /* fallback */ }
    })();
  }, []);

  /* -- load booked slots for selected date -- */
  const loadBookedSlots = useCallback(async (dateStr: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("time")
        .eq("date", dateStr)
        .neq("status", "cancelled");
      if (!error && data) setBookedSlots(data.map((b: { time: string }) => b.time));
      else setBookedSlots([]);
    } catch {
      setBookedSlots([]);
    }
  }, []);

  /* -- calendar helpers -- */
  const isDayActive = (dayOfWeek: number) => {
    const avail = availability.find(a => a.day_of_week === dayOfWeek);
    return avail ? avail.is_active : false;
  };

  const isDateBlocked = (dateStr: string) => blockedDates.includes(dateStr);

  const generateTimeSlots = (dayOfWeek: number): string[] => {
    const avail = availability.find(a => a.day_of_week === dayOfWeek);
    if (!avail || !avail.is_active) return [];
    const startMin = parseTime(avail.start_time);
    const endMin = parseTime(avail.end_time);
    const duration = avail.slot_duration || 60;
    const slots: string[] = [];
    for (let t = startMin; t < endMin; t += duration) {
      slots.push(formatTime(t));
    }
    return slots;
  };

  const handleSelectDate = async (day: number) => {
    const d = new Date(calYear, calMonth, day);
    setSelectedDate(d);
    setSelectedTime(null);
    await loadBookedSlots(d.toISOString().split("T")[0]);
  };

  const prevMonth = () => {
    setCalMonth(m => { if (m === 0) { setCalYear(y => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    setCalMonth(m => { if (m === 11) { setCalYear(y => y + 1); return 0; } return m + 1; });
  };

  /* -- submit booking to Supabase -- */
  const handleConfirm = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!phone.trim() || phone.length < 7) { setError("Please enter a valid phone number."); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    if (!vehicle.trim()) { setError("Please enter your vehicle info."); return; }
    if (!location.trim()) { setError("Please enter the service location."); return; }
    if (!selectedService || !selectedDate || !selectedTime) return;

    setError("");
    setIsSubmitting(true);

    const { error: insertError } = await supabase.from("bookings").insert([{
      service: selectedService.name,
      price: selectedService.price,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      customer_name: name.trim(),
      customer_email: email.trim() || null,
      customer_phone: phone.trim(),
      vehicle: vehicle.trim(),
      location: location.trim(),
      notes: notes.trim() || null,
      status: "pending",
    }]);

    setIsSubmitting(false);

    if (insertError) {
      console.error("Booking error:", insertError);
      setError("Something went wrong. Please try again.");
      return;
    }

    setIsSuccess(true);
  };

  /* -- render -- */

  // Confirmation screen
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "48px 40px",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--shadow-float)",
          }}
        >
          <div style={{
            width: 64, height: 64, margin: "0 auto 24px",
            borderRadius: "50%",
            background: "rgba(76,175,80,0.15)",
            display: "grid", placeItems: "center",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "2rem", color: "var(--color-ink)" }}>
            You're Booked.
          </h2>
          <p style={{ marginTop: 16, fontSize: "1.0625rem", color: "var(--color-ink-muted)", maxWidth: 420, margin: "16px auto 0" }}>
            Thanks {name.split(" ")[0]}! Your {selectedService?.name} is scheduled for{" "}
            {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedTime}.
            Ahmad will reach out to confirm.
          </p>
        </motion.div>
      </div>
    );
  }

  // Calendar grid
  const today = new Date();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let timeSlots: string[] = [];
  if (selectedDate) {
    timeSlots = generateTimeSlots(selectedDate.getDay());
    // Filter past times if today
    if (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    ) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      timeSlots = timeSlots.filter(t => parseTime(t) > nowMin);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">

      {/* ===== SECTION 1: SERVICE ===== */}
      <div style={{
        marginBottom: 40,
        padding: "32px 28px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{
            display: "grid", placeItems: "center",
            width: 32, height: 32, borderRadius: "50%",
            background: selectedService ? "var(--color-accent)" : "rgba(255,255,255,0.08)",
            color: selectedService ? "#fff" : "var(--color-ink-muted)",
            fontSize: 14, fontWeight: 700,
            fontFamily: "var(--font-sans)",
            transition: "all 0.3s",
          }}>
            {selectedService ? "✓" : "1"}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
            Pick your service
          </span>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {services.map(svc => (
            <button
              key={svc.id}
              type="button"
              onClick={() => setSelectedService(svc)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px",
                background: selectedService?.id === svc.id ? "rgba(200,16,46,0.12)" : "rgba(255,255,255,0.03)",
                border: selectedService?.id === svc.id ? "1px solid rgba(200,16,46,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                color: "var(--color-ink)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{svc.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 2 }}>{svc.desc} · {svc.duration}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-accent)", flexShrink: 0, marginLeft: 16 }}>
                {svc.price}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== SECTION 2: DATE & TIME ===== */}
      <AnimatePresence>
        {sectionServiceDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            style={{
              marginBottom: 40,
              padding: "32px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{
                display: "grid", placeItems: "center",
                width: 32, height: 32, borderRadius: "50%",
                background: sectionDateTimeDone ? "var(--color-accent)" : "rgba(255,255,255,0.08)",
                color: sectionDateTimeDone ? "#fff" : "var(--color-ink-muted)",
                fontSize: 14, fontWeight: 700,
                fontFamily: "var(--font-sans)",
                transition: "all 0.3s",
              }}>
                {sectionDateTimeDone ? "✓" : "2"}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
                Choose date & time
              </span>
            </div>

            <div style={{ display: "grid", gap: 24 }} className="sm:grid-cols-2">
              {/* Calendar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.25rem", margin: 0 }}>
                    {months[calMonth]} {calYear}
                  </h3>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button type="button" onClick={prevMonth} style={calNavBtn}>‹</button>
                    <button type="button" onClick={nextMonth} style={calNavBtn}>›</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
                  {dayLabels.map(d => (
                    <div key={d} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "var(--color-ink-muted)", padding: "4px 0" }}>{d}</div>
                  ))}
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const cellDate = new Date(calYear, calMonth, day);
                    const dayOfWeek = cellDate.getDay();
                    const dateStr = cellDate.toISOString().split("T")[0];
                    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isInactive = !isDayActive(dayOfWeek);
                    const isBlocked = isDateBlocked(dateStr);
                    const disabled = isPast || isInactive || isBlocked;
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === calMonth && selectedDate?.getFullYear() === calYear;
                    const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && handleSelectDate(day)}
                        style={{
                          width: "100%", aspectRatio: "1", display: "grid", placeItems: "center",
                          borderRadius: 8, fontSize: 13, fontWeight: 500,
                          border: isToday && !isSelected ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                          background: isSelected ? "var(--color-accent)" : disabled ? "transparent" : "rgba(255,255,255,0.03)",
                          color: isSelected ? "#fff" : disabled ? "rgba(255,255,255,0.15)" : "var(--color-ink)",
                          cursor: disabled ? "not-allowed" : "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: "var(--color-ink-muted)", marginBottom: 8 }}>
                  Available Times
                </h4>
                {selectedDate ? (
                  <p style={{ fontSize: 14, color: "var(--color-ink)", marginBottom: 16 }}>
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--color-ink-muted)", marginBottom: 16 }}>
                    Select a date to see times
                  </p>
                )}
                {selectedDate && timeSlots.length === 0 && (
                  <p style={{ fontSize: 14, color: "var(--color-ink-muted)" }}>No available slots for this day.</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {timeSlots.map(t => {
                    const booked = bookedSlots.includes(t);
                    const sel = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={booked}
                        onClick={() => !booked && setSelectedTime(t)}
                        style={{
                          padding: "10px 8px", borderRadius: 10,
                          fontSize: 13, fontWeight: 500,
                          background: sel ? "var(--color-accent)" : booked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                          color: sel ? "#fff" : booked ? "rgba(255,255,255,0.2)" : "var(--color-ink)",
                          border: sel ? "1px solid var(--color-accent)" : "1px solid rgba(255,255,255,0.08)",
                          cursor: booked ? "not-allowed" : "pointer",
                          transition: "all 0.15s",
                          textDecoration: booked ? "line-through" : "none",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SECTION 3: YOUR DETAILS ===== */}
      <AnimatePresence>
        {sectionDateTimeDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            style={{
              marginBottom: 40,
              padding: "32px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{
                display: "grid", placeItems: "center",
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                color: "var(--color-ink-muted)",
                fontSize: 14, fontWeight: 700,
                fontFamily: "var(--font-sans)",
              }}>3</span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>
                Your details
              </span>
            </div>

            {/* Summary bar */}
            <div style={{
              display: "flex", flexWrap: "wrap" as const, gap: 16,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              marginBottom: 24,
              fontSize: 13,
            }}>
              <div><span style={{ color: "var(--color-ink-muted)", marginRight: 6 }}>SERVICE</span> <span style={{ fontWeight: 600 }}>{selectedService?.name}</span></div>
              <div><span style={{ color: "var(--color-ink-muted)", marginRight: 6 }}>DATE</span> <span style={{ fontWeight: 600 }}>{selectedDate?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span></div>
              <div><span style={{ color: "var(--color-ink-muted)", marginRight: 6 }}>TIME</span> <span style={{ fontWeight: 600 }}>{selectedTime}</span></div>
              <div><span style={{ color: "var(--color-ink-muted)", marginRight: 6 }}>PRICE</span> <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{selectedService?.price}</span></div>
            </div>

            {/* Form fields */}
            <div style={{ display: "grid", gap: 16 }} className="sm:grid-cols-2">
              <div>
                <label style={labelStyle}>Full Name <span style={{ color: "var(--color-accent)" }}>*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone <span style={{ color: "var(--color-accent)" }}>*</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9\-() ]/g, ""))} placeholder="(207) 555-1234" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email <span style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>(optional)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Vehicle <span style={{ color: "var(--color-accent)" }}>*</span></label>
                <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="2022 Toyota Camry" style={inputStyle} />
              </div>
              <div className="sm:col-span-2">
                <label style={labelStyle}>Service Location <span style={{ color: "var(--color-accent)" }}>*</span></label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City or address where we come to you" style={inputStyle} />
              </div>
              <div className="sm:col-span-2">
                <label style={labelStyle}>Notes <span style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Pet hair, stains, specific areas of concern?" style={{ ...inputStyle, resize: "vertical" as const }} />
              </div>
            </div>

            {error && (
              <p style={{ marginTop: 12, fontSize: 13, color: "#ff6b6b", textAlign: "center" }}>{error}</p>
            )}

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={{
                  padding: "16px 48px",
                  background: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "0.5px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: "all 0.3s",
                  boxShadow: "0 8px 25px rgba(200,16,46,0.3)",
                }}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== SHARED STYLES ===== */
const calNavBtn: React.CSSProperties = {
  width: 32, height: 32, display: "grid", placeItems: "center",
  borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)", color: "var(--color-ink)",
  cursor: "pointer", fontSize: 18, transition: "all 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  letterSpacing: "1.5px", textTransform: "uppercase",
  color: "var(--color-ink-muted)", marginBottom: 6,
  fontFamily: "var(--font-sans)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, color: "var(--color-ink)",
  fontFamily: "var(--font-sans)", fontSize: 15,
  outline: "none", transition: "border-color 0.3s",
};
