import { instantiateTemplate } from "../lib/dom.js";
export let getGlassFeatures = () =>
  document.getElementById("finderFeatures").value.trim();

export function initVehicle() {
  // Suggestions only: this is deliberately not a compatibility or inventory database.
  var models = {
    Toyota: [
      "Corolla",
      "Corolla Cross",
      "Hilux",
      "Fortuner",
      "Yaris",
      "Avanza",
      "Quantum",
      "Starlet",
      "RAV4",
    ],
    Volkswagen: [
      "Polo",
      "Polo Vivo",
      "Golf",
      "Tiguan",
      "Amarok",
      "Caddy",
      "Transporter",
    ],
    Ford: [
      "Ranger",
      "Everest",
      "Figo",
      "Fiesta",
      "Focus",
      "EcoSport",
      "Transit",
    ],
    Hyundai: ["i10", "Grand i10", "i20", "i30", "Tucson", "Creta", "H-1"],
    Kia: ["Picanto", "Rio", "Sportage", "Seltos", "Sorento"],
    BMW: ["1 Series", "2 Series", "3 Series", "5 Series", "X1", "X3", "X5"],
    "Mercedes-Benz": [
      "A-Class",
      "C-Class",
      "E-Class",
      "GLA",
      "GLC",
      "Vito",
      "Sprinter",
    ],
    Audi: ["A1", "A3", "A4", "Q2", "Q3", "Q5"],
    Nissan: [
      "Micra",
      "Almera",
      "NP200",
      "NP300",
      "Navara",
      "Qashqai",
      "X-Trail",
      "Magnite",
    ],
    Isuzu: ["KB", "D-Max", "MU-X"],
    Mahindra: ["Pik Up", "Scorpio", "XUV300", "XUV700"],
    Renault: ["Kwid", "Clio", "Duster", "Captur", "Triber", "Kiger"],
    Suzuki: [
      "Swift",
      "Baleno",
      "Ertiga",
      "Jimny",
      "Vitara",
      "Dzire",
      "S-Presso",
    ],
    Honda: ["Brio", "Jazz", "Ballade", "Civic", "CR-V", "HR-V"],
    Mazda: ["Mazda2", "Mazda3", "CX-3", "CX-5", "BT-50"],
  };
  var form = document.getElementById("glassFinderForm"),
    make = document.getElementById("finderMake"),
    model = document.getElementById("finderModel"),
    glass = document.getElementById("finderGlass");
  var list = document.createElement("datalist");
  list.id = "vehicleModelSuggestions";
  model.setAttribute("list", list.id);
  model.after(list);
  var help = document.createElement("span");
  help.id = "modelSuggestionHelp";
  help.className = "model-help";
  help.textContent =
    "Choose a make for common model suggestions, or type any model. Suggestions do not confirm fitment.";
  model.after(help);
  model.setAttribute("aria-describedby", help.id);
  function updateSuggestions() {
    list.replaceChildren();
    (models[make.value] || []).forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      list.appendChild(option);
    });
    help.textContent =
      make.value && models[make.value]
        ? "Common " +
          make.value +
          " models suggested. Your model missing? Type it in. Fitment is confirmed by the team."
        : "Type your model if known. Suggestions do not confirm fitment.";
  }
  make.addEventListener("change", updateSuggestions);
  updateSuggestions();
  var question = document.createElement("div");
  question.className = "field full finder-feature-question";
  question.hidden = true;
  var label = document.createElement("label");
  label.htmlFor = "finderEquipment";
  var equipment = document.createElement("select");
  equipment.id = "finderEquipment";
  equipment.disabled = true;
  var note = document.createElement("span");
  note.id = "finderEquipmentHelp";
  note.className = "form-help";
  note.textContent =
    "Not sure? Leave this unanswered and attach a photo in WhatsApp. We will not assume a glass specification.";
  equipment.setAttribute("aria-describedby", note.id);
  question.append(label, equipment, note);
  document.getElementById("finderFeatures").closest(".field").before(question);
  function updateEquipment() {
    var front = glass.value === "Front windscreen",
      rear = glass.value === "Rear windscreen / back glass";
    var type = front ? "front" : rear ? "rear" : "";
    var changed = question.dataset.type !== type;
    question.dataset.type = type;
    question.hidden = !type;
    equipment.disabled = !type;
    if (changed) {
      equipment.replaceChildren();
      var values = front
        ? [
            "Not sure / not provided",
            "No known sensors or camera",
            "Rain sensor",
            "Camera near rear-view mirror",
            "Rain sensor and camera",
          ]
        : rear
          ? [
              "Not sure / not provided",
              "Heated / demister lines",
              "No known heated lines",
            ]
          : [];
      values.forEach(function (value, i) {
        var option = document.createElement("option");
        option.value = i ? value : "";
        option.textContent = value;
        equipment.appendChild(option);
      });
      label.textContent = front
        ? "Sensors or camera near the windscreen? (optional)"
        : "Rear glass heating (optional)";
    }
  }
  getGlassFeatures = function () {
    var typed = document.getElementById("finderFeatures").value.trim();
    return [
      typed,
      !equipment.disabled && equipment.value
        ? label.textContent.replace(" (optional)", "") + " " + equipment.value
        : "",
    ]
      .filter(Boolean)
      .join("; ");
  };
  var live = document.createElement("section");
  live.className = "finder-live";
  live.setAttribute("aria-labelledby", "finderLiveTitle");
  live.append(instantiateTemplate("ui-template-3"));
  document.querySelector(".catalog-form-head").after(live);
  function updateLive() {
    updateEquipment();
    var values = {
      vehicle:
        [
          make.value,
          model.value.trim(),
          document.getElementById("finderYear").value.trim(),
        ]
          .filter(Boolean)
          .join(" ") || "Add your vehicle details",
      glass: glass.value || "Choose a glass panel",
      features: getGlassFeatures() || "Not provided — team to confirm",
      location:
        document.getElementById("finderLocation").value.trim() ||
        "Add your town or suburb",
    };
    Object.keys(values).forEach(function (key) {
      live.querySelector('[data-summary="' + key + '"]').textContent =
        values[key];
    });
  }
  form.addEventListener("input", updateLive);
  form.addEventListener("change", updateLive);
  updateLive();
}
