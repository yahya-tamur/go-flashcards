export const createSVGElement = (qualifiedName, attrs, parent) => {
  const elt = document.createElementNS(
    "http://www.w3.org/2000/svg",
    qualifiedName,
  );
  for (const [key, value] of Object.entries(attrs)) {
    elt.setAttribute(key, value);
  }
  parent.appendChild(elt);
  return elt;
};
