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

export const wrapHtml = (bodyHtml: string, bodyStyle: string = 'font-family:sans-serif;padding:16px;color:#222;line-height:1.6;') => `
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body{
    ${bodyStyle}
}
h1,h2,h3{
    color:#111;
}
img{
    max-width:100%;
    height:auto;
}
table{
    width:100%;
}
</style>
</head>
<body>

${bodyHtml}

</body>
</html>
`;
