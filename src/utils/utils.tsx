import _, { isPlainObject } from "lodash";
import {
   defaultSeatRadius,
   gapInRectTableAndSeats,
   minRectTableGap,
   rectTableScale,
   seatsLabelGenerator,
} from "./data";
import { comparePoints } from "./others";
import {
   IVisualizerData,
   IVisualizerState,
} from "../contexts/VisualizerContext";
import { getAllSeats, isObjectPurchased, isSeatBlocked } from "./non-geom";
import { uuid } from "uuidv4";
import generateUniqueId from "generate-unique-id";

export const DEG_VAL_ONE_RADIAN = 57.2958;

export const toDataURI = (file: File): Promise<string> =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
   });

export const getDistance = (p1: Point, p2: Point) => {
   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const findPointOnLineAtDistance = (
   p1: Point,
   p2: Point,
   distance: number
) => {
   const totalDistance = getDistance(p1, p2);
   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;

   // Normalize the direction vector.
   const dirX = dx / totalDistance;
   const dirY = dy / totalDistance;

   // Scale the direction vector by the desired distance.
   const moveX = dirX * distance;
   const moveY = dirY * distance;

   // Compute the new point.
   return {
      x: p1.x + moveX,
      y: p1.y + moveY,
   };
};
export const findPointOnLineAtDistanceWithSkew = (
   p1: Point,
   p2: Point,
   distance: number,
   skew: number
) => {
   const totalDistance = getDistance(p1, p2);
   const ratio = distance / totalDistance;
   const pointWithoutSkew = {
      x: (1 - ratio) * p1.x + ratio * p2.x,
      y: (1 - ratio) * p1.y + ratio * p2.y,
   };
   return skewPoint(p1, p2, pointWithoutSkew, skew);
};

export function findThirdPointY(p1: Point, p2: Point, x3: number): number {
   if (p2.x === p1.x) {
      // The line is vertical, so y3 can be any value.
      // However, for this function, we'll return NaN to indicate that it's not well-defined.
      return NaN;
   }

   // Calculate the slope
   const m = (p2.y - p1.y) / (p2.x - p1.x);

   // Calculate the y-intercept
   const c = p1.y - m * p1.x;

   // Return the y value for x3
   return m * x3 + c;
}
export const getRelativeMousePos = (
   e: React.MouseEvent | MouseEvent,
   parent?: HTMLElement | SVGSVGElement
): Point => {
   const rect = parent
      ? parent.getBoundingClientRect()
      : (e.target as HTMLElement).getBoundingClientRect();

   return { x: e.clientX - rect.left, y: e.clientY - rect.top };
};
export const getRelativeTouchPos = (
   touch: React.Touch | Touch,
   parent?: HTMLElement | SVGSVGElement | null
): Point => {
   const rect = parent
      ? parent.getBoundingClientRect()
      : (touch.target as Element).getBoundingClientRect();

   return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
};
export const getDiretionVectorsOfRow = (row: IRow) => {
   const x = row.start.x < row.end.x ? 1 : -1;
   const y = row.start.y < row.end.y ? 1 : -1;
   return { x, y };
};

export const rowsHaveSameDirectionVectors = (rows: IRow[]) => {
   return rows.every((row) =>
      comparePoints(
         getDiretionVectorsOfRow(row),
         getDiretionVectorsOfRow(rows[0])
      )
   );
};
export const getNoOfSeats = (row: IRow) => {
   const distance = getDistance(row.start, row.end);
   const noOfSeats = Math.floor(distance / (row.radius * 2 + row.gapping));
   return noOfSeats < 0 ? 0 : noOfSeats;
};

export const findLineRotation = (p1: Point, p2: Point) => {
   const deltaY = p2.y - p1.y;
   const deltaX = p2.x - p1.x;
   const angleInRadians = Math.atan2(deltaY, deltaX);
   const angleInDegrees = (angleInRadians * 180) / Math.PI;
   return angleInDegrees;
};

export const toRadians = (angle: number) => (angle / 180) * Math.PI;
export const getCorrectEndPointOfRow = (row: IRow): Point => {
   const totalDistance =
      row.noOfSeats * (row.radius * 2 + row.gapping) - row.gapping;
   const end = findPointOnLineAtDistance(row.start, row.end, totalDistance);
   let positionBeforeRotation: { start: Point; end: Point } | undefined =
      undefined;
   if (row.positionBeforeRotation) {
      positionBeforeRotation = {
         start: row.positionBeforeRotation.start,
         end: findPointOnLineAtDistance(
            row.positionBeforeRotation.start,
            row.positionBeforeRotation.end,
            totalDistance
         ),
      };
   }
   return end;
};

export const correctRowPoints = (row: IRow): IRow => {
   const totalDistance =
      row.noOfSeats * (row.radius * 2 + row.gapping) - row.gapping;
   const end = findPointOnLineAtDistance(row.start, row.end, totalDistance);
   let positionBeforeRotation: { start: Point; end: Point } | undefined =
      undefined;
   if (row.positionBeforeRotation) {
      positionBeforeRotation = {
         start: row.positionBeforeRotation.start,
         end: findPointOnLineAtDistance(
            row.positionBeforeRotation.start,
            row.positionBeforeRotation.end,
            totalDistance
         ),
      };
   }
   return { ...row, end, positionBeforeRotation };
};
export const degToRadians = (angleInDegree: number) =>
   (angleInDegree / 180) * Math.PI;
export const makeTwoPointsForRect = (
   start: Point,
   end: Point,
   skewValue: number,
   radius: number
) => {
   const newStart = skewPoint(start, end, start, skewValue);
   const newEnd = skewPoint(start, end, end, skewValue);
   const angle = findLineRotation(start, end);
   const angleInRadians = toRadians(angle);
   const offsetY = Math.abs(Math.cos(angleInRadians) * radius);
   const offsetX = Math.abs(Math.sin(angleInRadians) * radius);
   if (newStart.y <= newEnd.y) {
      newStart.y -= offsetY;
      newEnd.y += offsetY;
   }
   if (newStart.y > newEnd.y) {
      newStart.y += offsetY;
      newEnd.y -= offsetY;
   }

   if (newStart.x <= newEnd.x) {
      newStart.x -= offsetX;
      newEnd.x += offsetX;
   }

   if (newStart.x > newEnd.x) {
      newStart.x += offsetX;
      newEnd.x -= offsetX;
   }

   return { start: newStart, end: newEnd };
};

export const getRowLabelPos = (row: IRow): { left: Point; right: Point } => {
   row = correctRowPoints(row);
   const noOfSeats = row.noOfSeats;
   const start = row.start;
   const totalDistance =
      noOfSeats * (row.radius * 2 + row.gapping) - row.gapping;
   const end = findPointOnLineAtDistance(row.start, row.end, totalDistance);

   const skewedStart = skewAndCurvePoint(
      start,
      end,
      start,
      row.skew,
      row.curve
   );
   const skewedEnd = skewAndCurvePoint(start, end, end, row.skew, row.curve);
   const skewedDistance = getDistance(skewedStart, skewedEnd);

   const labelOffset = 20;
   const leftLabelPos = findPointOnLineAtDistance(
      skewedStart,
      skewedEnd,
      -labelOffset
   );
   const rightLabelPos = findPointOnLineAtDistance(
      skewedStart,
      skewedEnd,
      skewedDistance + labelOffset
   );
   // const curveTangents = findCurveTangents(skewedStart, skewedEnd, row.curve);

   const rotation = findLineRotation(skewedStart, skewedEnd);

   return { left: leftLabelPos, right: rightLabelPos };
};
export const getRowResizeDotPoints = (row: IRow): Rect => {
   const skewedAndCurvedStart = skewAndCurvePoint(
      row.start,
      row.end,
      row.start,
      row.skew,
      row.curve
   );
   const skewedAndCurvedEnd = skewAndCurvePoint(
      row.start,
      row.end,
      row.end,
      row.skew,
      row.curve
   );
   const firstSeatCenter = findPointOnLineAtDistance(
      row.start,
      row.end,
      row.radius
   );
   const lastSeatCenter = findPointOnLineAtDistance(
      row.end,
      row.start,
      row.radius
   );
   const firstSeatCenterAfterSkew = skewAndCurvePoint(
      row.start,
      row.end,
      firstSeatCenter,
      row.skew,
      row.curve
   );
   const lastSeatCenterAfterSkew = skewAndCurvePoint(
      row.start,
      row.end,
      lastSeatCenter,
      row.skew,
      row.curve
   );
   const startDot = findPointOnLineAtDistance(
      firstSeatCenterAfterSkew,
      skewedAndCurvedStart,
      row.radius
   );
   const endDot = findPointOnLineAtDistance(
      lastSeatCenterAfterSkew,
      skewedAndCurvedEnd,
      row.radius
   );
   return { start: startDot, end: endDot };
};

export const getEndPointsOfLabels = (
   row: IRow,
   rowGroups: IRowGroup[],
   rows: IRow[]
): Point[] => {
   row = correctRowPoints(row);
   const labelBoxSizes = [
      {},
      {
         height: 12.5,
         width: 8.75,
      },
      {
         height: 12.5,
         width: 15.5,
      },
      {
         height: 12.5,
         width: 22.125,
      },
   ];

   const noOfSeats = row.noOfSeats;
   const start = row.positionBeforeRotation?.start || row.start;
   const end2 = row.positionBeforeRotation?.end || row.end;
   const totalDistance =
      noOfSeats * (row.radius * 2 + row.gapping) - row.gapping;
   const end = findPointOnLineAtDistance(start, end2, totalDistance);

   const skewedStart = skewAndCurvePoint(
      start,
      end,
      start,
      row.skew,
      row.curve
   );
   const skewedEnd = skewAndCurvePoint(start, end, end, row.skew, row.curve);
   const skewedDistance = getDistance(skewedStart, skewedEnd);

   let myLabel = row.label;
   let labelPos = row.labelPosition;

   //Generate the labels to get the string length of the label
   if (row.groupId) {
      const rowGroup = rowGroups.find(
         (group) => group.id === row.groupId
      ) as IRowGroup;
      if (rowGroup.rowsLabelType === "None") return [];

      const otherRowsOfMyGroup = rows.filter((r) => r.groupId === rowGroup.id);
      const myIndex = otherRowsOfMyGroup.findIndex((r) => r.id === row.id);
      const myLabelsWithoutReverse = seatsLabelGenerator[
         rowGroup.rowsLabelType
      ](rowGroup.noOfRows, rowGroup.rowsLabelStartingAt);
      const myLabels = rowGroup.reverseRowsLabel
         ? myLabelsWithoutReverse.reverse()
         : myLabelsWithoutReverse;
      myLabel = myLabels[myIndex];
   }

   if (!myLabel || myLabel.length === 0) {
      return [];
   }
   const myLabelSize = labelBoxSizes[myLabel.length];
   let labelOffset = (myLabelSize.width || 0) / 2 + 20;

   const leftLabelPos = findPointOnLineAtDistance(
      skewedStart,
      skewedEnd,
      -labelOffset
   );
   const rightLabelPos = findPointOnLineAtDistance(
      skewedStart,
      skewedEnd,
      skewedDistance + labelOffset
   );
   if (row.labelPosition === "left") {
      return [leftLabelPos];
   }
   if (row.labelPosition === "right") {
      return [rightLabelPos];
   }
   return [rightLabelPos, leftLabelPos];
};

export function generateSvgPathForCurvedLine(
   start: Point,
   end: Point,
   curveValue: number,
   skewValue: number
): string {
   // Get skewed start and end points
   const { start: skewedStart, end: skewedEnd } = skewEndPoints(
      start,
      end,
      skewValue
   );

   // Find the center of the skewed line
   const centerX = (skewedStart.x + skewedEnd.x) / 2;
   const centerY = (skewedStart.y + skewedEnd.y) / 2;

   // Calculate the direction of the line for the skewed points
   const angleOfLine = Math.atan2(
      skewedEnd.y - skewedStart.y,
      skewedEnd.x - skewedStart.x
   );

   // Calculate the direction of the curve (perpendicular to the skewed line)
   const angleOfCurve = angleOfLine + Math.PI / 2;

   // Determine the control point for the quadratic Bezier curve
   const controlPoint = {
      x: centerX + curveValue * Math.cos(angleOfCurve),
      y: centerY + curveValue * Math.sin(angleOfCurve),
   };

   // Construct the 'd' attribute for the SVG path
   const d = `M ${skewedStart.x} ${skewedStart.y} Q ${controlPoint.x} ${controlPoint.y}, ${skewedEnd.x} ${skewedEnd.y}`;

   return d;
}

export const makeRowPointsForRect = (row: IRow): IRow => {
   row = correctRowPoints(row);
   const { start, end } = makeTwoPointsForRect(
      row.start,
      row.end,
      row.radius,
      row.skew
   );
   let positionBeforeRotation: { start: Point; end: Point } | undefined =
      undefined;
   if (row.positionBeforeRotation) {
      positionBeforeRotation = makeTwoPointsForRect(
         row.positionBeforeRotation.start,
         row.positionBeforeRotation.end,
         row.radius,
         row.skew
      );
   }

   return {
      ...row,
      start,
      end,
      positionBeforeRotation,
   };
};

export const isPointInsideRect = (start: Point, end: Point, point: Point) => {
   return (
      point.x > start.x &&
      point.y > start.y &&
      point.x < end.x &&
      point.y < end.y
   );
};
export const addPoints = (p1: Point, p2: Point): Point => {
   return { x: p1.x + p2.x, y: p1.y + p2.y };
};

function getSeatsOfRectTable(
   table: IRectTable
): { point: Point; locationType: ISeatLocation }[] {
   const seatMargin = gapInRectTableAndSeats;
   const seatRadius = 12;
   const points: { point: Point; locationType: ISeatLocation }[] = [];
   const pixelWidth = table.width * rectTableScale;
   const pixelHeight = table.height * rectTableScale;

   // Top side
   const topSeatSpacing =
      table.seatsTop > 1
         ? (pixelWidth - 2 * seatRadius) / (table.seatsTop - 1)
         : 0;
   for (let i = 0; i < table.seatsTop; i++) {
      const x =
         table.seatsTop > 1
            ? table.center.x - pixelWidth / 2 + seatRadius + topSeatSpacing * i
            : table.center.x;
      const y = table.center.y - pixelHeight / 2 - seatMargin - seatRadius;
      points.push({
         point: rotatePoint({ x, y }, table.center, table.angle),
         locationType: "top",
      });
   }
   const rightSeatSpacing =
      table.seatsRight > 1
         ? (pixelHeight - 2 * seatRadius) / (table.seatsRight - 1)
         : 0;
   for (let i = 0; i < table.seatsRight; i++) {
      const x = table.center.x + pixelWidth / 2 + seatMargin + seatRadius;
      const y =
         table.seatsRight > 1
            ? table.center.y -
              pixelHeight / 2 +
              seatRadius +
              rightSeatSpacing * i
            : table.center.y;
      points.push({
         point: rotatePoint({ x, y }, table.center, table.angle),
         locationType: "right",
      });
   }

   // Bottom side
   const bottomSeatSpacing =
      table.seatsBottom > 1
         ? (pixelWidth - 2 * seatRadius) / (table.seatsBottom - 1)
         : 0;
   for (let i = 0; i < table.seatsBottom; i++) {
      const x =
         table.seatsBottom > 1
            ? table.center.x -
              pixelWidth / 2 +
              seatRadius +
              bottomSeatSpacing * i
            : table.center.x;
      const y = table.center.y + pixelHeight / 2 + seatMargin + seatRadius;
      points.push({
         point: rotatePoint({ x, y }, table.center, table.angle),
         locationType: "bottom",
      });
   }

   // Left side
   const leftSeatSpacing =
      table.seatsLeft > 1
         ? (pixelHeight - 2 * seatRadius) / (table.seatsLeft - 1)
         : 0;
   for (let i = 0; i < table.seatsLeft; i++) {
      const x = table.center.x - pixelWidth / 2 - seatMargin - seatRadius;
      const y =
         table.seatsLeft > 1
            ? table.center.y -
              pixelHeight / 2 +
              seatRadius +
              leftSeatSpacing * i
            : table.center.y;
      points.push({
         point: rotatePoint({ x, y }, table.center, table.angle),
         locationType: "left",
      });
   }

   // Right side

   return points;
}

export const getAllSeatPoints = (rows: IRow[], allSeats: ISeat[]): ISeat[] => {
   return rows.flatMap((row) => {
      const allLabels = seatsLabelGenerator[row.labelType](row.noOfSeats);
      const seatPoints = Array(row.noOfSeats)
         .fill(0)
         .flatMap((seat, i) => {
            let myDistance = i * (row.radius * 2 + row.gapping) + row.radius;
            const myPreviousSeat = allSeats.find(
               (s) => s.rowId === row.id && i === s.index
            );
            const point = findPointOnLineAtDistance(
               row.positionBeforeRotation?.start || row.start,
               row.positionBeforeRotation?.end || row.end,
               myDistance
            );

            const pointAfterCurve = skewAndCurvePoint(
               row.positionBeforeRotation?.start || row.start,
               row.positionBeforeRotation?.end || row.end,
               point,
               row.skew,
               row.curve
            );
            return {
               index: i,
               rowId: row.id,
               radius: row.radius,
               label: allLabels[i],
               available: "available",
               type: "seat",
               id: getRandomId(),
               labelModified: false,
               recentlyDeleted: false,
               ...(myPreviousSeat || {}),

               position: pointAfterCurve,
            } as ISeat;
         });
      return seatPoints;
   });
};
export const changeRectToStandardRect = (rect: Rect): Rect => {
   if (rect.start.x < rect.end.x && rect.start.y < rect.end.y) {
      return rect;
   } else if (rect.start.x > rect.end.x && rect.start.y < rect.end.y) {
      return {
         start: { x: rect.end.x, y: rect.start.y },
         end: { x: rect.start.x, y: rect.end.y },
      };
   } else if (rect.start.x < rect.end.x && rect.start.y > rect.end.y) {
      return {
         start: { x: rect.start.x, y: rect.end.y },
         end: { x: rect.end.x, y: rect.start.y },
      };
   } else if (rect.start.x > rect.end.x && rect.start.y > rect.end.y) {
      return {
         start: rect.end,
         end: rect.start,
      };
   }
   return rect;
};
export function removeDuplicateSeats(seats: ISeat[]) {
   return Object.values(
      Object.fromEntries(
         seats.map((seat) => [`${seat.rowId}-${seat.index}`, seat])
      )
   );
}

function onSegment(p: Point, q: Point, r: Point): boolean {
   return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
   );
}

function orientation(p: Point, q: Point, r: Point): number {
   const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
   if (val === 0) return 0; // colinear
   return val > 0 ? 1 : 2; // clock or counterclockwise
}

function doLineSegmentsIntersect(
   p1: Point,
   q1: Point,
   p2: Point,
   q2: Point
): boolean {
   // Find the four orientations needed for general and special cases
   const o1 = orientation(p1, q1, p2);
   const o2 = orientation(p1, q1, q2);
   const o3 = orientation(p2, q2, p1);
   const o4 = orientation(p2, q2, q1);

   // General case
   if (o1 !== o2 && o3 !== o4) return true;

   // Special Cases
   if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are colinear and p2 lies on segment p1q1
   if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are colinear and q2 lies on segment p1q1
   if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are colinear and p1 lies on segment p2q2
   if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are colinear and q1 lies on segment p2q2

   return false; // Doesn't fall in any of the above cases
}
export function isRectTouchingSquare(rect: Rect, square: ISquare): boolean {
   // Convert the square into a rectangle form for easier comparison
   const squareRect: Rect = {
      start: square.start,
      end: {
         x: square.start.x + square.width,
         y: square.start.y + square.height,
      },
   };

   // Check if the rectangles intersect
   return !(
      rect.end.x < squareRect.start.x ||
      rect.start.x > squareRect.end.x ||
      rect.end.y < squareRect.start.y ||
      rect.start.y > squareRect.end.y
   );
}
export function isPointInsideSquare(point: Point, square: ISquare): boolean {
   // Translate the point and square to origin
   const translatedPoint: Point = {
      x: point.x - square.start.x,
      y: point.y - square.start.y,
   };

   // Rotate the point to align the square with the axes
   const angleInRadians = (-square.angle * Math.PI) / 180;
   const rotatedPoint: Point = {
      x:
         translatedPoint.x * Math.cos(angleInRadians) -
         translatedPoint.y * Math.sin(angleInRadians),
      y:
         translatedPoint.x * Math.sin(angleInRadians) +
         translatedPoint.y * Math.cos(angleInRadians),
   };

   // Check if the point is inside the unrotated square
   return (
      rotatedPoint.x >= 0 &&
      rotatedPoint.x <= square.width &&
      rotatedPoint.y >= 0 &&
      rotatedPoint.y <= square.height
   );
}
export function isPointInsidePolygon(
   point: Point,
   polygonPoints: Point[]
): boolean {
   // A large number for the ray's end point
   const INF = 10000;

   const extreme: Point = { x: INF, y: point.y };

   // Count intersections of the above line with sides of polygon
   let count = 0;
   let i = 0;
   do {
      const next = (i + 1) % polygonPoints.length;

      // Check if the line segment from 'point' to 'extreme' intersects
      // with the line segment from 'polygonPoints[i]' to 'polygonPoints[next]'
      if (
         doLineSegmentsIntersect(
            polygonPoints[i],
            polygonPoints[next],
            point,
            extreme
         )
      ) {
         // If the point 'point' is colinear with line segment 'i-next',
         // then check if it lies on segment. If it lies, return true, otherwise false
         if (orientation(polygonPoints[i], point, polygonPoints[next]) === 0) {
            return onSegment(polygonPoints[i], point, polygonPoints[next]);
         }
         count++;
      }
      i = next;
   } while (i !== 0);

   // Return true if count is odd, false otherwise
   return count % 2 === 1; // Same as (count & 1)
}
export function isRectTouchingPolygon(rect: Rect, polygon: IPolygon): boolean {
   // Check if any point of the polygon is inside the rectangle
   for (const point of polygon.points) {
      if (
         point.x >= rect.start.x &&
         point.x <= rect.end.x &&
         point.y >= rect.start.y &&
         point.y <= rect.end.y
      ) {
         return true;
      }
   }

   // Check if any of the rectangle's edges intersect with any of the polygon's edges
   const rectEdges = getRectangleEdges(rect);
   for (let i = 0; i < polygon.points.length; i++) {
      const start = polygon.points[i];
      const end = polygon.points[(i + 1) % polygon.points.length]; // Loop back to the first point
      for (const edge of rectEdges) {
         if (doLineSegmentsIntersect(edge.start, edge.end, start, end)) {
            return true;
         }
      }
   }

   // Check if the rectangle is completely inside the polygon (by checking one corner)
   if (isPointInsidePolygon(rect.start, polygon.points)) {
      return true;
   }

   return false;
}
export function rotatePolygons(
   polygons: IPolygon[],
   angle: number,
   center: Point
): IPolygon[] {
   return polygons.map((polygon) => ({
      ...polygon,
      points: polygon.pointsBeforeRotation!.map((point) =>
         rotatePoint(point, center, angle)
      ),
   }));
}
function getRectangleEdges(rect: Rect): { start: Point; end: Point }[] {
   return [
      { start: rect.start, end: { x: rect.end.x, y: rect.start.y } }, // Top edge
      { start: { x: rect.end.x, y: rect.start.y }, end: rect.end }, // Right edge
      { start: rect.end, end: { x: rect.start.x, y: rect.end.y } }, // Bottom edge
      { start: { x: rect.start.x, y: rect.end.y }, end: rect.start }, // Left edge
   ];
}
export function isRectTouchingCircle(
   rect: Rect,
   center: Point,
   radius: number
): boolean {
   // If the circle's center is inside the rectangle
   if (
      center.x >= rect.start.x &&
      center.x <= rect.end.x &&
      center.y >= rect.start.y &&
      center.y <= rect.end.y
   ) {
      return true;
   }

   // Find the closest point on the rectangle to the circle's center
   if (center.x <= rect.start.x && center.x + radius >= rect.start.x) {
      if (
         center.y >= rect.start.y - radius &&
         center.y <= rect.end.y + radius
      ) {
         return true;
      }
   }

   // For right edge of rectangle
   if (center.x >= rect.end.x && center.x - radius <= rect.end.x) {
      if (
         center.y >= rect.start.y - radius &&
         center.y <= rect.end.y + radius
      ) {
         return true;
      }
   }

   // For top edge of rectangle
   if (center.y <= rect.start.y && center.y + radius >= rect.start.y) {
      if (
         center.x >= rect.start.x - radius &&
         center.x <= rect.end.x + radius
      ) {
         return true;
      }
   }

   // For bottom edge of rectangle
   if (center.y >= rect.end.y && center.y - radius <= rect.end.y) {
      if (
         center.x >= rect.start.x - radius &&
         center.x <= rect.end.x + radius
      ) {
         return true;
      }
   }
   return false;
}
export function isPointInsideCircle(
   point: Point,
   radius: number,
   center: Point
): boolean {
   // Calculate the squared distance between the point and the circle's center
   const dx = point.x - center.x;
   const dy = point.y - center.y;
   const distanceSquared = dx * dx + dy * dy;

   // If the squared distance is less than or equal to the squared radius, the point is inside the circle
   return distanceSquared <= radius * radius;
}

export const getSeatsBySeatIds = (seatIds: string[], seats: ISeat[]) => {
   return seats.filter((seat) =>
      seatIds.includes(`${seat.rowId}-${seat.index}`)
   );
};

export function getRectAroundSeats(seats: ISeat[]) {
   if (seats.length === 0) {
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
   }

   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;
   const labelOffset = 12.5 / 2;
   for (const seat of seats) {
      const adjustedXMin = seat.position.x - seat.radius;
      const adjustedYMin = seat.position.y - seat.radius;
      const adjustedXMax = seat.position.x + seat.radius;
      const adjustedYMax = seat.position.y + seat.radius;

      if (adjustedXMin < minX) minX = adjustedXMin;
      if (adjustedYMin < minY) minY = adjustedYMin;
      if (adjustedXMax > maxX) maxX = adjustedXMax;
      if (adjustedYMax > maxY) maxY = adjustedYMax;
   }

   return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY },
   };
}

export const getRectCorners = (rect: CenteredRect) => {
   const { height, width } = rect;
   const halfWidth = width / 2;
   const halfHeight = height / 2;
   const angleInRadians = (rect.angle * Math.PI) / 180;

   // Calculate corners of the rectangle
   const corners = [
      { x: rect.center.x - halfWidth, y: rect.center.y - halfHeight },
      { x: rect.center.x + halfWidth, y: rect.center.y - halfHeight },
      { x: rect.center.x + halfWidth, y: rect.center.y + halfHeight },
      { x: rect.center.x - halfWidth, y: rect.center.y + halfHeight },
   ];
   return corners.map((corner) => {
      const dx = corner.x - rect.center.x;
      const dy = corner.y - rect.center.y;
      const rotatedX =
         rect.center.x +
         (dx * Math.cos(angleInRadians) - dy * Math.sin(angleInRadians));
      const rotatedY =
         rect.center.y +
         (dx * Math.sin(angleInRadians) + dy * Math.cos(angleInRadians));
      return { x: rotatedX, y: rotatedY };
   });
};

export function getRectAroundRowsToRender(
   rows: IRow[],
   rowGroups: IRowGroup[],
   allRows: IRow[],
   circles: ICircle[],
   recttables: IRectTable[],

   squares: ISquare[],
   polygons: IPolygon[]
) {
   if (
      rows.length === 0 &&
      circles.length === 0 &&
      recttables.length === 0 &&
      squares.length === 0 &&
      polygons.length === 0
   ) {
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
   }
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;
   const labelOffset = 12.5 / 2;
   for (const row of rows) {
      const seatPoints = Array(row.noOfSeats)
         .fill(0)
         .flatMap((seat, i) => {
            let myDistance = i * (row.radius * 2 + row.gapping) + row.radius;
            const point = findPointOnLineAtDistance(
               row.positionBeforeRotation?.start || row.start,
               row.positionBeforeRotation?.end || row.end,
               myDistance
            );

            const pointAfterCurve = skewAndCurvePoint(
               row.positionBeforeRotation?.start || row.start,
               row.positionBeforeRotation?.end || row.end,
               point,
               row.skew,
               row.curve
            );

            return [
               { x: pointAfterCurve.x, y: pointAfterCurve.y },
               { x: pointAfterCurve.x, y: pointAfterCurve.y },
            ];
         });
      const points = [...seatPoints];
      const labelPoints = getEndPointsOfLabels(row, rowGroups, allRows);

      for (const point of points) {
         // Adjust each point by the radius
         const adjustedXMin = point.x - row.radius;
         const adjustedYMin = point.y - row.radius;
         const adjustedXMax = point.x + row.radius;
         const adjustedYMax = point.y + row.radius;

         if (adjustedXMin < minX) minX = adjustedXMin;
         if (adjustedYMin < minY) minY = adjustedYMin;
         if (adjustedXMax > maxX) maxX = adjustedXMax;
         if (adjustedYMax > maxY) maxY = adjustedYMax;
      }
      for (const point of labelPoints) {
         // Adjust each point by the radius
         const adjustedXMin = point.x - labelOffset;
         const adjustedYMin = point.y - labelOffset;
         const adjustedXMax = point.x + labelOffset;
         const adjustedYMax = point.y + labelOffset;

         if (adjustedXMin < minX) minX = adjustedXMin;
         if (adjustedYMin < minY) minY = adjustedYMin;
         if (adjustedXMax > maxX) maxX = adjustedXMax;
         if (adjustedYMax > maxY) maxY = adjustedYMax;
      }
   }
   for (const circle of circles) {
      const adjustedXMin = circle.center.x - circle.radius;
      const adjustedYMin = circle.center.y - circle.radius;
      const adjustedXMax = circle.center.x + circle.radius;
      const adjustedYMax = circle.center.y + circle.radius;

      if (adjustedXMin < minX) minX = adjustedXMin;
      if (adjustedYMin < minY) minY = adjustedYMin;
      if (adjustedXMax > maxX) maxX = adjustedXMax;
      if (adjustedYMax > maxY) maxY = adjustedYMax;
   }
   for (const recttable of recttables) {
      const { height, width } = rectTableToCenteredRect(recttable);
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const angleInRadians =
         (recttable.angle || recttable.angleBeforeRotation * Math.PI) / 180;

      // Calculate corners of the rectangle
      const corners = [
         {
            x: recttable.center.x - halfWidth,
            y: recttable.center.y - halfHeight,
         },
         {
            x: recttable.center.x + halfWidth,
            y: recttable.center.y - halfHeight,
         },
         {
            x: recttable.center.x + halfWidth,
            y: recttable.center.y + halfHeight,
         },
         {
            x: recttable.center.x - halfWidth,
            y: recttable.center.y + halfHeight,
         },
      ];

      // Rotate each corner and update bounding box
      for (const corner of corners) {
         const dx = corner.x - recttable.center.x;
         const dy = corner.y - recttable.center.y;
         const rotatedX =
            recttable.center.x +
            (dx * Math.cos(angleInRadians) - dy * Math.sin(angleInRadians));
         const rotatedY =
            recttable.center.y +
            (dx * Math.sin(angleInRadians) + dy * Math.cos(angleInRadians));

         if (rotatedX < minX) minX = rotatedX;
         if (rotatedX > maxX) maxX = rotatedX;
         if (rotatedY < minY) minY = rotatedY;
         if (rotatedY > maxY) maxY = rotatedY;
      }
   }

   const shapeMargin: number = 4;
   for (const square of squares) {
      const angleInRadians = (square.angle * Math.PI) / 180;

      // Calculate the corners of the square
      const corners = [
         { x: square.start.x, y: square.start.y },
         { x: square.start.x + square.width, y: square.start.y },
         {
            x: square.start.x + square.width,
            y: square.start.y + square.height,
         },
         { x: square.start.x, y: square.start.y + square.height },
      ];

      // Rotate each corner and update the bounding box
      for (const corner of corners) {
         const dx = corner.x - square.start.x;
         const dy = corner.y - square.start.y;
         const rotatedX =
            square.start.x +
            (dx * Math.cos(angleInRadians) - dy * Math.sin(angleInRadians));
         const rotatedY =
            square.start.y +
            (dx * Math.sin(angleInRadians) + dy * Math.cos(angleInRadians));

         if (rotatedX < minX) minX = rotatedX;
         if (rotatedX > maxX) maxX = rotatedX;
         if (rotatedY < minY) minY = rotatedY;
         if (rotatedY > maxY) maxY = rotatedY;
      }
   }
   for (const polygon of polygons) {
      for (const point of polygon.pointsBeforeRotation || polygon.points) {
         if (point.x - shapeMargin < minX) minX = point.x - shapeMargin;
         if (point.x + shapeMargin > maxX) maxX = point.x + shapeMargin;
         if (point.y - shapeMargin < minY) minY = point.y - shapeMargin;
         if (point.y + shapeMargin > maxY) maxY = point.y + shapeMargin;
      }
   }
   return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY },
   };
}

export function getPolygonBounds(polygon: IPolygon): {
   width: number;
   height: number;
} {
   let minX = Number.MAX_VALUE;
   let maxX = Number.MIN_VALUE;
   let minY = Number.MAX_VALUE;
   let maxY = Number.MIN_VALUE;

   // Loop through all points to find the extremes
   for (const point of polygon.points) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
   }

   // Calculate width and height
   const width = maxX - minX;
   const height = maxY - minY;

   return { width, height };
}

export function getSelectedRowsRect(
   rows: IRow[],
   circles: ICircle[],
   rects: CenteredRect[],
   squares: ISquare[],
   polygons: IPolygon[]
): {
   start: Point;
   end: Point;
} {
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const row of rows) {
      const startAndEndPoints = [
         row.positionBeforeRotation
            ? row.positionBeforeRotation.start
            : row.start,
         row.positionBeforeRotation ? row.positionBeforeRotation.end : row.end,
      ];

      for (const point of startAndEndPoints) {
         if (point.x < minX) minX = point.x;
         if (point.x > maxX) maxX = point.x;
         if (point.y < minY) minY = point.y;
         if (point.y > maxY) maxY = point.y;
      }
   }

   // Adding logic for circles
   for (const circle of circles) {
      const left = circle.center.x - circle.radius;
      const right = circle.center.x + circle.radius;
      const top = circle.center.y - circle.radius;
      const bottom = circle.center.y + circle.radius;

      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
   }
   for (const rect of rects) {
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const angleInRadians = (rect.angle * Math.PI) / 180;

      // Calculate corners of the rectangle
      const corners = [
         { x: rect.center.x - halfWidth, y: rect.center.y - halfHeight },
         { x: rect.center.x + halfWidth, y: rect.center.y - halfHeight },
         { x: rect.center.x + halfWidth, y: rect.center.y + halfHeight },
         { x: rect.center.x - halfWidth, y: rect.center.y + halfHeight },
      ];

      // Rotate each corner and update bounding box
      for (const corner of corners) {
         const dx = corner.x - rect.center.x;
         const dy = corner.y - rect.center.y;
         const rotatedX =
            rect.center.x +
            (dx * Math.cos(angleInRadians) - dy * Math.sin(angleInRadians));
         const rotatedY =
            rect.center.y +
            (dx * Math.sin(angleInRadians) + dy * Math.cos(angleInRadians));

         if (rotatedX < minX) minX = rotatedX;
         if (rotatedX > maxX) maxX = rotatedX;
         if (rotatedY < minY) minY = rotatedY;
         if (rotatedY > maxY) maxY = rotatedY;
      }
   }
   for (const square of squares) {
      const angleInRadians = (square.angle * Math.PI) / 180;

      // Calculate the corners of the square
      const corners = [
         {
            x: square.start.x,
            y: square.start.y,
         },
         {
            x: square.start.x + square.width,
            y: square.start.y,
         },
         {
            x: square.start.x + square.width,
            y: square.start.y + square.height,
         },
         {
            x: square.start.x,
            y: square.start.y + square.height,
         },
      ];

      // Rotate each corner and update the bounding box
      for (const corner of corners) {
         const dx = corner.x - square.start.x;
         const dy = corner.y - square.start.y;
         const rotatedX =
            square.start.x +
            (dx * Math.cos(angleInRadians) - dy * Math.sin(angleInRadians));
         const rotatedY =
            square.start.y +
            (dx * Math.sin(angleInRadians) + dy * Math.cos(angleInRadians));

         if (rotatedX < minX) minX = rotatedX;
         if (rotatedX > maxX) maxX = rotatedX;
         if (rotatedY < minY) minY = rotatedY;
         if (rotatedY > maxY) maxY = rotatedY;
      }
   }
   const shapeMargin = 0;
   for (const polygon of polygons) {
      for (const point of polygon.pointsBeforeRotation || polygon.points) {
         if (point.x - shapeMargin < minX) minX = point.x - shapeMargin;
         if (point.x + shapeMargin > maxX) maxX = point.x + shapeMargin;
         if (point.y - shapeMargin < minY) minY = point.y - shapeMargin;
         if (point.y + shapeMargin > maxY) maxY = point.y + shapeMargin;
      }
   }
   return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY },
   };
}
export function rectTableToCenteredRect(table: IRectTable): CenteredRect {
   return {
      center: table.center,
      height:
         table.height * rectTableScale +
         ((defaultSeatRadius + 2) * 2 + gapInRectTableAndSeats) * 2,
      width:
         table.width * rectTableScale +
         ((defaultSeatRadius + 2) * 2 + gapInRectTableAndSeats) * 2,
      angle: table.angle,
   };
}
export function getPolygonBoundingBox(polygon: IPolygon): {
   width: number;
   height: number;
} {
   let minX = Infinity;
   let maxX = -Infinity;
   let minY = Infinity;
   let maxY = -Infinity;

   for (const point of polygon.points) {
      if (point.x < minX) {
         minX = point.x;
      }
      if (point.x > maxX) {
         maxX = point.x;
      }
      if (point.y < minY) {
         minY = point.y;
      }
      if (point.y > maxY) {
         maxY = point.y;
      }
   }

   return {
      width: maxX - minX,
      height: maxY - minY,
   };
}

function rotateSquare(square: ISquare, angle: number, center: Point): ISquare {
   // Calculate the square's corners
   const topLeft = square.startBeforeRotation as Point;
   const topRight = { x: topLeft.x + square.width, y: topLeft.y };
   const bottomLeft = { x: topLeft.x, y: topLeft.y + square.height };
   const bottomRight = {
      x: topLeft.x + square.width,
      y: topLeft.y + square.height,
   };

   // Rotate each corner
   const newTopLeft = rotatePoint(topLeft, center, angle);
   const newTopRight = rotatePoint(topRight, center, angle);
   const newBottomLeft = rotatePoint(bottomLeft, center, angle);
   const newBottomRight = rotatePoint(bottomRight, center, angle);

   // Find new top left after rotati n
   const minX = Math.min(
      newTopLeft.x,
      newTopRight.x,
      newBottomLeft.x,
      newBottomRight.x
   );
   const minY = Math.min(
      newTopLeft.y,
      newTopRight.y,
      newBottomLeft.y,
      newBottomRight.y
   );

   // Construct new square - assuming square height and width remains the same after rotation
   return {
      ...square,
      // start: newTopLeft,

      angle: square.angleBeforeRotation + angle, // Keeping track of new angle if needed
   };
}
export function rotateSquares(
   squares: ISquare[],
   angle: number,
   centerOfRotation: Point
): ISquare[] {
   return squares.map((square) =>
      rotateSquare(square, angle, centerOfRotation)
   );
}
export function roundToNearest(value: number, roundTo: number): number {
   return Math.round(value / roundTo) * roundTo;
}

export function getSelectionLinesAroundRect(
   p1: Point,
   p2: Point,
   totalHeight: number,
   totalWidth: number
) {
   const line3 = {
      p1: { x: p1.x, y: p1.y },
      p2: { x: p1.x, y: -totalHeight },
   };
   const line4 = {
      p1: { x: p2.x, y: p1.y },
      p2: { x: p2.x, y: -totalHeight },
   };
   const line5 = {
      p1: { x: p1.x, y: p2.y },
      p2: { x: p1.x, y: totalHeight * 2 },
   };
   const line6 = {
      p1: { x: p2.x, y: p2.y },
      p2: { x: p2.x, y: totalHeight * 2 },
   };
   const line1 = {
      p1: { y: p1.y + (p2.y - p1.y) / 2, x: p1.x },
      p2: { y: p1.y + (p2.y - p1.y) / 2, x: -totalWidth },
   };
   // const line3 = {
   //    p1: { x: p1.x + (p2.x - p1.x) / 2, y: p2.y },
   //    p2: { x: p1.x + (p2.x - p1.x) / 2, y: totalHeight },
   // };
   const line2 = {
      p1: { y: p1.y + (p2.y - p1.y) / 2, x: p2.x },
      p2: { y: p1.y + (p2.y - p1.y) / 2, x: totalWidth * 2 },
   };
   return [line1, line2, line3, line4, line5, line6];
}
export function rotatePoint(point: Point, center: Point, angle: number): Point {
   // Translate the point so that the center is at the origin
   const angleInRadians = (Math.PI * angle) / 180;
   const translatedX = point.x - center.x;
   const translatedY = point.y - center.y;

   // Rotate the translated point
   const rotatedX =
      translatedX * Math.cos(angleInRadians) -
      translatedY * Math.sin(angleInRadians);
   const rotatedY =
      translatedX * Math.sin(angleInRadians) +
      translatedY * Math.cos(angleInRadians);

   // Translate the point back
   return {
      x: rotatedX + center.x,
      y: rotatedY + center.y,
   };
}
export function tableToCircle(table: IRoundTable): ICircle {
   return {
      center: table.centerBeforeRotation || table.center,
      radius: getRoundTableRadius(table).enclosingRadius,
   };
}
export function getBoundingRectOfCircles(circles: ICircle[]): {
   start: Point;
   end: Point;
} {
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const circle of circles) {
      if (circle.center.x - circle.radius < minX)
         minX = circle.center.x - circle.radius;
      if (circle.center.y - circle.radius < minY)
         minY = circle.center.y - circle.radius;
      if (circle.center.x + circle.radius > maxX)
         maxX = circle.center.x + circle.radius;
      if (circle.center.y + circle.radius > maxY)
         maxY = circle.center.y + circle.radius;
   }

   return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY },
   };
}

export function rotateCircles(
   circles: ICircle[],
   angleInDegrees: number,
   customCenter: Point
): ICircle[] {
   return circles.map((circle) => {
      const newCenter = rotatePoint(
         circle.center,
         customCenter,
         angleInDegrees
      );
      return {
         ...circle,
         center: newCenter,
      };
   });
}
export function isPointInRotatedRect(
   point: Point,
   rect: CenteredRect
): boolean {
   // Step 1: Translate the system
   const translatedX = point.x - rect.center.x;
   const translatedY = point.y - rect.center.y;

   // Step 2: Rotate the point
   const angleInRadians = (-rect.angle * Math.PI) / 180;
   const rotatedX =
      translatedX * Math.cos(angleInRadians) -
      translatedY * Math.sin(angleInRadians);
   const rotatedY =
      translatedX * Math.sin(angleInRadians) +
      translatedY * Math.cos(angleInRadians);

   // Step 3: Check if the point is inside the axis-aligned rectangle
   return (
      Math.abs(rotatedX) <= rect.width / 2 &&
      Math.abs(rotatedY) <= rect.height / 2
   );
}

export const rotateRectTables = (
   tables: IRectTable[],
   angle: number,
   customCenter: Point
) => {
   return tables.map((table) => {
      const newAngle = angle;
      const newCenter = rotatePoint(
         table.centerBeforeRotation || table.center,
         customCenter,
         newAngle
      );
      return {
         ...table,
         center: newCenter,
         angle: table.angleBeforeRotation + newAngle,
      };
   });
};
export const getNoOfNonDeletedSeats = (object: IObjectWithSeats) => {
   return (
      object.seats.length - object.seats.filter((seat) => seat.deleted).length
   );
};

export const getNoOfNonDeletedSeatsOfRectTable = (table: IRectTable) => {
   return {
      top:
         table.seatsTop -
         table.seats.filter((seat) => seat.deleted && seat.location === "top")
            .length,
      left:
         table.seatsLeft -
         table.seats.filter((seat) => seat.deleted && seat.location === "left")
            .length,
      right:
         table.seatsRight -
         table.seats.filter((seat) => seat.deleted && seat.location === "right")
            .length,
      bottom:
         table.seatsBottom -
         table.seats.filter(
            (seat) => seat.deleted && seat.location === "bottom"
         ).length,
   };
};

export const getRotatedStartPoint = (
   table: IRectTable,
   angle: number
): Point => {
   const { width, height, center } = table;
   const pixelWidth = width * rectTableScale;
   const pixelHeight = height * rectTableScale;

   // Vector from center to top-left corner.
   const dx = -pixelWidth / 2;
   const dy = -pixelHeight / 2;

   // Rotate this vector by the angle.
   const radian = (angle * Math.PI) / 180; // Convert angle to radians
   const dxRotated = dx * Math.cos(radian) - dy * Math.sin(radian);
   const dyRotated = dx * Math.sin(radian) + dy * Math.cos(radian);

   // Add the rotated vector to the table's center.
   return {
      x: center.x + dxRotated,
      y: center.y + dyRotated,
   };
};
export const rotateCenteredRects = (
   rects: CenteredRect[],
   angleInDegrees: number,
   customCenter: Point
) => {
   return rects.map((rect) => {
      const newCenter = rotatePoint(rect.center, customCenter, angleInDegrees);
      return {
         ...rect,
         center: newCenter,

         angle: (rect.angle + angleInDegrees) % 360,
      };
   });
};

export const rotateRoundTables = (
   tables: IRoundTable[],
   angleInDegrees: number,
   customCenter: Point
): IRoundTable[] => {
   const circles: ICircle[] = tables.map((table) => ({
      center: table.centerBeforeRotation as Point,
      radius: getRoundTableRadius(table).enclosingRadius,
   }));
   const newCircles = rotateCircles(circles, angleInDegrees, customCenter);
   return tables.map((table, i) => ({
      ...table,
      center: newCircles[i].center,
      angle: (table.angleBeforeRotation + angleInDegrees) % 360,
   }));
};

export function rotateSelectionRect(
   topLeft: Point,
   bottomRight: Point,
   angle: number
): { start: Point; end: Point } {
   const centerX = topLeft.x + (bottomRight.x - topLeft.x) / 2;
   const centerY = bottomRight.y + (bottomRight.y - topLeft.y) / 2;
   const center = { x: centerX, y: centerY };
   return {
      start: rotatePoint(topLeft, center, angle),
      end: rotatePoint(bottomRight, center, angle),
   };
}

export function getCenterOfRows(rows: IRow[]): Point {
   // Calculate the common center of all the rows
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const row of rows) {
      minX = Math.min(minX, row.start.x, row.end.x);
      minY = Math.min(minY, row.start.y, row.end.y);
      maxX = Math.max(maxX, row.start.x, row.end.x);
      maxY = Math.max(maxY, row.start.y, row.end.y);
   }

   // Center of the bounding rectangle
   const center: Point = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

   // Rotate each row around the common center
   return center;
}
export function rotateRows(
   rows: IRow[],
   angles: number[],
   absolute = true,
   customCenter?: Point
): IRow[] {
   // Calculate the bounding box of all the rows
   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const row of rows) {
      minX = Math.min(minX, row.start.x, row.end.x);
      minY = Math.min(minY, row.start.y, row.end.y);
      maxX = Math.max(maxX, row.start.x, row.end.x);
      maxY = Math.max(maxY, row.start.y, row.end.y);
   }

   // Center of the bounding rectangle
   const center: Point = customCenter || {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
   };

   // Rotate each row around the center of the bounding rectangle
   return rows.map((row, i) => {
      const currentAngle = absolute ? findLineRotation(row.start, row.end) : 0;
      const myAngle = angles[i];
      return {
         ...row,
         start: rotatePoint(row.start, center, myAngle - currentAngle),
         end: rotatePoint(row.end, center, myAngle - currentAngle),
      };
   });
}

type ILine = [Point, Point];
export function getCenterOfRow(row: IRow): Point {
   return findPointOnLineAtDistance(
      row.start,
      row.end,
      getDistance(row.start, row.end) / 2
   );
}

function getDistanceFromPointToLine(point: Point, line: IRow): number {
   const A = line.end.y - line.start.y;
   const B = line.start.x - line.end.x;
   const C = A * line.start.x + B * line.start.y;

   return Math.abs(A * point.x + B * point.y - C) / Math.sqrt(A * A + B * B);
}

function findLineSlope(start: Point, end: Point): number {
   return (end.y - start.y) / (end.x - start.x);
}
export function getLineEquation(
   p1: Point,
   p2: Point
): { a: number; b: number; c: number } {
   if (p1.x === p2.x) {
      // Vertical line
      return { a: 1, b: 0, c: -p1.x };
   }

   const m = (p2.y - p1.y) / (p2.x - p1.x); // Slope of the line

   // Convert y - y1 = m(x - x1) to general form: ax + by + c = 0
   // Multiplying everything by (x2 - x1)
   const a = m;
   const b = -1;
   const c = p1.y - m * p1.x;

   return { a, b, c };
}
export function distanceBetweenParallelLines(
   line1: LineEquation,
   line2: LineEquation
): number {
   // Assuming lines are parallel, hence we only use components from line1 for the denominator.
   const denominator = Math.sqrt(line1.a * line1.a + line1.b * line1.b);
   return Math.abs(line2.c - line1.c) / denominator;
}

export function intersectionWithPerpendicular(
   line: LineEquation,
   point: Point
): Point {
   if (line.a === 0) {
      // line parallel to x-axis
      return { x: point.x, y: -line.c / line.b };
   } else if (line.b === 0) {
      // vertical line
      return { x: -line.c / line.a, y: point.y };
   }
   const perpendicularSlope = -1 / line.a;
   const c = point.y - perpendicularSlope * point.x;

   const x = (c - line.c) / (line.a + 1 / line.a);
   const y = perpendicularSlope * x + c;

   return { x, y };
}

export function getDistanceBetweenTwoRows(row1: IRow, row2: IRow) {
   return distanceBetweenParallelLines(
      getLineEquation(row1.start, row1.end),
      getLineEquation(row2.start, row2.end)
   );
}
function intercept(line: LineEquation): number {
   if (line.b === 0) {
      // Vertical line
      return -line.c / line.a;
   } else {
      // Non-vertical line
      return -line.c / line.b;
   }
}

export function getEquallySpacedPointsOnCircle(
   center: Point,
   radius: number,
   n: number,
   angleOffset: number
): Point[] {
   const points: Point[] = [];
   const anglePerPoint = (2 * Math.PI) / n; // Angle between each point in radians

   for (let i = 0; i < n; i++) {
      const theta = i * anglePerPoint - Math.PI / 2; // Adjusted here by subtracting PI/2 to start at the top

      const x = center.x + radius * Math.cos(theta);
      const y = center.y + radius * Math.sin(theta);

      points.push({ x, y });
   }

   return points.map((p) => rotatePoint(p, center, angleOffset));
}

export function roundEndPoints(row: IRow): IRow {
   return {
      ...row,
      start: { x: +row.start.x.toFixed(10), y: +row.start.y.toFixed(10) },
      end: { x: +row.end.x.toFixed(10), y: +row.end.y.toFixed(10) },
   };
}
export function rotateToNearest(row: IRow, angleInDegrees: number): IRow {
   // Calculate current angle
   const currentAngleRadians = Math.atan2(
      row.end.y - row.start.y,
      row.end.x - row.start.x
   );
   const currentAngleDegrees = (currentAngleRadians * 180) / Math.PI;

   // Calculate nearest multiple of angleInDegrees
   const nearestMultiple =
      Math.round(currentAngleDegrees / angleInDegrees) * angleInDegrees;

   // Determine difference
   const difference = nearestMultiple - currentAngleDegrees;

   // Rotate endPoint by the difference around the startPoint
   const rotatedEnd = rotatePoint(row.end, row.start, difference);

   return {
      ...row,
      start: row.start,
      end: rotatedEnd,
   };
}

export function sortParalellRows(rows: IRow[]): IRow[] {
   const res = rows
      .map(roundEndPoints)
      .sort(
         (a, b) =>
            intercept(getLineEquation(a.start, a.end)) -
            intercept(getLineEquation(b.start, b.end))
      );
   if (rows.every((x) => x.angle >= 90 && x.angle <= 270)) {
      return res.reverse();
   } else return res;
}
export const getRoundTableRadius = (table: IRoundTable) => {
   const tableRadius =
      table.noOfSeats <= 5 ? 14 : 14 + (table.noOfSeats - 5) * 4.5;
   return {
      tableRadius,
      enclosingRadius: tableRadius + 7 + 20 + 2,
      seatsCircleRadius: tableRadius + 7 + 10,
   };
};
export function getEnclosingRectangle(circles: ICircle[]): Rect {
   if (circles.length === 0) {
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
   }

   let minX = Infinity;
   let minY = Infinity;
   let maxX = -Infinity;
   let maxY = -Infinity;

   for (const circle of circles) {
      const leftX = circle.center.x - circle.radius;
      const rightX = circle.center.x + circle.radius;
      const topY = circle.center.y - circle.radius;
      const bottomY = circle.center.y + circle.radius;

      if (leftX < minX) minX = leftX;
      if (rightX > maxX) maxX = rightX;
      if (topY < minY) minY = topY;
      if (bottomY > maxY) maxY = bottomY;
   }

   return {
      start: { x: minX, y: minY },
      end: { x: maxX, y: maxY },
   };
}

export function getAngleBetweenLines(line1: ILine, line2: ILine): number {
   // Calculate the direction vectors for the lines
   const v1 = { x: line1[1].x - line1[0].x, y: line1[1].y - line1[0].y };
   const v2 = { x: line2[1].x - line2[0].x, y: line2[1].y - line2[0].y };

   // Calculate the dot product of the direction vectors
   const dotProduct = v1.x * v2.x + v1.y * v2.y;

   // Calculate the magnitudes of the direction vectors
   const magnitudeV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
   const magnitudeV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

   // Calculate the cosine and sine of the angle
   const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
   const sinTheta = (v1.x * v2.y - v1.y * v2.x) / (magnitudeV1 * magnitudeV2);

   // Calculate the angle in radians, taking the sign of the sine into account
   const angleInRadians = Math.acos(cosTheta);
   const signedAngleInRadians =
      sinTheta < 0 ? 2 * Math.PI - angleInRadians : angleInRadians;

   // Convert the angle to degrees
   const angleInDegrees = (signedAngleInRadians * 180) / Math.PI;

   return angleInDegrees;
}

type Point = { x: number; y: number };

export function curvePoint(
   startPoint: Point,
   endPoint: Point,
   originalPoint: Point,
   curveValue: number
): Point {
   // Find the center of the line
   const centerX = (startPoint.x + endPoint.x) / 2;
   const centerY = (startPoint.y + endPoint.y) / 2;

   // Calculate the direction of the curve
   const angleOfLine = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x
   );
   const angleOfCurve = angleOfLine + Math.PI / 2;

   // Find the point on the line that we're curving at the center
   const curveCenter = {
      x: centerX + curveValue * Math.cos(angleOfCurve),
      y: centerY + curveValue * Math.sin(angleOfCurve),
   };

   // Find the ratio of the distance from the start to the original point
   // to the total length of the original line
   const originalLength = Math.sqrt(
      (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2
   );
   const originalDistance = Math.sqrt(
      (originalPoint.x - startPoint.x) ** 2 +
         (originalPoint.y - startPoint.y) ** 2
   );
   const t = originalDistance / originalLength;

   // Use quadratic Bezier curve formula to find the new point
   const newPoint = {
      x:
         (1 - t) ** 2 * startPoint.x +
         2 * (1 - t) * t * curveCenter.x +
         t ** 2 * endPoint.x,
      y:
         (1 - t) ** 2 * startPoint.y +
         2 * (1 - t) * t * curveCenter.y +
         t ** 2 * endPoint.y,
   };

   return newPoint;

   // Find the center of the line
}
export function skewEndPoints(
   startPoint: Point,
   endPoint: Point,
   skewValue: number
): { start: Point; end: Point } {
   if (startPoint.x === endPoint.x) {
      // Line is parallel to the y-axis
      return {
         start: { x: startPoint.x - skewValue, y: startPoint.y },
         end: { x: endPoint.x + skewValue, y: endPoint.y },
      };
   } else if (startPoint.y === endPoint.y) {
      // Line is parallel to the x-axis
      return {
         start: { x: startPoint.x, y: startPoint.y + skewValue },
         end: { x: endPoint.x, y: endPoint.y - skewValue },
      };
   } else {
      // Line is tilted
      const angle = Math.atan2(
         endPoint.y - startPoint.y,
         endPoint.x - startPoint.x
      );
      const dx = skewValue * Math.sin(angle);
      const dy = skewValue * Math.cos(angle);
      return {
         start: { x: startPoint.x - dx, y: startPoint.y + dy },
         end: { x: endPoint.x + dx, y: endPoint.y - dy },
      };
   }
}

export function skewPoint(
   startPoint: Point,
   endPoint: Point,
   originalPoint: Point,
   skewValue: number
): Point {
   // Find the ratio of the distance from the start to the original point
   // to the total length of the original line
   const newEndPoints = skewEndPoints(startPoint, endPoint, skewValue);
   const newStartPoint = newEndPoints.start;
   const newEndPoint = newEndPoints.end;

   // Calculate t, the parameter that represents the position of the original point between the start and end points
   const t =
      ((originalPoint.x - startPoint.x) * (endPoint.x - startPoint.x) +
         (originalPoint.y - startPoint.y) * (endPoint.y - startPoint.y)) /
      ((endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2);

   // Calculate the skewed coordinates
   const skewedX = newStartPoint.x + t * (newEndPoint.x - newStartPoint.x);
   const skewedY = newStartPoint.y + t * (newEndPoint.y - newStartPoint.y);

   return { x: skewedX, y: skewedY };
}

export function findCurveTangents(
   startPoint: Point,
   endPoint: Point,
   curveValue: number
): { startAngle: number; endAngle: number } {
   // Find the center of the line (this is the control point for the curve)
   const centerX = (startPoint.x + endPoint.x) / 2;
   const centerY = (startPoint.y + endPoint.y) / 2;

   // Calculate the direction of the curve
   const angleOfLine = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x
   );
   const angleOfCurve = angleOfLine + Math.PI / 2;

   // Find the control point for the curve
   const controlPoint = {
      x: centerX + curveValue * Math.cos(angleOfCurve),
      y: centerY + curveValue * Math.sin(angleOfCurve),
   };

   // Calculate the angles of the tangents at the start and end points
   const startAngle = findLineRotation(startPoint, controlPoint);
   const endAngle = findLineRotation(controlPoint, endPoint);

   return { startAngle, endAngle };
}
export function skewAndCurvePoint(
   startPoint: Point,
   endPoint: Point,
   originalPoint: Point,
   skewValue: number,
   curveValue: number
): Point {
   // Apply the skew transformation to the line's start and end points
   const newEndPoints = skewEndPoints(startPoint, endPoint, skewValue);
   const skewedStartPoint = newEndPoints.start;
   const skewedEndPoint = newEndPoints.end;

   // Apply the skew transformation to the original point
   const skewedOriginalPoint = skewPoint(
      startPoint,
      endPoint,
      originalPoint,
      skewValue
   );

   // Apply the curve transformation to the skewed line and original point
   return curvePoint(
      skewedStartPoint,
      skewedEndPoint,
      skewedOriginalPoint,
      curveValue
   );
}
export function getAllRowGroups(rows: IRow[], rowGroups: IRowGroup[]) {
   return _.groupBy(rows, "groupId");
}

export function isClickOnObject(data: IVisualizerData, mouse: Point) {
   const { roundTables, rectTables, squares, polygons } = data;
   const clickedOnRoundTable = roundTables
      .map((table) => ({
         center: table.centerBeforeRotation || table.center,
         radius: getRoundTableRadius(table).enclosingRadius,
      }))
      .some((x) => isPointInsideCircle(mouse, x.radius, x.center));
   const clickedOnRectTable = rectTables.some((rectTable) => {
      const rect = getRectAroundSeats(rectTable.seats);
      return isPointInsideRect(rect.start, rect.end, mouse);
   });
   const clickedOnPolygon = polygons.some((poly) =>
      isPointInsidePolygon(mouse, poly.points)
   );
   const clickedOnRowSeat = data.rows
      .flatMap((row) => row.seats)
      .some((seat) =>
         isPointInsideCircle(mouse, defaultSeatRadius, seat.position)
      );
   return (
      clickedOnPolygon ||
      clickedOnRectTable ||
      clickedOnRoundTable ||
      clickedOnRowSeat
   );
}

export function getClickedObject(state: IVisualizerState, mouse: Point) {
   const { roundTables, rectTables, squares, polygons, rows } = state.data;

   const adjustedMouse = {
      x: mouse.x / state.currentZoom + state.viewboxOffset.x,
      y: mouse.y / state.currentZoom + state.viewboxOffset.y,
   };
   const seats = [...roundTables, ...rectTables, ...rows].flatMap(
      (obj) => obj.seats
   );
   const clickedPolygon = polygons.find((poly) =>
      isPointInsidePolygon(adjustedMouse, poly.points)
   );
   const clickedSquare = squares.find((square) =>
      isPointInsideSquare(adjustedMouse, square)
   );
   const clickedSeat = seats.find((seat) =>
      isPointInsideCircle(adjustedMouse, seat.radius, seat.position)
   );

   return clickedSquare || clickedPolygon || clickedSeat;
}
export const animate = () => {};

export const getViewboxForZoom = (
   zoom: number,
   point: Point,
   state: IVisualizerState
) => {
   const newWidth = state.svgWidth / zoom;
   const newHeight = state.svgHeight / zoom;
   let adjustedX = point.x / zoom + state.viewboxOffset.x;
   let adjustedY = point.y / zoom + state.viewboxOffset.y;

   let minX = adjustedX - newWidth / 2;
   let minY = adjustedY - newHeight / 2;
   return { x: minX, y: minY };
};
export const getOvalAroundSelectedSeats = (state: IVisualizerState) => {
   const allSeats = getAllSeats(state.data);
   const selectedSeats = allSeats.filter(
      (seat) => isObjectPurchased(state, seat) || isSeatBlocked(state, seat)
   );
   const allPoints = selectedSeats.map((seat) => seat.position);
   if (selectedSeats.length === 0) return;
   const baseRadius = selectedSeats[0].radius;
   const enlargedRadius = baseRadius * 3;

   const seatGroups = groupTouchingOrOverlappingPoints(
      allPoints,
      enlargedRadius
   );
   const svgCoords = getSvgRoundedRectsForGroups(seatGroups, enlargedRadius, 0);
   return svgCoords;
};

function arePointsTouchingOrOverlapping(
   p1: Point,
   p2: Point,
   radius: number
): boolean {
   // Calculate the distance between two points
   const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
   );
   // If the distance is less than or equal to two radii, the circles are touching or overlapping
   return distance <= 2 * radius;
}

function groupTouchingOrOverlappingPoints(
   points: Point[],
   radius: number
): Point[][] {
   const groups: Point[][] = [];
   const visited: boolean[] = new Array(points.length).fill(false);

   points.forEach((point, i) => {
      if (visited[i]) return; // Skip if already grouped

      // Create a new group starting with this point
      const group: Point[] = [point];
      visited[i] = true;

      // Check against all other points
      for (let j = i + 1; j < points.length; j++) {
         if (visited[j]) continue; // Skip if already grouped

         // If this point is touching or overlapping the current group, add it to the group
         if (
            group.some((gp) =>
               arePointsTouchingOrOverlapping(gp, points[j], radius)
            )
         ) {
            group.push(points[j]);
            visited[j] = true;
         }
      }

      // Add the new group to the list of groups
      groups.push(group);
   });

   return groups;
}
function getSvgRoundedRectsForGroups(
   groups: Point[][],
   radius: number,
   padding: number
) {
   return groups.map((group) => {
      let minX = Infinity,
         minY = Infinity,
         maxX = -Infinity,
         maxY = -Infinity;

      group.forEach((point) => {
         minX = Math.min(minX, point.x - radius - padding);
         minY = Math.min(minY, point.y - radius - padding);
         maxX = Math.max(maxX, point.x + radius + padding);
         maxY = Math.max(maxY, point.y + radius + padding);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      // For fully rounded ends, rx is half of the rectangle's width, and ry is half of the height.
      // If the rect is wider than it is tall, making it a full circle if width == height
      const rx = Math.min(width, height) / 2;
      const ry = rx; // This ensures the vertical sides are also fully rounded if it's a square.

      return { x: minX, y: minY, height, width, rx, ry, label: group.length };
      // Create the SVG rect element
   });
}

export function getRandomId() {
   return Math.random().toString();
}
