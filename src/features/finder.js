import { initFormValidation } from "../lib/validation.js";
import { currentRoute, navigate } from "./navigation.js";
import { getGlassFeatures } from "./vehicle.js";
import { buildWhatsAppUrl, openWhatsApp } from "../lib/whatsapp.js";
import { instantiateTemplate } from "../lib/dom.js";

export function initFinder() {
  var finderForm = document.getElementById("glassFinderForm");
  initFormValidation(finderForm);
  var finderStepIndex = 0;
  var preparedUrl = null;
  function invalidateReview() {
    preparedUrl = null;
    var review = document.getElementById("finderReview");
    if (review) review.hidden = true;
    var status = document.getElementById("finderStatus");
    if (status) status.hidden = true;
  }
  if (finderForm) {
    finderForm.addEventListener("input", invalidateReview);
    finderForm.addEventListener("change", invalidateReview);
  }
  if (finderForm) {
    // Progressive enhancement: arrange the existing real form controls into a 3-step wizard.
    // All values remain in the same form and the final WhatsApp handoff is unchanged.
    var finderGrid = finderForm.querySelector(".form-grid");
    var finderStepSpecs = [
      {
        title: "Your vehicle",
        hint: "Start with the exact vehicle details.",
        fields: ["finderMake", "finderModel", "finderYear"],
      },
      {
        title: "The glass you need",
        hint: "Choose the panel and add any identifying features.",
        fields: ["finderGlass", "finderDamage", "finderFeatures"],
      },
      {
        title: "Location & quote request",
        hint: "Tell us where the vehicle is so the team can respond.",
        fields: ["finderLocation", "finderPhotoHint"],
      },
    ];
    if (finderGrid) {
      finderGrid.classList.add("finder-wizard-grid");
      var finderSubmitField = finderGrid
        .querySelector('button[type="submit"]')
        ?.closest(".field");
      var finderPanels = finderStepSpecs.map(function (spec, index) {
        var panel = document.createElement("section");
        panel.className = "finder-step-panel";
        panel.setAttribute("data-finder-step", String(index));
        panel.setAttribute("aria-label", spec.title);
        panel.hidden = index !== 0;
        var heading = document.createElement("div");
        heading.className = "finder-step-heading";
        var strong = document.createElement("strong");
        strong.textContent = spec.title;
        var hint = document.createElement("span");
        hint.textContent = spec.hint;
        heading.appendChild(strong);
        heading.appendChild(hint);
        panel.appendChild(heading);
        spec.fields.forEach(function (id) {
          var field = document.getElementById(id)?.closest(".field");
          if (field) {
            field.classList.remove("full");
            panel.appendChild(field);
          }
        });
        finderGrid.appendChild(panel);
        return panel;
      });
      if (finderSubmitField) {
        finderSubmitField.classList.add("full");
        finderPanels[2].appendChild(finderSubmitField);
      }
      var finderControls = document.createElement("div");
      finderControls.className = "finder-wizard-controls";
      var finderBack = document.createElement("button");
      finderBack.type = "button";
      finderBack.className = "btn btn-back";
      finderBack.textContent = "← Back";
      finderBack.hidden = true;
      var finderNext = document.createElement("button");
      finderNext.type = "button";
      finderNext.className = "btn btn-dark btn-next";
      finderNext.textContent = "Continue →";
      finderControls.appendChild(finderBack);
      finderControls.appendChild(finderNext);
      finderGrid.after(finderControls);
      function showFinderStep(nextIndex) {
        finderStepIndex = Math.max(0, Math.min(2, nextIndex));
        finderPanels.forEach(function (panel, index) {
          panel.hidden = index !== finderStepIndex;
        });
        finderBack.hidden = finderStepIndex === 0;
        finderNext.hidden = finderStepIndex === 2;
        if (finderProgressText)
          finderProgressText.textContent =
            "Step " +
            (finderStepIndex + 1) +
            " of 3 · " +
            finderStepSpecs[finderStepIndex].title;
        if (finderProgress)
          finderProgress
            .querySelectorAll("span")
            .forEach(function (segment, index) {
              segment.classList.toggle("is-complete", index <= finderStepIndex);
            });
        var heading = finderPanels[finderStepIndex].querySelector(
          ".finder-step-heading",
        );
        if (heading) heading.setAttribute("tabindex", "-1");
        if (heading) heading.focus({ preventScroll: true });
      }
      function validateFinderStep() {
        var controls = finderPanels[finderStepIndex].querySelectorAll(
          "input,select,textarea",
        );
        for (var i = 0; i < controls.length; i++) {
          var control = controls[i];
          if (control.id === "finderYear") {
            control.setCustomValidity("");
          }
          if (control.id === "finderYear" && control.value.trim()) {
            var yearValue = Number(control.value.trim());
            if (
              !/^\d{4}$/.test(control.value.trim()) ||
              yearValue < 1950 ||
              yearValue > new Date().getFullYear() + 1
            ) {
              control.setCustomValidity("Enter a valid four-digit year.");
            } else {
              control.setCustomValidity("");
            }
          }
          if (!control.checkValidity()) {
            control.reportValidity();
            return false;
          }
        }
        return true;
      }
      finderNext.addEventListener("click", function () {
        if (validateFinderStep()) showFinderStep(finderStepIndex + 1);
      });
      finderBack.addEventListener("click", function () {
        showFinderStep(finderStepIndex - 1);
      });
      showFinderStep(0);
    }
    var glassTypes = document.getElementById("finderGlass");
    var pendingGlassChoice = null;
    var routedGlassChoice = null;
    var glassChoiceDetails = {
      "Front windscreen": {
        title: "Front windscreen",
        description:
          "The main front glass. Some vehicles have rain sensors, camera brackets, heating or special acoustic glass, so the vehicle details help confirm the correct match.",
      },
      "Rear windscreen / back glass": {
        title: "Rear windscreen / back glass",
        description:
          "The rear window, sometimes with a demister grid, antenna or integrated features. Share your vehicle details so the team can confirm the right version.",
      },
      "Side / door glass — position to confirm": {
        title: "Side / door glass",
        description:
          "Door glass differs by front or rear position and left or right side. You can confirm the exact position in the vehicle details.",
      },
      "Front left door glass": {
        title: "Front left door glass",
        description:
          "The front door window on the left-hand side of the vehicle. We’ll use your vehicle details to help confirm the correct fit.",
      },
      "Front right door glass": {
        title: "Front right door glass",
        description:
          "The front door window on the right-hand side of the vehicle. We’ll use your vehicle details to help confirm the correct fit.",
      },
      "Rear left door glass": {
        title: "Rear left door glass",
        description:
          "The rear door window on the left-hand side of the vehicle. We’ll use your vehicle details to help confirm the correct fit.",
      },
      "Rear right door glass": {
        title: "Rear right door glass",
        description:
          "The rear door window on the right-hand side of the vehicle. We’ll use your vehicle details to help confirm the correct fit.",
      },
      "Quarter / vent glass": {
        title: "Quarter / vent glass",
        description:
          "A smaller fixed or vent-style side panel, often beside the door window. A photo can help identify its exact shape and position.",
      },
      "Chip or crack assessment": {
        title: "Chip or crack assessment",
        description:
          "Tell us where the damage is and how large it is. The team can assess whether a repair may be suitable or replacement is needed.",
      },
      "Smash-and-grab glass": {
        title: "Smash-and-grab glass enquiry",
        description:
          "Tell us which glass panel is affected and your vehicle details. The team will confirm suitable replacement options.",
      },
      "Not sure — help me identify it": {
        title: "Help identify my glass",
        description:
          "No problem. Share the vehicle details and, if possible, a photo of the glass or damage in WhatsApp so the team can help identify it.",
      },
    };
    function canonicalGlassChoice(choice) {
      if (choice === "Rear glass") return "Rear windscreen / back glass";
      if (choice === "Door / side glass")
        return "Side / door glass — position to confirm";
      if (choice === "Quarter glass") return "Quarter / vent glass";
      if (choice === "Chip / crack") return "Chip or crack assessment";
      if (choice === "Help identify it")
        return "Not sure — help me identify it";
      return choice;
    }
    function applyGlassChoice(choice) {
      choice = canonicalGlassChoice(choice || "");
      if (!glassTypes) return;
      var option = Array.from(glassTypes.options).find(function (item) {
        return item.value === choice || item.text === choice;
      });
      if (!option && choice === "Smash-and-grab glass")
        option = Array.from(glassTypes.options).find(function (item) {
          return item.text === "Smash-and-grab glass";
        });
      if (!option) return;
      glassTypes.value = option.value;
      glassTypes.dispatchEvent(new Event("input", { bubbles: true }));
      glassTypes.dispatchEvent(new Event("change", { bubbles: true }));
      var selected = glassChoiceDetails[choice] || {
        title: choice,
        description:
          "We’ll carry this selection into your quote enquiry. Add your vehicle details to help confirm the correct glass.",
      };
      var summary = document.getElementById("glassChoiceSummary");
      if (summary) {
        summary.hidden = false;
        summary.querySelector("strong").textContent =
          "Selected glass: " + selected.title;
        summary.querySelector("span").textContent = selected.description;
      }
      var heading = document.querySelector(".catalog-form-head p");
      if (heading)
        heading.textContent =
          "Selected: " +
          selected.title +
          ". Add your vehicle details and we’ll help confirm the correct match.";
    }
    function showGlassInterest(choice) {
      choice = canonicalGlassChoice(choice || "");
      var detail = glassChoiceDetails[choice] || {
        title: choice,
        description:
          "Choose this glass type and share your vehicle details so the team can confirm the correct match.",
      };
      var panel = document.getElementById("glassInterestPanel");
      if (!panel) {
        panel = document.createElement("section");
        panel.id = "glassInterestPanel";
        panel.className = "glass-interest-panel";
        panel.setAttribute("aria-live", "polite");
        panel.append(instantiateTemplate("ui-template-1"));
        var grid = document.querySelector(".product-grid");
        if (grid) grid.insertAdjacentElement("afterend", panel);
        panel.querySelector("button").addEventListener("click", function () {
          if (!pendingGlassChoice) return;
          applyGlassChoice(pendingGlassChoice);
          showFinderStep(0);
          var form = document.querySelector(".catalog-form-card");
          if (form)
            form.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "start",
            });
          var first = document.getElementById("finderMake");
          if (first) first.focus({ preventScroll: true });
        });
      }
      pendingGlassChoice = choice;
      panel.querySelector("h3").textContent = detail.title;
      panel.querySelector("p").textContent = detail.description;
      panel.hidden = false;
      document.querySelectorAll(".product-tile").forEach(function (tile) {
        var active =
          canonicalGlassChoice(tile.getAttribute("data-glass-choice")) ===
          choice;
        tile.classList.toggle("is-selected", active);
        tile.setAttribute("aria-pressed", String(active));
      });
      panel.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    }
    var summary = document.createElement("div");
    summary.id = "glassChoiceSummary";
    summary.className = "glass-choice-summary";
    summary.hidden = true;
    summary.append(instantiateTemplate("ui-template-2"));
    var formHead = document.querySelector(".catalog-form-head");
    if (formHead) formHead.insertAdjacentElement("afterend", summary);
    window.addEventListener("routechange", function () {
      if (currentRoute() === "find-glass" && routedGlassChoice) {
        applyGlassChoice(routedGlassChoice);
        var form = document.querySelector(".catalog-form-card");
        if (form)
          form.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          });
      }
    });
    document.querySelectorAll("[data-glass-choice]").forEach(function (tile) {
      tile.addEventListener("click", function (event) {
        var choice = canonicalGlassChoice(
          tile.getAttribute("data-glass-choice"),
        );
        if (tile.classList.contains("product-tile")) {
          event.preventDefault();
          showGlassInterest(choice);
          return;
        }
        pendingGlassChoice = choice;
        routedGlassChoice = choice;
        if (tile.getAttribute("href") === "/find-glass/") {
          event.preventDefault();
          if (currentRoute() === "find-glass") {
            applyGlassChoice(choice);
            var form = document.querySelector(".catalog-form-card");
            if (form)
              form.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
                block: "start",
              });
          } else {
            navigate("find-glass");
          }
        } else {
          applyGlassChoice(choice);
        }
      });
    });
    finderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!finderForm.checkValidity()) {
        var invalid = finderForm.querySelector(":invalid");
        var panel = invalid && invalid.closest("[data-finder-step]");
        if (panel)
          showFinderStep(Number(panel.getAttribute("data-finder-step")));
        if (invalid) invalid.reportValidity();
        return;
      }
      var make = document.getElementById("finderMake").value,
        model = document.getElementById("finderModel").value.trim(),
        year = document.getElementById("finderYear").value.trim(),
        glass = glassTypes.value,
        damage = document.getElementById("finderDamage").value,
        features = getGlassFeatures(),
        location = document.getElementById("finderLocation").value.trim(),
        photo = document.getElementById("finderPhotoHint").checked;
      var yearField = document.getElementById("finderYear");
      if (
        year &&
        (!/^[0-9]{4}$/.test(year) ||
          Number(year) < 1950 ||
          Number(year) > new Date().getFullYear() + 1)
      ) {
        yearField.setCustomValidity("Enter a valid four-digit year.");
        yearField.reportValidity();
        yearField.setCustomValidity("");
        return;
      }
      var opener = "please help identify and quote the correct vehicle glass.";
      if (glass === "Chip or crack assessment")
        opener =
          "please assess the windscreen damage and advise whether repair or replacement may be suitable.";
      else if (glass === "Smash-and-grab glass")
        opener =
          "please advise on smash-and-grab replacement glass options for my vehicle.";
      else if (glass === "Not sure — help me identify it")
        opener = "please help identify the correct glass for my vehicle.";
      else if (
        glass.indexOf("door glass") !== -1 ||
        glass === "Side / door glass — position to confirm"
      )
        opener =
          "please quote for the correct side or door glass for my vehicle.";
      else if (glass === "Rear windscreen / back glass")
        opener = "please quote for the correct rear windscreen / back glass.";
      var message =
        "Hello Infinity Auto Glass & Parts, " +
        opener +
        "\n\nVehicle make: " +
        make +
        "\nVehicle model: " +
        model +
        "\nYear: " +
        (year || "Not provided") +
        "\nGlass needed: " +
        glass +
        "\nDamage or service needed: " +
        (damage || "Not specified") +
        "\nFeatures / extra details: " +
        (features || "Not provided") +
        "\nLocation: " +
        location +
        "\nPhoto reminder: " +
        (photo
          ? "I will attach a photo in WhatsApp."
          : "I can provide photos if needed.") +
        "\n\nPlease confirm exact compatibility, availability, price and fitting options before booking.";
      var finderUrl = buildWhatsAppUrl(message);
      var review = document.getElementById("finderReview");
      var status = document.getElementById("finderStatus");
      var summary = document.getElementById("finderReviewSummary");
      summary.replaceChildren();
      [
        ["Vehicle", make + " " + model + (year ? " (" + year + ")" : "")],
        ["Glass", glass],
        ["Damage / service", damage || "Not specified"],
        ["Features", features || "Not provided"],
        ["Location", location],
        [
          "Photos",
          photo
            ? "Reminder: attach photos in WhatsApp"
            : "You can attach photos in WhatsApp if helpful",
        ],
      ].forEach(function (item) {
        var row = document.createElement("div");
        row.className = "finder-review-row";
        var label = document.createElement("strong");
        label.textContent = item[0];
        var value = document.createElement("span");
        value.textContent = item[1];
        row.appendChild(label);
        row.appendChild(value);
        summary.appendChild(row);
      });
      preparedUrl = finderUrl;
      review.hidden = false;
      status.hidden = true;
      review.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
    var finderReviewSend = document.getElementById("finderReviewSend");
    var finderReviewEdit = document.getElementById("finderReviewEdit");
    finderReviewSend.addEventListener("click", function () {
      if (!preparedUrl) return;
      openWhatsApp(preparedUrl);
      var fallback = document.createElement("a");
      fallback.href = preparedUrl;
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "open your prepared enquiry";
      document
        .getElementById("finderStatus")
        .replaceChildren(
          document.createTextNode(
            "Review and press Send in WhatsApp. If it did not open, ",
          ),
          fallback,
          document.createTextNode(". Attach any photos there."),
        );
      document.getElementById("finderStatus").hidden = false;
    });
    finderReviewEdit.addEventListener("click", function () {
      preparedUrl = null;
      document.getElementById("finderReview").hidden = true;
      showFinderStep(0);
      document.getElementById("finderMake").focus({ preventScroll: true });
      finderForm.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }

  // Keep catalogue category selection and the guided completion meter in sync.
  var finderMake = document.getElementById("finderMake");
  var finderModel = document.getElementById("finderModel");
  var finderYear = document.getElementById("finderYear");
  var finderGlass = document.getElementById("finderGlass");
  var finderLocation = document.getElementById("finderLocation");
  var finderProgress = document.getElementById("finderProgress");
  var finderProgressText = document.getElementById("finderProgressText");
  function updateFinderProgress() {
    if (!finderProgress || !finderProgressText) return;
    var values = [
      finderMake && finderMake.value,
      finderModel && finderModel.value.trim(),
      finderYear && finderYear.value.trim(),
      finderGlass && finderGlass.value,
      finderLocation && finderLocation.value.trim(),
    ];
    var completed = values.filter(Boolean).length;
    finderProgress.querySelectorAll("span").forEach(function (segment, index) {
      segment.classList.toggle("is-complete", index <= finderStepIndex);
    });
    finderProgressText.textContent =
      "Step " +
      (finderStepIndex + 1) +
      " of 3 · " +
      completed +
      " details entered";
  }
  [finderMake, finderModel, finderYear, finderGlass, finderLocation].forEach(
    function (field) {
      if (field) {
        field.addEventListener("input", updateFinderProgress);
        field.addEventListener("change", updateFinderProgress);
      }
    },
  );
  updateFinderProgress();
  document
    .querySelectorAll(".product-tile[data-glass-choice]")
    .forEach(function (tile) {
      tile.addEventListener("click", function () {
        document
          .querySelectorAll(".product-tile[data-glass-choice]")
          .forEach(function (other) {
            other.classList.toggle("is-selected", other === tile);
            other.setAttribute("aria-pressed", String(other === tile));
          });
      });
      tile.setAttribute("aria-pressed", "false");
    });
}
