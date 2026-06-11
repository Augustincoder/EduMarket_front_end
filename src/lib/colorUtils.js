/**
 * Converts a HEX color to an RGB object {r, g, b}
 */
export const hexToRgb = (hex) => {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return {
      r: (c >> 16) & 255,
      g: (c >> 8) & 255,
      b: c & 255
    };
  }
  // Default fallback (Slate-500)
  return { r: 100, g: 116, b: 139 };
};

/**
 * Returns a glassmorphism style object for the given category color.
 * Generates background (rgba) and border (rgba)
 */
export const getCategoryStyles = (hexColor, alphaBg = 0.1, alphaBorder = 0.2) => {
  const { r, g, b } = hexToRgb(hexColor || '#64748b');
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${alphaBg})`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${alphaBorder})`,
    color: hexColor || '#cbd5e1'
  };
};

/**
 * Muted / Mono-color styles specifically for search bars (Jiddiy ko'rinish)
 */
export const getMutedCategoryStyles = (isDark = true) => {
  if (isDark) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      color: '#cbd5e1'
    };
  }
  return {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    color: '#334155'
  };
};
