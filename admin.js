// -------------------------------------------------------
// Smiley Car Admin Dashboard
// FINAL UPDATED admin.js with:
// - Auto refresh
// - New booking highlight
// - Status badges
// - Home navigation
// -------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn").addEventListener("click", onLogin);
  document.getElementById("exportCsv").addEventListener("click", exportCSV);
  document.getElementById("clearAll").addEventListener("click", clearAllBookings);
});

let lastRenderedCount = 0; // detect new bookings

// -------------------------
// ADMIN LOGIN
// -------------------------
function onLogin() {
  const pin = document.getElementById("adminPin").value;
  const correct = localStorage.getItem("smiley_admin_pin") || "1234";

  if (pin === correct) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    renderBookings();

    // Auto-refresh every 2 seconds
    setInterval(() => renderBookings(true), 2000);
  } else {
    alert("Incorrect PIN");
  }
}

// -------------------------
// STORAGE HELPERS
// -------------------------
function getAllBookings() {
  return JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
}

function saveAllBookings(list) {
  localStorage.setItem("smiley_bookings", JSON.stringify(list));
}

// -------------------------
// RENDER BOOKINGS
// -------------------------
function renderBookings(auto = false) {
  const list = getAllBookings();
  const container = document.getElementById("bookingsList");

  if (!list.length) {
    container.innerHTML = `<p>No bookings yet.</p>`;
    return;
  }

  const isNew = auto && list.length > lastRenderedCount;
  lastRenderedCount = list.length;

  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>PAX</th>
          <th>Days</th>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          <th>KM</th>
          <th>Payment</th>
          <th>Payor</th>
          <th>Txn ID</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  list.forEach((b, index) => {
    const highlight = isNew && index === 0 ? "row-highlight" : "";

    html += `
      <tr class="${highlight}">
        <td>${b.id}</td>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.passengers}</td>
        <td>${b.days}</td>
        <td>${b.rentalType === "self_drive" ? "Self Drive" : "With Driver"}</td>

        <td>${b.pickup}</td>
        <td>${b.drop}</td>
        <td>${b.distance || "-"}</td>

        <td>
          <span class="badge ${b.paymentStatus === "paid" ? "badge-paid" : "badge-pending"}">
            ${b.paymentStatus === "paid" ? "Paid" : "Pending"}
          </span>
        </td>

        <td>${b.payorName || "-"}</td>
        <td>${b.transactionId || "-"}</td>

        <td>
          <select onchange="updateStatus('${b.id}', this.value)">
            <option value="pending"   ${b.status==="pending"?"selected":""}>Pending</option>
            <option value="confirmed" ${b.status==="confirmed"?"selected":""}>Confirmed</option>
            <option value="completed" ${b.status==="completed"?"selected":""}>Completed</option>
            <option value="cancelled" ${b.status==="cancelled"?"selected":""}>Cancelled</option>
          </select>
        </td>

        <td class="row-actions">
          <button class="btn btn-primary" onclick="callCustomer('${b.phone}')">Call</button>
          <button class="btn btn-warning" onclick="messageCustomer('${b.phone}')">WhatsApp</button>
          <button class="btn btn-danger" onclick="deleteBooking('${b.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// -------------------------
// UPDATE STATUS
// -------------------------
function updateStatus(id, status) {
  const list = getAllBookings();
  const idx = list.findIndex(b => b.id === id);
  if (idx === -1) return;

  list[idx].status = status;
  saveAllBookings(list);
  renderBookings();
}

// -------------------------
// CALL / WHATSAPP / DELETE
// -------------------------
function callCustomer(phone) {
  window.location.href = `tel:${phone}`;
}

function messageCustomer(phone) {
  const msg = encodeURIComponent("Hello from Smiley Cars regarding your booking.");
  window.open(`https://wa.me/${phone.replace(/\D/g,"")}?text=${msg}`, "_blank");
}

function deleteBooking(id) {
  if (!confirm("Delete this booking permanently?")) return;
  let list = getAllBookings();
  list = list.filter(b => b.id !== id);
  saveAllBookings(list);
  renderBookings();
}

// -------------------------
// EXPORT CSV
// -------------------------
function exportCSV() {
  const list = getAllBookings();
  if (!list.length) return alert("No bookings to export.");

  const rows = [
    ["id","name","phone","passengers","days","type","pickup","drop","distance","paymentStatus","payorName","transactionId","status"]
  ];

  list.forEach(b => {
    rows.push([
      b.id,b.name,b.phone,b.passengers,b.days,b.rentalType,b.pickup,b.drop,
      b.distance,b.paymentStatus,b.payorName,b.transactionId,b.status
    ]);
  });

  const csv = rows.map(r => r.map(c=>`"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `smiley_bookings_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------
// CLEAR ALL
// -------------------------
function clearAllBookings() {
  if (!confirm("Clear ALL bookings?")) return;
  localStorage.removeItem("smiley_bookings");
  renderBookings();
}

// -------------------------
// HOME NAVIGATION
// -------------------------
function goHome() {
  window.location.href = "index.html";
}
