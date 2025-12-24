// ------------------------------------------------------
// Smiley Cars — script.js (EMAILJS FIXED & VERIFIED)
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // ✅ INITIALIZE EMAILJS (THIS WAS MISSING)
  if (window.emailjs) {
    emailjs.init("9vnhU8ctG-s65ELNx6Bd5"); // ✅ YOUR PUBLIC KEY
    console.log("✅ EmailJS initialized");
  } else {
    console.error("❌ EmailJS SDK not loaded");
  }

  // Footer year
  document.querySelectorAll("#year, #year2").forEach(el => {
    if (el) el.textContent = new Date().getFullYear();
  });

  if (document.getElementById("wizardForm")) initRentWizard();
  if (document.querySelector(".payment-wrap")) initPaymentPage();
});

/* ======================================================
   RENT PAGE
====================================================== */
function initRentWizard() {

  toReview.onclick = e => {
    e.preventDefault();

    if (!w_name.value || !w_phone.value || !w_from.value || !w_to.value) {
      alert("Please fill all fields");
      return;
    }

    r_name.textContent = w_name.value;
    r_phone.textContent = w_phone.value;
    r_passengers.textContent = w_passengers.value;
    r_rentalType.textContent =
      w_rentalType.value === "self_drive" ? "Self Drive" : "With Driver";
    r_days.textContent = w_days.value;
    r_pickup.textContent = w_from.value;
    r_drop.textContent = w_to.value;

    showWizardStep(2);
  };

  backToDetails.onclick = () => showWizardStep(1);

  confirmBooking.onclick = () => {
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

    const all = JSON.parse(localStorage.getItem("smiley_bookings") || "[]");
    all.unshift(booking);
    localStorage.setItem("smiley_bookings", JSON.stringify(all));

    location.href = "payment.html";
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

/* ======================================================
   PAYMENT PAGE + EMAILJS
====================================================== */
function initPaymentPage() {

  paidButtonPayPage.onclick = () => {
    paymentModal.setAttribute("aria-hidden", "false");
  };

  modalClose.onclick = cancelPaid.onclick = () => {
    paymentModal.setAttribute("aria-hidden", "true");
  };

  confirmPaid.onclick = async () => {

    if (!payorName.value || !payorEmail.value || !txnId.value) {
      alert("Fill all payment fields");
      return;
    }

    const booking = JSON.parse(localStorage.getItem("smiley_bookings"))[0];

    try {
      await emailjs.send(
        "service_y364n5h",      // ✅ SERVICE ID
        "template_lvj5bx7",     // ✅ TEMPLATE ID
        {
          title: "New Payment Received",
          name: booking.name,
          email: payorEmail.value,
          message: `
Booking ID: ${booking.id}
Phone: ${booking.phone}
From: ${booking.pickup}
To: ${booking.drop}
Passengers: ${booking.passengers}
Days: ${booking.days}
Payor: ${payorName.value}
Transaction ID: ${txnId.value}
          `
        }
      );

      alert("✅ Payment confirmed & email sent");
      paymentModal.setAttribute("aria-hidden", "true");
      location.href = "index.html";

    } catch (err) {
      console.error("❌ EmailJS Error:", err);
      alert("❌ Email sending failed. Check template variables.");
    }
  };
}
