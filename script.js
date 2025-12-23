// ------------------------------------------------------
// Smiley Cars — script.js
// FINAL STABLE VERSION
// - Rent page wizard (Review works 100%)
// - Payment modal
// - EmailJS payment email
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // Footer year
  document.querySelectorAll("#year, #year2").forEach(el => {
    if (el) el.textContent = new Date().getFullYear();
  });

  // Rent page wizard
  if (document.getElementById("wizardForm")) {
    initRentWizard();
  }

  // Payment page
  if (document.querySelector(".payment-wrap")) {
    initPaymentPage();
  }
});

/* ======================================================
   RENT PAGE — BOOKING WIZARD
====================================================== */
function initRentWizard() {

  const toReviewBtn = document.getElementById("toReview");
  const backBtn = document.getElementById("backToDetails");
  const confirmBtn = document.getElementById("confirmBooking");

  if (!toReviewBtn || !backBtn || !confirmBtn) return;

  // STEP 1 → STEP 2 (REVIEW)
  toReviewBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const name = document.getElementById("w_name").value.trim();
    const phone = document.getElementById("w_phone").value.trim();
    const from = document.getElementById("w_from").value.trim();
    const to = document.getElementById("w_to").value.trim();

    if (!name || !phone || !from || !to) {
      alert("Please fill all required fields");
      return;
    }

    // Fill review
    document.getElementById("r_name").textContent = name;
    document.getElementById("r_phone").textContent = phone;
    document.getElementById("r_passengers").textContent =
      document.getElementById("w_passengers").value;

    document.getElementById("r_rentalType").textContent =
      document.getElementById("w_rentalType").value === "self_drive"
        ? "Self Drive"
        : "With Driver";

    document.getElementById("r_days").textContent =
      document.getElementById("w_days").value;

    document.getElementById("r_pickup").textContent = from;
    document.getElementById("r_drop").textContent = to;

    showWizardStep(2);
  });

  // STEP 2 → STEP 1
  backBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showWizardStep(1);
  });

  // CONFIRM → SAVE BOOKING → PAYMENT PAGE
  confirmBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const booking = {
      id: "B" + Date.now(),
      name: document.getElementById("w_name").value.trim(),
      phone: document.getElementById("w_phone").value.trim(),
      passengers: document.getElementById("w_passengers").value,
      rentalType: document.getElementById("w_rentalType").value,
      days: Number(document.getElementById("w_days").value) || 1,
      pickup: document.getElementById("w_from").value.trim(),
      drop: document.getElementById("w_to").value.trim(),

      paymentStatus: "pending",
      payorName: "",
      payorEmail: "",
      transactionId: "",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const all = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    all.unshift(booking);
    localStorage.setItem("smiley_bookings", JSON.stringify(all));

    window.location.href = "payment.html";
  });
}

function showWizardStep(step) {
  document.querySelectorAll(".step").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.step) === step);
  });

  document.querySelectorAll("[data-steppanel]").forEach(panel => {
    panel.classList.toggle(
      "hidden",
      Number(panel.dataset.steppanel) !== step
    );
  });
}

/* ======================================================
   PAYMENT PAGE — MODAL + EMAILJS
====================================================== */
function initPaymentPage() {

  const paidBtn = document.getElementById("paidButtonPayPage");
  const modal = document.getElementById("paymentModal");
  const closeBtn = document.getElementById("modalClose");
  const cancelBtn = document.getElementById("cancelPaid");
  const confirmBtn = document.getElementById("confirmPaid");

  if (!paidBtn || !modal) return;

  paidBtn.addEventListener("click", function () {
    const bookings = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    if (!bookings.length) {
      alert("No booking found.");
      return;
    }
    modal.setAttribute("aria-hidden", "false");
  });

  closeBtn?.addEventListener("click", () => {
    modal.setAttribute("aria-hidden", "true");
  });

  cancelBtn?.addEventListener("click", () => {
    modal.setAttribute("aria-hidden", "true");
  });

  confirmBtn?.addEventListener("click", async () => {

    const payorName = document.getElementById("payorName").value.trim();
    const payorEmail = document.getElementById("payorEmail").value.trim();
    const txnId = document.getElementById("txnId").value.trim();

    if (!payorName || !payorEmail || !txnId) {
      alert("Please fill all payment details");
      return;
    }

    try {
      await applyPaymentAndSendEmail({
        payorName,
        payorEmail,
        transactionId: txnId
      });

      alert("✅ Payment confirmed & email sent!");
      modal.setAttribute("aria-hidden", "true");
      window.location.href = "index.html";

    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("❌ Failed to send email. Please check EmailJS setup.");
    }
  });
}

async function applyPaymentAndSendEmail({ payorName, payorEmail, transactionId }) {

  const all = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
  if (!all.length) throw new Error("No booking found");

  const booking = all[0];

  booking.paymentStatus = "paid";
  booking.payorName = payorName;
  booking.payorEmail = payorEmail;
  booking.transactionId = transactionId;
  booking.paymentConfirmedAt = new Date().toISOString();

  localStorage.setItem("smiley_bookings", JSON.stringify(all));

  // EMAILJS SEND
  return emailjs.send(
    "service_y364n5h",   // ✅ your Service ID
    "template_kmvj8ky",  // ✅ your Template ID
    {
      booking_id: booking.id,
      name: booking.name,
      phone: booking.phone,
      from: booking.pickup,
      to: booking.drop,
      passengers: booking.passengers,
      rentalType: booking.rentalType,
      days: booking.days,
      payor_name: payorName,
      payor_email: payorEmail,
      transaction_id: transactionId
    }
  );
}

/* ======================================================
   ADMIN HELPERS
====================================================== */
window.smileyHelpers = {
  getAllBookings: () =>
    JSON.parse(localStorage.getItem("smiley_bookings") || "[]"),
  saveAllBookings: (list) =>
    localStorage.setItem("smiley_bookings", JSON.stringify(list))
};
