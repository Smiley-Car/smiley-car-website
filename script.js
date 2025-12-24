// ------------------------------------------------------
// Smiley Cars — script.js
// FINAL CLEAN VERSION (NO EMAIL)
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // Footer year
  document.querySelectorAll("#year, #year2").forEach(el => {
    if (el) el.textContent = new Date().getFullYear();
  });

  if (document.getElementById("wizardForm")) {
    initRentWizard();
  }

  if (document.querySelector(".payment-wrap")) {
    initPaymentPage();
  }
});

/* ================= RENT PAGE ================= */
function initRentWizard() {

  const toReview = document.getElementById("toReview");
  const backBtn = document.getElementById("backToDetails");
  const confirmBtn = document.getElementById("confirmBooking");

  toReview.onclick = e => {
    e.preventDefault();

    const required = ["w_name", "w_phone", "w_from", "w_to"];
    for (const id of required) {
      if (!document.getElementById(id).value.trim()) {
        alert("Please fill all required fields");
        return;
      }
    }

    r_name.textContent = w_name.value;
    r_phone.textContent = w_phone.value;
    r_passengers.textContent = w_passengers.value;
    r_rentalType.textContent =
      w_rentalType.value === "self_drive" ? "Self Drive" : "With Driver";
    r_days.textContent = w_days.value;
    r_pickup.textContent = w_from.value;
    r_drop.textContent = w_to.value;

    showStep(2);
  };

  backBtn.onclick = () => showStep(1);

  confirmBtn.onclick = e => {
    e.preventDefault();

    const booking = {
      id: "B" + Date.now(),
      name: w_name.value,
      phone: w_phone.value,
      passengers: w_passengers.value,
      rentalType: w_rentalType.value,
      days: w_days.value,
      pickup: w_from.value,
      drop: w_to.value,
      paymentStatus: "pending",
      createdAt: new Date().toISOString()
    };

    const list = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    list.unshift(booking);
    localStorage.setItem("smiley_bookings", JSON.stringify(list));

    window.location.href = "payment.html";
  };
}

function showStep(step) {
  document.querySelectorAll(".step").forEach(s =>
    s.classList.toggle("active", +s.dataset.step === step)
  );
  document.querySelectorAll("[data-steppanel]").forEach(p =>
    p.classList.toggle("hidden", +p.dataset.steppanel !== step)
  );
}

/* ================= PAYMENT PAGE ================= */
function initPaymentPage() {

  const modal = document.getElementById("paymentModal");

  paidButtonPayPage.onclick = () => {
    const bookings = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    if (!bookings.length) {
      alert("No booking found.");
      return;
    }
    modal.setAttribute("aria-hidden", "false");
  };

  modalClose.onclick = cancelPaid.onclick = () =>
    modal.setAttribute("aria-hidden", "true");

  confirmPaid.onclick = () => {

    const payorName = payorNameInput.value.trim();
    const txnId = txnIdInput.value.trim();

    if (!payorName || !txnId) {
      alert("Please enter payment details");
      return;
    }

    const bookings = JSON.parse(localStorage.getItem("smiley_bookings"));
    bookings[0].paymentStatus = "paid";
    bookings[0].payorName = payorName;
    bookings[0].transactionId = txnId;
    bookings[0].paymentConfirmedAt = new Date().toISOString();

    localStorage.setItem("smiley_bookings", JSON.stringify(bookings));

    alert("✅ Payment confirmed successfully!");
    modal.setAttribute("aria-hidden", "true");
    window.location.href = "index.html";
  };
}
