/**
 * Create a DocumentFragment and fill it with HTML from a string
 *
 * @param {string} htmlString - A string of valid HTML
 * @returns {DocumentFragment}
 */
export default function makeFragment(htmlString: string): DocumentFragment {
  const tempDiv = document.createElement('div');

  tempDiv.innerHTML = htmlString.trim();

  const fragment = document.createDocumentFragment();

  fragment.append(...Array.from(tempDiv.childNodes));

  return fragment;
}
