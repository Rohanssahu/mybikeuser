// Some rich-text content was authored by pasting raw HTML markup as literal
// text into the Admin Panel's editor, so it correctly HTML-escaped it (e.g.
// "&lt;h1&gt;") instead of storing real tags. Detect that specific mistake and
// recover the intended markup — this only touches content that looks
// double-escaped, so normally-authored HTML is untouched.
const DOUBLE_ESCAPED_TAG_PATTERN = /&lt;\/?(h[1-6]|p|ul|ol|li|div|span|strong|em|b|i|br|table|thead|tbody|tr|td|th|a|blockquote)[ &>]/i;

export const recoverDoubleEscapedHtml = (rawHtml: string) => {
  if (!DOUBLE_ESCAPED_TAG_PATTERN.test(rawHtml)) {
    return rawHtml;
  }
  return rawHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};
