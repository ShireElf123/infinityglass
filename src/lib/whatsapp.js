// @ts-check
export const WHATSAPP_NUMBER = "27845262956";
/** Prepare a URL only; no website form submission, upload or storage is performed.
 * @param {string} message
 */
export function buildWhatsAppUrl(message) {
  if (typeof message !== "string") throw new TypeError("Enquiry must be text.");
  const text = message
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g, (value) =>
      value.length === 2 ? value : "\ufffd",
    )
    .trim();
  if (!text || text.length > 8000)
    throw new RangeError("Enquiry length is invalid.");
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  url.search = `?text=${encodeURIComponent(text)}`;
  return url.href;
}
/** Validate the fixed recipient and protocol before opening a new application/tab.
 * @param {string} value
 */
export function openWhatsApp(value) {
  const url = new URL(value);
  if (
    url.origin !== "https://wa.me" ||
    url.pathname !== `/${WHATSAPP_NUMBER}` ||
    !url.searchParams.get("text")
  )
    throw new Error("Invalid enquiry URL.");
  window.open(url.href, "_blank", "noopener,noreferrer");
}
