export function initProducts() {
  var productImageSources = {
    "Front windscreen": {
      src: "https://images.carid.com/pages/windshield/windshield.jpg",
      alt: "Replacement front windscreen glass panel with dark perimeter trim",
    },
    "Rear windscreen / back glass": {
      src: "https://images.carid.com/pages/back-glass/rear-window-glass.jpg",
      alt: "Replacement rear window glass panel with heated defroster lines",
    },
    "Side / door glass — position to confirm": {
      src: "https://assets.globalparts.co.uk/assets/jpg/2025/07/7067125-no11/window-glass-side-door-glazing-green-as2-front-left-n-s-bmw-e60-e61-sku-7067125-photo-11.webp?q=75&v=1&w=1080",
      alt: "Example curved side-door window glass panel",
    },
    "Quarter / vent glass": {
      src: "https://nvc-feil-prod-gcsproxy.ford.com/feil-image-upload-bucket-p/parts/images/photo-images/648/571648.jpg",
      alt: "Example shaped side glass panel shown as a visual reference",
    },
    "Chip or crack assessment": {
      src: "https://img1.wsimg.com/isteam/ip/3a446041-abff-4178-a90f-2492b09a6a25/AdobeStock_210571790.jpeg",
      alt: "Windscreen fitting reference for glass damage and replacement enquiries",
    },
    "Smash-and-grab glass": {
      src: "https://assets.globalparts.co.uk/assets/jpg/2025/07/7067125-no11/window-glass-side-door-glazing-green-as2-front-left-n-s-bmw-e60-e61-sku-7067125-photo-11.webp?q=75&v=1&w=1080",
      alt: "Example replacement side-door glass panel",
    },
    "Not sure — help me identify it": {
      src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=640&q=75",
      alt: "Illustrative vehicle to help identify which glass panel is needed",
    },
  };
  document
    .querySelectorAll(".product-tile[data-glass-choice]")
    .forEach(function (tile) {
      var key = tile.getAttribute("data-glass-choice");
      var source = productImageSources[key];
      var art = tile.querySelector(".product-art");
      if (!source || !art) return;
      var fallbackArt = art.firstElementChild.cloneNode(true);
      var image = document.createElement("img");
      image.src = source.src;
      image.alt = source.alt;
      image.loading = "lazy";
      image.decoding = "async";
      image.width = 640;
      image.height = 400;
      image.onerror = function () {
        // Preserve the original vector illustration if a remote product photo fails.
        art.replaceChildren(fallbackArt);
        art.setAttribute("aria-hidden", "true");
      };
      art.replaceChildren(image);
      art.setAttribute("aria-hidden", "true");
    });
}
