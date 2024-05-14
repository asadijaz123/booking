import { IVisualizerState } from "../contexts/VisualizerContext";
import { seatsLabelGenerator } from "./data";
import chroma from "chroma-js";
function generatePermutations(n: string[], r: number): string[] {
   // Helper function to generate all permutations for an array of characters
   function permute(
      arr: string[],
      start: number,
      result: string[] = []
   ): string[] {
      if (start === arr.length - 1) {
         result.push(arr.join(""));
         return result;
      }

      for (let i = start; i < arr.length; i++) {
         [arr[start], arr[i]] = [arr[i], arr[start]]; // Swap
         permute([...arr], start + 1, result); // Permute with the swapped array
         [arr[start], arr[i]] = [arr[i], arr[start]]; // Swap back to original order
      }

      return result;
   }

   // Generate all combinations of r items (with repetitions)
   function generateCombinations(
      arr: string[],
      r: number,
      start: number = 0,
      temp: string[] = [],
      result: string[][] = []
   ): string[][] {
      if (temp.length === r) {
         result.push([...temp]);
         return result;
      }

      for (let i = start; i < arr.length; i++) {
         temp.push(arr[i]);
         generateCombinations(arr, r, i, temp, result); // Note: passing 'i' instead of 'i + 1'
         temp.pop();
      }

      return result;
   }

   const combinations = generateCombinations(n, r);
   let finalPermutations: string[] = [];

   for (const combo of combinations) {
      finalPermutations = finalPermutations.concat(permute(combo, 0));
   }

   return finalPermutations;
}

export const getNextLabelTo = (label: string): string => {
   if (!Number.isNaN(+label)) {
      return (Number(label) + 1).toString();
   } else {
      const isLowerCase = label.toLowerCase() === label;
      const type: ISeatLabelType = isLowerCase
         ? "letters-small"
         : "letters-big";

      let allLabels: string[] =
         type === "letters-small" ? allSmallLetterLabels : allBigLetterLabels;
      const index = allLabels.indexOf(label);
      return allLabels[index + 1];
   }
};
export const pointsToPolygonString = (points: Point[]) => {
   return points.map((p) => `${p.x},${p.y}`).join(" ");
};

const smallLetters = "abcdefghijklmnopqrstuvwxyz";
const bigLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateAplhabetLabels = (base: string) =>
   [
      ...new Set(
         generatePermutations(["", "", ...base.split("")], 3).filter(Boolean)
      ),
   ].sort((a, b) => {
      if (a.length > b.length) {
         return 1;
      }
      if (a.length < b.length) {
         return -1;
      }
      return a.localeCompare(b);
   });

export const allBigLetterLabels = generateAplhabetLabels(bigLetters);
export const bigLetterLabelsObject = Object.fromEntries(
   allBigLetterLabels.map((x, i) => [x, i])
);
export const allSmallLetterLabels = generateAplhabetLabels(smallLetters);
export const smallLetterLabelsObject = Object.fromEntries(
   allSmallLetterLabels.map((x, i) => [x, i])
);

export const comparePoints = (p1: Point, p2: Point) =>
   p1.x === p2.x && p1.y === p2.y;

export function placeUndefinedAtIndices(
   original: string[],
   indices: number[]
): (string | undefined)[] {
   const result: (string | undefined)[] = new Array(original.length);
   let shift = 0;

   for (let i = 0; i < original.length; i++) {
      if (indices.includes(i)) {
         result[i] = undefined;
         shift++;
      } else {
         result[i] = original[i - shift];
      }
   }

   return result;
}

export function rgbaToHex(rgba: string): string {
   if (rgba.startsWith("#")) return rgba;
   // First, we need to extract the numeric values for red, green, blue, and alpha.
   const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/.exec(
      rgba
   );

   if (!result) {
      throw new Error("Invalid RGBA color value");
   }

   // Extract the matches into the respective RGB components.
   const [, r, g, b] = result;

   // Convert each component to a hexadecimal value.
   const toHex = (value: string) => {
      // Parse the string to an integer.
      const intValue = parseInt(value, 10);
      // Convert to a base-16 (hexadecimal) string and pad with zero if needed.
      return intValue.toString(16).padStart(2, "0");
   };

   // Convert and concatenate the RGB values to get the final hex code.
   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const getMostContrastingGray = (color: string): string => {
   let maxContrast = 0;
   let contrastingGray = "#808080"; // Default to a mid-gray if no better match is found

   // Iterate over a range of gray shades
   for (let i = 0; i <= 255; i++) {
      const gray = chroma(i, i, i); // Create a gray shade
      const contrast = chroma.contrast(color, gray);

      // Update if this gray has a higher contrast than the current max
      if (contrast > maxContrast) {
         maxContrast = contrast;
         contrastingGray = gray.hex();
      }
   }

   return contrastingGray;
};

export const calculateGeneralZoom = (
   svgHeight: number,
   svgWidth: number,
   planHeight: number,
   planWidth: number,
   currentZoomLevel = 1
): number => {
   const heightRatio = svgHeight / planHeight;
   const widthRatio = svgWidth / planWidth;
   const minRatio = Math.min(heightRatio, widthRatio);
   if (minRatio >= 1) return currentZoomLevel;
   else
      return calculateGeneralZoom(
         svgHeight * 2,
         svgWidth * 2,
         planHeight,
         planWidth,
         currentZoomLevel / 2
      );
};

type Dimensions = {
   width: number;
   height: number;
};

export function resizeContentToFit(
   container: Dimensions,
   content: Dimensions
): Dimensions {
   // Calculate the scale factor
   const scaleWidth = container.width / content.width;
   const scaleHeight = container.height / content.height;
   const scaleFactor = Math.min(scaleWidth, scaleHeight);

   // Apply the scale factor to get new dimensions
   const newWidth = content.width * scaleFactor;
   const newHeight = content.height * scaleFactor;

   // Return the new dimensions
   return { width: newWidth, height: newHeight };
}

export const correctViewbox = (state: IVisualizerState): IVisualizerState => {
   let finalX = state.viewboxOffset.x;
   let finalY = state.viewboxOffset.y;
   let maxX =
      state.svgWidth / state.generalZoom - state.svgWidth / state.currentZoom;
   let maxY =
      state.svgHeight / state.generalZoom - state.svgHeight / state.currentZoom;
   if (finalX < 0) finalX = 0;
   if (finalY < 0) finalY = 0;
   if (finalX > maxX) finalX = maxX;
   if (finalY > maxY) finalY = maxY;
   return {
      ...state,
      viewboxOffset: {
         x: finalX < 0 ? 0 : finalX,
         y: finalY < 0 ? 0 : finalY,
      },
   };
};

export const tryToSelectSeat = (
   state: IVisualizerState,
   object: ISeat | ISquare | IPolygon
): IVisualizerState => {
   const isObjectDisabled =
      state.filterCategoryId && state.filterCategoryId !== object.categoryId;
   if ((object as ISquare).type === "standing") {
      if (isObjectDisabled) {
         return { ...state, removeFilterDialog: state.mouse };
      }
   }
   return state;
};

export const getAllShapes = (state: IVisualizerState) => [
   ...state.data.polygons,
   ...state.data.squares,
];

export const getSeatId = (seat: ISeat) => seat.id;

export const getUserId = () =>
   JSON.parse(localStorage.getItem("user") as string)?.userId;
