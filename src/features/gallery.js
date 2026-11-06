import { instantiateTemplate } from "../lib/dom.js";

export function initGallery() {
  // Native dialog supplies modal focus trapping and Escape handling without a library.
  var viewer = document.createElement("dialog");
  viewer.className = "job-viewer";
  viewer.id = "jobPhotoViewer";
  viewer.setAttribute("aria-labelledby", "jobViewerTitle");
  viewer.append(instantiateTemplate("ui-template-4"));
  document.body.appendChild(viewer);
  var gallery = [],
    index = 0,
    opener = null;
  var photo = viewer.querySelector("img"),
    caption = viewer.querySelector("figcaption"),
    status = viewer.querySelector(".job-viewer-status"),
    error = viewer.querySelector(".job-viewer-error");
  function renderPhoto() {
    var item = gallery[index],
      image = item.querySelector("img");
    var src = image.src.replace(/-800\.webp$/, "-1200.webp");
    photo.alt = image.alt;
    photo.src = src;
    caption.textContent =
      item.querySelector("strong").textContent +
      " — " +
      item.querySelector("div > span").textContent;
    status.textContent = "Photo " + (index + 1) + " of " + gallery.length;
    error.hidden = true;
  }
  photo.addEventListener("error", function () {
    error.hidden = false;
  });
  function move(delta) {
    index = (index + delta + gallery.length) % gallery.length;
    renderPhoto();
  }
  viewer
    .querySelector("[data-viewer-close]")
    .addEventListener("click", function () {
      viewer.close();
    });
  viewer
    .querySelector("[data-viewer-prev]")
    .addEventListener("click", function () {
      move(-1);
    });
  viewer
    .querySelector("[data-viewer-next]")
    .addEventListener("click", function () {
      move(1);
    });
  viewer.addEventListener("keydown", function (e) {
    // Keep Tab deterministic at both ends; the native modal still handles inertness and Escape.
    if (e.key === "Tab") {
      const buttons = viewer.querySelectorAll("button:not([disabled])");
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    }
  });
  viewer.addEventListener("click", function (e) {
    if (e.target === viewer) {
      var r = viewer.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        viewer.close();
    }
  });
  viewer.addEventListener("close", function () {
    document.body.classList.remove("photo-viewer-open");
    photo.removeAttribute("src");
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener("routechange", function () {
    if (viewer.open) viewer.close();
  });
  document.querySelectorAll(".customer-job").forEach(function (card) {
    var image = card.querySelector("img"),
      button = document.createElement("button");
    button.type = "button";
    button.className = "job-photo-open";
    button.setAttribute(
      "aria-label",
      "View larger photo: " + card.querySelector("strong").textContent,
    );
    button.setAttribute("aria-haspopup", "dialog");
    image.before(button);
    button.appendChild(image);
    button.addEventListener("click", function () {
      gallery = Array.from(
        card.closest(".gallery-grid").querySelectorAll(".customer-job"),
      );
      index = gallery.indexOf(card);
      opener = button;
      renderPhoto();
      viewer.showModal();
      document.body.classList.add("photo-viewer-open");
      viewer.querySelector("[data-viewer-close]").focus();
    });
  });
}
