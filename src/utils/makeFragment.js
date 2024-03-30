/**
 * Create a DocumentFragment and fill it with HTML from a string
 *
 * @param {string} htmlString - A string of valid HTML
 * @returns {DocumentFragment}
 */
export default function makeFragment(htmlString) {
  const tempDiv = document.createElement('div');

  tempDiv.innerHTML = htmlString.trim();

  var fragment = document.createDocumentFragment();

  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }

  return fragment;
}
