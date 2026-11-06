import { initFormValidation } from "../lib/validation.js";
import { buildWhatsAppUrl, openWhatsApp } from "../lib/whatsapp.js";

export function initContact() {
  var form = document.getElementById("quoteForm"),
    status = document.getElementById("formStatus");
  initFormValidation(form);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.hidden = true;
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent =
        "Please complete the required fields and consent checkbox before continuing.";
      status.hidden = false;
      return;
    }
    var year = document.getElementById("year").value.trim();
    if (
      year &&
      (!/^\d{4}$/.test(year) ||
        Number(year) < 1950 ||
        Number(year) > new Date().getFullYear() + 1)
    ) {
      document
        .getElementById("year")
        .setCustomValidity("Enter a valid four-digit vehicle year.");
      document.getElementById("year").reportValidity();
      document.getElementById("year").setCustomValidity("");
      return;
    }
    var values = {
      Name: document.getElementById("name").value.trim(),
      "Contact number": document.getElementById("phone").value.trim(),
      Vehicle: [
        year,
        document.getElementById("make").value.trim(),
        document.getElementById("model").value.trim(),
      ]
        .filter(Boolean)
        .join(" "),
      Service: document.getElementById("service").value,
      Location: document.getElementById("location").value.trim(),
      "Additional details":
        document.getElementById("notes").value.trim() || "Not provided",
    };
    if (
      document.getElementById("service").value === "Fleet or corporate enquiry"
    ) {
      values["Business name"] =
        document.getElementById("companyName").value.trim() || "Not provided";
      values["Fleet size"] =
        document.getElementById("fleetSize").value || "Not provided";
      values["Vehicles needing attention"] =
        document.getElementById("vehicleCount").value.trim() || "Not provided";
      values["Quote / invoicing requirements"] =
        document.getElementById("procurement").value.trim() || "Not provided";
    }
    var message =
      "Hello Infinity Auto Glass & Parts, I would like to request a quote.\n\n" +
      Object.keys(values)
        .map(function (k) {
          return k + ": " + values[k];
        })
        .join("\n");
    var url = buildWhatsAppUrl(message);
    var fallback = document.createElement("a");
    fallback.href = url;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "tap here to open your prepared enquiry";
    status.replaceChildren(
      document.createTextNode(
        "Your WhatsApp enquiry is ready. Review it and press Send in WhatsApp. If WhatsApp did not open automatically, ",
      ),
      fallback,
      document.createTextNode(". You can attach damage photos there."),
    );
    status.hidden = false;
    openWhatsApp(url);
  });
  document.getElementById("year").addEventListener("input", function () {
    this.setCustomValidity("");
  });
  var serviceSelect = document.getElementById("service"),
    fleetFieldsElement = document.getElementById("fleetFields");
  function updateFleetFields() {
    fleetFieldsElement.hidden =
      serviceSelect.value !== "Fleet or corporate enquiry";
  }
  serviceSelect.addEventListener("change", updateFleetFields);
  updateFleetFields();
}
