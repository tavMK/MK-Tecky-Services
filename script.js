const UPI_ID = "vmknetworks@okicici"; // Update to your live UPI ID
const PAYEE_NAME = "VMK Networks";

const services = [
  // Mobile
  { id: "mob-bat", cat: "mobile", name: "Mobile Battery Change", desc: "Lithium-ion battery replacement for swollen, fast-draining, or shut-down phones.", price: 1199 },
  { id: "mob-disp", cat: "mobile", name: "Mobile Display / Screen Change", desc: "OLED/LCD display assembly replacement for cracked glass, lines, or touch failure.", price: 2499 },
  { id: "mob-port", cat: "mobile", name: "Mobile Charging Port Change", desc: "USB-C / Lightning charging daughterboard or flex port repair for slow/loose charging.", price: 799 },
  { id: "mob-board", cat: "mobile", name: "Mobile Board / IC Level Repair", desc: "Logic board diagnostics, power/charging IC, audio codec, or short-circuit repair.", price: 1999 },
  { id: "mob-spk", cat: "mobile", name: "Mobile Speaker / Earpiece Change", desc: "Loudspeaker or earpiece module replacement for distorted, low, or no sound.", price: 699 },
  { id: "mob-cam", cat: "mobile", name: "Mobile Camera Module Change", desc: "Rear or front camera replacement for blurry focus, black screen, or shaking lens.", price: 1299 },
  { id: "mob-other", cat: "mobile", name: "Other Mobile Component", desc: "Power/volume flex, SIM tray, vibration motor, back glass, or water-damage cleanup.", price: 899 },

  // Laptop
  { id: "lap-bat", cat: "laptop", name: "Laptop Battery Change", desc: "Internal or external laptop battery replacement with health & charging calibration.", price: 2299 },
  { id: "lap-ram", cat: "laptop", name: "Laptop RAM Upgrade / Replacement", desc: "DDR4/DDR5 RAM installation or faulty memory stick replacement.", price: 1699 },
  { id: "lap-ssd", cat: "laptop", name: "Laptop SSD Upgrade / Change", desc: "NVMe M.2 or SATA SSD installation with OS/data setup.", price: 2499 },
  { id: "lap-hdd", cat: "laptop", name: "Laptop HDD Change / Recovery Check", desc: "2.5-inch hard drive replacement or secondary storage mounting.", price: 1899 },
  { id: "lap-other", cat: "laptop", name: "Other Laptop Component", desc: "Display panel, keyboard, DC jack, cooling fan, thermal paste, or hinge repair.", price: 1499 },

  // PC / Desktop
  { id: "pc-psu", cat: "pc", name: "PC Power Supply (SMPS) Change", desc: "Certified power supply unit replacement for no-power or random shutdown PCs.", price: 1799 },
  { id: "pc-mobo", cat: "pc", name: "PC Motherboard Service / Change", desc: "Desktop motherboard diagnostics, BIOS recovery, or board replacement.", price: 2999 },
  { id: "pc-mem", cat: "pc", name: "PC RAM & SSD / HDD Service", desc: "Desktop memory, NVMe/SSD, or HDD installation, cloning, and stability check.", price: 1999 },
  { id: "pc-other", cat: "pc", name: "Other PC Component (GPU / Cooler / Case)", desc: "Graphics card seating/service, CPU air/liquid cooler, cabinet fans, or cable cleanup.", price: 1299 }
];

let billingMode = "prepaid";
let currentCategory = "all";

function formatINR(num) {
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  const filtered = currentCategory === "all"
    ? services
    : services.filter((s) => s.cat === currentCategory);

  grid.innerHTML = filtered.map((s) => `
    <div class="card service-card">
      <span class="badge service-badge">${s.cat.toUpperCase()}</span>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="price-row">
        <span class="price">${formatINR(s.price)}</span>
        <button type="button" class="btn btn-outline" data-book-id="${s.id}">Book</button>
      </div>
    </div>
  `).join("");
}

function populateSelect() {
  const sel = document.getElementById("serviceSelect");
  sel.innerHTML = services.map((s) =>
    `<option value="${s.id}">[${s.cat.toUpperCase()}] ${s.name} — ${formatINR(s.price)}</option>`
  ).join("");
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  renderServices();
}

function selectService(id) {
  document.getElementById("serviceSelect").value = id;
  updateSummary();
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
}

function setBillingMode(mode) {
  billingMode = mode;
  document.getElementById("modePrepaid").classList.toggle("active", mode === "prepaid");
  document.getElementById("modePostpaid").classList.toggle("active", mode === "postpaid");
  document.getElementById("upiSection").classList.toggle("hidden", mode !== "prepaid");
  document.getElementById("postpaidSection").classList.toggle("hidden", mode !== "postpaid");
  document.getElementById("submitBtn").textContent = mode === "prepaid"
    ? "Confirm Prepaid UPI Booking"
    : "Confirm Postpaid Booking";
  updateSummary();
}

function updateSummary() {
  const id = document.getElementById("serviceSelect").value;
  const item = services.find((s) => s.id === id) || services[0];
  const base = item.price;

  document.getElementById("summaryMode").textContent =
    billingMode === "prepaid" ? "Prepaid (UPI)" : "Postpaid (Pay After Service)";
  document.getElementById("summaryBase").textContent = formatINR(base);

  if (billingMode === "prepaid") {
    const finalAmt = Math.round(base * 0.95);
    document.getElementById("summaryNote").textContent =
      "5% Prepaid UPI Discount (-" + formatINR(base - finalAmt) + ")";
    document.getElementById("payableLabel").textContent = "Payable Now via UPI:";
    document.getElementById("summaryTotal").textContent = formatINR(finalAmt);

    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${finalAmt}&cu=INR&tn=${encodeURIComponent(item.name)}`;
    document.getElementById("upiIntentLink").href = upiUrl;
  } else {
    document.getElementById("summaryNote").textContent = "₹0 advance • Settled upon completion";
    document.getElementById("payableLabel").textContent = "Due Now:";
    document.getElementById("summaryTotal").textContent = "₹0";
  }
}

function copyUpiId() {
  navigator.clipboard?.writeText(UPI_ID);
  alert("UPI ID copied: " + UPI_ID);
}

function handleBooking(e) {
  e.preventDefault();
  const id = document.getElementById("serviceSelect").value;
  const item = services.find((s) => s.id === id);
  const model = document.getElementById("deviceModel").value.trim();
  const contact = document.getElementById("customerContact").value.trim();
  const refCode = "VMK-" + Math.floor(10000 + Math.random() * 90000);
  const payable = billingMode === "prepaid" ? formatINR(item.price * 0.95) : "₹0 now (Postpaid)";

  const box = document.getElementById("confirmationBox");
  box.classList.remove("hidden");
  box.innerHTML = `
    <strong>Booking Reference: ${refCode}</strong><br />
    Provider: <strong>VMK Networks</strong><br />
    Service: <strong>${item.name}</strong> (${model})<br />
    Mode: <strong>${billingMode.toUpperCase()}</strong> • Amount Due Now: <strong>${payable}</strong><br />
    Contact: ${contact}
  `;
}

function bindEvents() {
  document.getElementById("modePrepaid").addEventListener("click", () => setBillingMode("prepaid"));
  document.getElementById("modePostpaid").addEventListener("click", () => setBillingMode("postpaid"));
  document.getElementById("serviceSelect").addEventListener("change", updateSummary);
  document.getElementById("copyUpiBtn").addEventListener("click", copyUpiId);
  document.getElementById("repairForm").addEventListener("submit", handleBooking);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => filterCategory(tab.dataset.category, tab));
  });

  document.getElementById("servicesGrid").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-book-id]");
    if (btn) {
      selectService(btn.dataset.bookId);
    }
  });
}

document.getElementById("upiIdText").textContent = UPI_ID;
document.getElementById("year").textContent = new Date().getFullYear();
populateSelect();
renderServices();
bindEvents();
updateSummary();