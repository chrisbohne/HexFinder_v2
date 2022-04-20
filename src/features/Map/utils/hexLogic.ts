import { IOrientation, IHex, IPoint, ILayout, IOffsetHex } from '../interfaces';

// Layout for flat or pointy and for stretched hexagons

const Orientation = ({
  f0,
  f1,
  f2,
  f3,
  b0,
  b1,
  b2,
  b3,
  startAngle,
}: IOrientation) => {
  return { f0, f1, f2, f3, b0, b1, b2, b3, startAngle };
};

export const Layout = (
  orientation: IOrientation,
  size: IPoint,
  origin: IPoint
) => ({
  orientation,
  size,
  origin,
});

export const flatLayout = Orientation({
  f0: 3.0 / 2.0,
  f1: 0.0,
  f2: Math.sqrt(3.0) / 2.0,
  f3: Math.sqrt(3.0),
  b0: 2.0 / 3.0,
  b1: 0.0,
  b2: -1.0 / 3.0,
  b3: Math.sqrt(3.0) / 3.0,
  startAngle: 0.0,
});

export const pointyLayout = Orientation({
  f0: Math.sqrt(3.0),
  f1: Math.sqrt(3.0) / 2.0,
  f2: 0.0,
  f3: 3.0 / 2.0,
  b0: Math.sqrt(3.0) / 3.0,
  b1: -1.0 / 3.0,
  b2: 0.0,
  b3: 2.0 / 3.0,
  startAngle: 0.5,
});

// Operations
export const Point = (x: number, y: number) => ({ x, y });
export const Hex = (x: number, y: number, z: number) => ({ x, y, z });
const hexAdd = (a: IHex, b: IHex) => Hex(a.x + b.x, a.y + b.y, a.z + b.z);
const hexSubstract = (a: IHex, b: IHex) => Hex(a.x - b.x, a.y - b.y, a.z - b.z);

// Get Neighbors
const hexDirections = [
  Hex(1, 0, -1), // top right
  Hex(1, -1, 0), // bottom right
  Hex(0, -1, 1), // bottom
  Hex(-1, 0, 1), // bottom left
  Hex(-1, 1, 0), // top left
  Hex(0, 1, -1), // top
];

const hexDirection = (direction: number): IHex => hexDirections[direction];

export const hexNeighbor = (hex: IHex, direction: number) =>
  hexAdd(hex, hexDirection(direction));

// Converting Point and Hex

export const hexToPixel = (layout: ILayout, hex: IHex) => {
  const M = layout.orientation;
  const size = layout.size;
  const origin = layout.origin;
  const x = (M.f0 * hex.x + M.f1 * hex.y) * size.x;
  const y = (M.f2 * hex.x + M.f3 * hex.y) * size.y;
  return Point(x + origin.x, y + origin.y);
};

export const pixelToHex = (layout: ILayout, point: IPoint) => {
  const M = layout.orientation;
  const size = layout.size;
  const origin = layout.origin;
  const pt = Point(
    (point.x - origin.x) / size.x,
    (point.y - origin.y) / size.y
  );
  const x = M.b0 * pt.x + M.b1 * pt.y;
  const y = M.b2 * pt.x + M.b3 * pt.y;
  return Hex(x, y, -x - y);
};

export const hexRound = (hex: IHex) => {
  let xR = Math.round(hex.x);
  let yR = Math.round(hex.y);
  let zR = Math.round(hex.z);
  const xDiff = Math.abs(xR - hex.x);
  const yDiff = Math.abs(yR - hex.y);
  const zDiff = Math.abs(zR - hex.z);
  if (xDiff > yDiff && xDiff > zDiff) {
    xR = -yR - zR;
  } else if (yDiff > zDiff) {
    yR = -xR - zR;
  } else {
    zR = -xR - yR;
  }
  return Hex(xR, yR, zR);
};

export const offsetFromCube = (hex: IHex) => {
  const col = hex.x;
  const row = hex.y + (hex.x - (hex.x & 1)) / 2;
  return { col, row };
};

export const offsetToCube = (hex: IOffsetHex) => {
  const x = hex.col;
  const y = hex.row - (hex.col - (hex.col & 1)) / 2;
  const z = -x - y;
  return Hex(x, y, z);
};

// create Hex Corners

const hexCornerOffset = (layout: ILayout, corner: number) => {
  const M = layout.orientation;
  const size = layout.size;
  const angle = (2.0 * Math.PI * (M.startAngle - corner)) / 6.0;
  return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
};

export const hexCorners = (layout: ILayout, hex: IHex) => {
  const corners = [];
  const center = hexToPixel(layout, hex);
  for (let i = 0; i < 6; i++) {
    const offset = hexCornerOffset(layout, i);
    corners.push(Point(center.x + offset.x, center.y + offset.y));
  }
  return corners;
};

// get direct distances between two hexagons

const hexLength = (hex: IHex) => {
  return (Math.abs(hex.x) + Math.abs(hex.y) + Math.abs(hex.z)) / 2;
};

export const hexDistance = (a: IHex, b: IHex) => hexLength(hexSubstract(a, b));
