import { initNavigation } from "./features/navigation.js";
import { initFinder } from "./features/finder.js";
import { initContact } from "./features/contact.js";
import { initProducts } from "./features/products.js";
import { initVehicle } from "./features/vehicle.js";
import { initGallery } from "./features/gallery.js";
import { initMotion } from "./features/motion.js";

initNavigation();
initFinder();
initContact();
initProducts();
initVehicle();
initGallery();
initMotion();
document.getElementById("yearNow")!.textContent = String(
  new Date().getFullYear(),
);
