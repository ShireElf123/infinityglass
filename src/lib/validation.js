/** Keep native, labelled constraint validation; never claim a website submission. */
export function initFormValidation(form) {
  form.addEventListener(
    "invalid",
    (event) => {
      event.target.setAttribute("aria-invalid", "true");
    },
    true,
  );
  const update = (event) => {
    const field = event.target;
    if (
      !(
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      )
    )
      return;
    field.setCustomValidity("");
    field.removeAttribute("aria-invalid");
    if (field.required && field.type !== "checkbox" && !field.value.trim()) {
      field.setCustomValidity("Please complete this field.");
    } else if (field.id === "phone" && !/^[+()\d\s.-]+$/.test(field.value)) {
      field.setCustomValidity(
        "Enter a contact number using digits and optional phone formatting.",
      );
    } else if (
      field.id === "phone" &&
      !/^\d{7,15}$/.test(field.value.replace(/\D/g, ""))
    ) {
      field.setCustomValidity("Enter a contact number with 7 to 15 digits.");
    }
  };
  form.addEventListener("input", update);
  form.addEventListener("change", update);
}
