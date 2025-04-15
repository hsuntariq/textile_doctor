// app/components/colorUtils.js
export const getColorName = (hex) => {
  const colorMap = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFFFF": "White",
    "#000000": "Black",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#FFFF00": "Yellow",
    "#A52A2A": "Brown",
    "#808080": "Gray",
  };

  // Find exact match
  if (colorMap[hex]) return colorMap[hex];

  // Find closest named color
  let closestColor = "Custom";
  let minDistance = Infinity;

  for (const [key, name] of Object.entries(colorMap)) {
    const distance = colorDistance(hex, key);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }

  return closestColor;
};

const colorDistance = (hex1, hex2) => {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);

  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);

  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
};
