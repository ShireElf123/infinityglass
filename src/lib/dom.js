/** Clone only repository-authored, inert HTML templates. Never parse user input as HTML. */
export function instantiateTemplate(id) {
  const template = document.getElementById(id);
  if (!(template instanceof HTMLTemplateElement))
    throw new Error(`Missing template: ${id}`);
  return template.content.cloneNode(true);
}
