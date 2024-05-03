export function displayHistoryText(text) {
  const maxL = 10
  return text.length > maxL ? text.substring(0, maxL) + '...' : text
}

