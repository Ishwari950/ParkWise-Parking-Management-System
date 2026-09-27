const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const TOTAL_SLOTS = 10;
const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => `A-${String(i + 1).padStart(2, "0")}`);
const parkingRecords = [];

function commitId() {
  const sha = process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || "local";
  return String(sha).slice(0, 7);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function availableSlots() {
  const occupied = new Set(parkingRecords.filter((r) => r.status === "Parked").map((r) => r.slot));
  return slots.filter((slot) => !occupied.has(slot));
}

function pageHtml() {
  const available = availableSlots();
  const parked = parkingRecords.filter((r) => r.status === "Parked");
  const rows = parkingRecords.length
    ? parkingRecords.map((r) => `
      <tr>
        <td>${escapeHtml(r.vehicleNumber)}</td>
        <td>${escapeHtml(r.vehicleType)}</td>
        <td>${escapeHtml(r.ownerName)}</td>
        <td>${escapeHtml(r.slot)}</td>
        <td>${escapeHtml(r.entryTime)}</td>
        <td><span class="badge ${r.status === "Parked" ? "green" : "gray"}">${escapeHtml(r.status)}</span></td>
        <td>
          ${r.status === "Parked" ? `
            <form method="POST" action="/release" class="inline">
              <input type="hidden" name="vehicleNumber" value="${escapeHtml(r.vehicleNumber)}">
              <button class="danger" type="submit">Release</button>
            </form>` : "-"}
        </td>
      </tr>
    `).join("")
    : "<tr><td colspan=\"7\" class=\"empty\">No parking records yet.</td></tr>";

  const slotCards = slots.map((slot) => {
    const occupied = parked.find((r) => r.slot === slot);
    return `<div class="slot ${occupied ? "occupied" : "free"}">
      <strong>${slot}</strong>
      <span>${occupied ? "Occupied" : "Available"}</span>
    </div>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ParkWise | Parking Management System</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;color:#172033}
header{background:linear-gradient(135deg,#193b8f,#2563eb);color:white;padding:28px 20px}
.container{max-width:1100px;margin:auto;padding:22px}
header h1{margin:0 0 6px;font-size:32px}.subtitle{opacity:.9}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0}
.card{background:white;border-radius:14px;padding:20px;box-shadow:0 4px 16px #00000010}.number{font-size:30px;font-weight:700;margin-top:6px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
h2{margin-top:0}.form{display:grid;gap:12px}.form input,.form select{padding:12px;border:1px solid #ccd4e0;border-radius:8px;font-size:15px}
button{border:0;border-radius:8px;padding:11px 16px;background:#2563eb;color:white;font-weight:700;cursor:pointer}
button:hover{opacity:.9}.danger{background:#dc2626;padding:8px 12px}.inline{display:inline}
.notice{padding:12px;background:#e9f7ef;border-left:4px solid #16a34a;border-radius:6px;margin-bottom:16px}
.error{padding:12px;background:#fff1f2;border-left:4px solid #dc2626;border-radius:6px;margin-bottom:16px}
.slots{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.slot{padding:14px;border-radius:10px;text-align:center;border:1px solid}
.slot.free{background:#ecfdf5;border-color:#86efac}.slot.occupied{background:#fef2f2;border-color:#fca5a5}
.slot span{display:block;font-size:12px;margin-top:5px}.green{background:#dcfce7;color:#166534}.gray{background:#e5e7eb;color:#374151}
.badge{display:inline-block;padding:5px 8px;border-radius:20px;font-size:12px;font-weight:700}
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:white}th,td{padding:12px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:14px}th{background:#f8fafc}
.empty{text-align:center;color:#6b7280;padding:25px}footer{text-align:center;color:#64748b;padding:30px 10px}
@media(max-width:800px){.cards,.grid{grid-template-columns:1fr}.slots{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<header><div class="container"><h1>🚗 ParkWise</h1><div class="subtitle">Smart Parking Management System</div></div></header>
<main class="container">
${available.length < TOTAL_SLOTS ? `<div class="notice">Parking system is active. ${parked.length} vehicle(s) currently parked.</div>` : ""}
<section class="cards">
<div class="card"><div>Total Slots</div><div class="number">${TOTAL_SLOTS}</div></div>
<div class="card"><div>Available Slots</div><div class="number">${available.length}</div></div>
<div class="card"><div>Occupied Slots</div><div class="number">${parked.length}</div></div>
</section>
<div class="grid">
<section class="card">
<h2>Park a Vehicle</h2>
<form method="POST" action="/park" class="form">
<label>Vehicle Number<input name="vehicleNumber" placeholder="MH12AB1234" required maxlength="15"></label>
<label>Vehicle Type<select name="vehicleType" required><option value="">Select type</option><option>Car</option><option>Bike</option><option>SUV</option></select></label>
<label>Owner Name<input name="ownerName" placeholder="Owner name" required maxlength="50"></label>
<label>Parking Slot<select name="slot" required ${available.length === 0 ? "disabled" : ""}>
<option value="">Select available slot</option>${available.map((s) => `<option>${s}</option>`).join("")}
</select></label>
<button type="submit" ${available.length === 0 ? "disabled" : ""}>Park Vehicle</button>
</form>
</section>
<section class="card">
<h2>Parking Slots</h2>
<div class="slots">${slotCards}</div>
</section>
</div>
<section class="card" style="margin-top:20px">
<h2>Parking Records</h2>
<div class="table-wrap"><table>
<thead><tr><th>Vehicle</th><th>Type</th><th>Owner</th><th>Slot</th><th>Entry Time</th><th>Status</th><th>Action</th></tr></thead>
<tbody>${rows}</tbody>
</table></div>
</section>
</main>
<footer>ParkWise • Running commit: <strong>${escapeHtml(commitId())}</strong></footer>
</body></html>`;
}

app.get("/", (req, res) => res.send(pageHtml()));

app.post("/park", (req, res) => {
  const vehicleNumber = String(req.body.vehicleNumber || "").trim().toUpperCase();
  const vehicleType = String(req.body.vehicleType || "").trim();
  const ownerName = String(req.body.ownerName || "").trim();
  const slot = String(req.body.slot || "").trim();

  if (!vehicleNumber || !vehicleType || !ownerName || !slot) {
    return res.status(400).send("All parking fields are required.");
  }
  if (!slots.includes(slot)) {
    return res.status(400).send("Invalid parking slot.");
  }
  if (parkingRecords.some((r) => r.vehicleNumber === vehicleNumber && r.status === "Parked")) {
    return res.status(400).send("This vehicle is already parked.");
  }
  if (!availableSlots().includes(slot)) {
    return res.status(400).send("Selected parking slot is already occupied.");
  }

  parkingRecords.push({
    id: parkingRecords.length + 1,
    vehicleNumber,
    vehicleType,
    ownerName,
    slot,
    entryTime: new Date().toLocaleString("en-IN"),
    status: "Parked"
  });

  return res.redirect("/");
});

app.post("/release", (req, res) => {
  const vehicleNumber = String(req.body.vehicleNumber || "").trim().toUpperCase();
  const record = parkingRecords.find((r) => r.vehicleNumber === vehicleNumber && r.status === "Parked");

  if (!record) {
    return res.status(404).send("Parked vehicle not found.");
  }

  record.status = "Released";
  record.exitTime = new Date().toLocaleString("en-IN");
  return res.redirect("/");
});

app.get("/api/parking", (req, res) => {
  res.json({
    totalSlots: TOTAL_SLOTS,
    availableSlots: availableSlots(),
    records: parkingRecords
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", commit: commitId() });
});

module.exports = { app, parkingRecords, slots, availableSlots };
