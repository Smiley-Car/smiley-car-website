// ------------------------------------------------------
// Smiley Cars — script.js (FINAL FIXED VERSION)
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

  document.getElementById("toReview").addEventListener("click", e => {
    e.preventDefault();

    const required = ["w_name", "w_phone", "w_from", "w_to"];
    for (const id of required) {
      if (!document.getElementById(id).value.trim()) {
        alert("Please fill all required fields");
        return;
      }
    }

    document.getElementById("r_name").textContent = w_name.value;
    document.getElementById("r_phone").textContent = w_phone.value;
    document.getElementById("r_passengers").textContent = w_passengers.value;
    document.getElementById("r_rentalType").textContent =
      w_rentalType.value === "self_drive" ? "Self Drive" : "With Driver";
    document.getElementById("r_days").textContent = w_days.value;
    document.getElementById("r_pickup").textContent = w_from.value;
    document.getElementById("r_drop").textContent = w_to.value;

    showWizardStep(2);
  });

  document.getElementById("backToDetails").onclick = () => showWizardStep(1);

  document.getElementById("confirmBooking").onclick = e => {
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
      paymentStatus: "pending"
    };

    const list = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    list.unshift(booking);
    localStorage.setItem("smiley_bookings", JSON.stringify(list));

    window.location.href = "payment.html";
  };
}

function showWizardStep(step) {
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
    if (!JSON.parse(localStorage.getItem("smiley_bookings") || "[]").length) {
      alert("No booking found");
      return;
    }
    modal.setAttribute("aria-hidden", "false");
  };

  modalClose.onclick = cancelPaid.onclick = () =>
    modal.setAttribute("aria-hidden", "true");

  confirmPaid.onclick = async () => {

    const payorName = payorNameInput.value.trim();
    const payorEmail = payorEmailInput.value.trim();
    const txnId = txnIdInput.value.trim();

    if (!payorName || !payorEmail || !txnId) {
      alert("Please fill all payment details");
      return;
    }

    const booking = JSON.parse(localStorage.getItem("smiley_bookings"))[0];

    try {
      await emailjs.send(
        "service_y364n5h",
        "template_lvj5bx7",
        {
          booking_id: booking.id,
          name: booking.name,
          phone: booking.phone,
          pickup: booking.pickup,
          drop: booking.drop,
          passengers: booking.passengers,
          rentalType: booking.rentalType,
          days: booking.days,
          payor_name: payorName,
          payor_email: payorEmail,
          transaction_id: txnId
        }
      );

      alert("✅ Payment confirmed & email sent!");
      modal.setAttribute("aria-hidden", "true");
      window.location.href = "index.html";

    } catch (err) {
      console.error(err);
      alert("❌ Email sending failed. Check template variables.");
    }
  };
}
