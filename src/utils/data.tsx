import {
   allBigLetterLabels,
   allSmallLetterLabels,
   bigLetterLabelsObject,
   smallLetterLabelsObject,
} from "./others";
import { getRandomId } from "./utils";

export const toolToCursorTypeObject: {
   [k in number]: React.CSSProperties["cursor"];
} = {
   0: "crosshair",
   1: "crosshair",
   2: "crosshair",
};

export const indexToRotationDot: IRotationDot[] = [
   "top-left",
   "top-right",
   "bottom-left",
   "bottom-right",
];

export const rowLabelPositionOptions: ISelectOption<IRowLabelPosition>[] = [
   { text: "Left and right", value: "left-right" },
   { text: "Left ", value: "left" },
   { text: "Right", value: "right" },
   { text: "None", value: "none" },
];

export const getRotationDotPointFromSelectionRect: {
   [k in IRotationDot]: (rect: Rect) => Point;
} = {
   "top-right": (rect) => ({ x: rect.end.x, y: rect.start.y }),
   "top-left": (rect) => ({ x: rect.start.x, y: rect.start.y }),
   "bottom-left": (rect) => ({ x: rect.start.x, y: rect.end.y }),
   "bottom-right": (rect) => ({ x: rect.end.x, y: rect.end.y }),
};

export const seatsLabelTypeToText: { [k in ISeatLabelType]: string } = {
   "letters-big": "A,B,C,D...",
   "letters-small": "a,b,c,d...",
   "numbers-center": "5,3,1 ... 2,4,6",
   "numbers-even": "2,4,6,8...",
   "numbers-odd": "1,3,5,7...",
   "numbers-normal": "1,2,3,4...",
};
export const rowsLabelTypeToText: { [k in IRowLabelType]: string } = {
   "letters-big": "A,B,C,D...",
   "letters-small": "a,b,c,d...",
   "numbers-normal": "1,2,3,4...",
   None: "None",
};
export const rowsLabelTypeOptions: { text: string; value: IRowLabelType }[] =
   Object.entries(rowsLabelTypeToText).map(([k, v]) => ({
      text: v,
      value: k as IRowLabelType,
   }));
export const seatsLabelTypeOptions: { text: string; value: ISeatLabelType }[] =
   Object.entries(seatsLabelTypeToText).map(([k, v]) => ({
      text: v,
      value: k as ISeatLabelType,
   }));
export const seatTypeOptions: ISelectOption<ISeatType>[] = [
   { text: "Seat", value: "seat" },
   { text: "Bench", value: "bench" },
   { text: "Chair", value: "chair" },
   { text: "Stool", value: "stool" },
];
export const seatAvailabiltyOptions: ISelectOption<ISeatAvailable>[] = [
   { text: "Available", value: "available" },
   { text: "Not Available", value: "not-available" },
];
export const shapeTypeOptions: ISelectOption<ShapeType>[] = [
   { text: "Normal Shape", value: "normal" },
   { text: "Seating Zone", value: "seating" },
   { text: "Standing Zone", value: "standing" },
];
export const seatsLabelGenerator: {
   [k in ISeatLabelType | IRowLabelType]: (
      totalSeats: number,
      startingAt?: string
   ) => string[];
} = {
   None: (totalSeats: number, startingAt?: string) => {
      return [];
   },
   "letters-big": (totalSeats: number, startingAt?: string) => {
      const startingIndex = bigLetterLabelsObject[startingAt || ""] || 0;
      return allBigLetterLabels.slice(
         startingIndex,
         startingIndex + totalSeats
      );
   },

   "letters-small": (totalSeats: number, startingAt?: string) => {
      const startingIndex = smallLetterLabelsObject[startingAt || ""] || 0;
      return allSmallLetterLabels.slice(
         startingIndex,
         startingIndex + totalSeats
      );
      // First, add the single letters.
   },
   "numbers-center": (totalSeats: number, startingAt?: string) => {
      const labels: string[] = new Array(totalSeats).fill("");
      let counter = 1;
      const isEven = totalSeats % 2 === 0;

      for (let i = Math.floor((totalSeats - 1) / 2); i >= 0; i--) {
         // Fill the left side
         labels[i] = counter.toString();
         counter++;

         // Fill the right side
         const rightIndex = totalSeats - i - 1;
         if (rightIndex !== i || isEven) {
            labels[rightIndex] = counter.toString();
            counter++;
         }
      }

      if (startingAt && !isNaN(Number(startingAt))) {
         return labels
            .map((x) => Number(startingAt) - 1 + Number(x))
            .map((x) => x.toString());
      }
      return labels;
   },

   "numbers-even": (totalSeats: number, startingAt?: string) => {
      const labels: string[] = [];

      for (let i = 1; i <= totalSeats; i++) {
         labels.push((i * 2).toString()); // Add only even numbers
      }
      if (
         startingAt &&
         !isNaN(Number(startingAt)) &&
         Number(startingAt) % 2 === 0
      ) {
         return labels
            .map((x) => Number(startingAt) - 2 + Number(x))
            .map((x) => x.toString());
      }
      return labels;
   },

   "numbers-odd": (totalSeats: number, startingAt?: string) => {
      const labels: string[] = [];

      for (let i = 0; i < totalSeats; i++) {
         labels.push((i * 2 + 1).toString()); // Add only odd numbers
      }
      if (
         startingAt &&
         !isNaN(Number(startingAt)) &&
         Number(startingAt) % 2 !== 0
      ) {
         return labels
            .map((x) => Number(startingAt) - 1 + Number(x))
            .map((x) => x.toString());
      }
      return labels;
   },

   "numbers-normal": (totalSeats: number, startingAt?: string) => {
      const labels: string[] = [];

      for (let i = 1; i <= totalSeats; i++) {
         labels.push(i.toString()); // Add all numbers from 1 to totalSeats
      }
      if (startingAt && !isNaN(Number(startingAt))) {
         return labels
            .map((x) => Number(startingAt) - 1 + Number(x))
            .map((x) => x.toString());
      }
      return labels;
   },
};

export const rectTableScale = 28;
export const defaultSeatRadius = 10;
export const minRectTableGap = 6;
export const gapInRectTableAndSeats = 2;

export const distabledSeatColor = "rgba(221, 221, 221, 1)";
export const miniMapOriginalDimensions = { width: 200, height: 100 };
export const zoomAnimationDuration = 250;

export const ticketOptions = [
   {
      name: "Adults",
      price: 10,
      id: "ticket1",
   },
   {
      name: "Kids",
      price: 5,
      id: "ticket2",
   },
];

export const defaultMainColor = "#6777CC";

export const standardZooms = [0.0625, 0.125, 0.25, 0.5, 1];
