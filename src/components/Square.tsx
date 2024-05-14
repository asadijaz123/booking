import { useEffect, useMemo, useRef, useState } from "react";
import { getMostContrastingGray } from "../utils/others";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { distabledSeatColor } from "../utils/data";
import Color from "color";
import { darkenColor } from "../utils/non-geom";

interface SquareProps {
   square: ISquare;
}

const Square: React.FC<SquareProps> = ({ square }) => {
   const center: Point = {
      x: square.start.x + square.width / 2,
      y: square.start.y + square.height / 2,
   };
   const labelTextRef = useRef<SVGTextElement | null>(null);
   const [labelWidth, setLabelWidth] = useState(0);
   const [labelHeight, setLabelHeight] = useState(0);
   const [state, dispatch] = useVisualizerContext();
   const disabled =
      state.filterCategoryId && state.filterCategoryId !== square.categoryId;
   const myBackgroundColor = useMemo(() => {
      if (square.type === "standing") {
         const myCategory = state.data.settings.allCategories.find(
            (x) => x.id === square.categoryId
         );
         let fill;
         if (
            state.filterCategoryId &&
            state.filterCategoryId === myCategory!.id
         ) {
            fill = myCategory?.color.background;
         } else if (!state.filterCategoryId) {
            fill = myCategory?.color.background;
         } else if (
            state.filterCategoryId &&
            state.filterCategoryId !== myCategory!.id
         ) {
            fill = distabledSeatColor;
         }

         if (state.visualizerOptions?.blocking) {
            const allBlocks = state.seatBlockingData.myGroups.flatMap(
               (group) => group.blocks
            );
            console.log(allBlocks, "all blocks");
            const isAnyTicketOfThisShapeBlocked = allBlocks.some(
               (block) => block.numberOfSeats && block.objectId === square.id
            );
            console.log(
               "is any ticket selected",
               isAnyTicketOfThisShapeBlocked
            );
            if (isAnyTicketOfThisShapeBlocked) {
               fill = darkenColor(myCategory?.color.background || "");
            }
         }
         return {
            stroke: "",
            fill: fill,
         };
      }
      return {
         stroke: square.colorType === "border" ? square.color : "",
         fill:
            square.colorType === "filled"
               ? square.color || "rgb(195, 195, 195)"
               : "transparent",
      };
   }, [
      square,
      state.data.settings.allCategories,
      state.filterCategoryId,
      state.seatBlockingData.myGroups,
      state.seatBlockingData.allGroups,
   ]);

   const labelColor = getMostContrastingGray(
      square.color || "rgb(195, 195, 195)"
   );
   useEffect(() => {
      const text = document.createElementNS(
         "http://www.w3.org/2000/svg",
         "text"
      );
      text.innerHTML = square.label;
      const bBox = labelTextRef.current?.getBBox();
      setLabelHeight((bBox?.height || 0) + 40);
      setLabelWidth((bBox?.width || 0) + 80);
   }, []);
   const isInHiddenCategory =
      state.visualizerOptions?.hiddenCategoires.includes(square.categoryId);

   //If Seat category is hidden
   if (isInHiddenCategory) {
      return null;
   }
   return (
      <g
         onClick={(e) => {
            e.stopPropagation();
            dispatch({ setState: { clickedObject: square } });
         }}
         onMouseDown={() => {}}
         onMouseMove={() => {
            if (!disabled) {
               dispatch({ setState: { hoveredObject: square } });
            }
         }}
         onMouseLeave={() => {
            if (!disabled) {
               dispatch({ setState: { hoveredObject: undefined } });
            }
         }}
      >
         <rect
            x={square.start.x}
            y={square.start.y}
            height={square.height}
            width={square.width}
            style={{
               fill: disabled
                  ? "rgba(221, 221, 221, 1)"
                  : myBackgroundColor.fill,
               stroke: myBackgroundColor.stroke,
               strokeWidth: 1.9,
            }}
            rx={square.rounded ? 50000 : 2}
            transform={`rotate(${square.angle}, ${center.x}, ${center.y})`}
         ></rect>

         {state.currentZoom === state.generalZoom && square.label && (
            <>
               {state.visualizerOptions?.showZoneLabels ? (
                  <>
                     <rect
                        rx={50}
                        ry={50}
                        x={center.x - labelWidth / 2}
                        y={center.y - labelHeight / 2}
                        height={labelHeight}
                        width={labelWidth}
                        style={{
                           filter:
                              "drop-shadow(0 19px 19px  rgba(0, 0, 0, 0.5)",
                           fill: disabled
                              ? "rgba(171, 171, 171, 1)"
                              : Color(myBackgroundColor.fill)
                                   .lighten(0.23)
                                   .hex(),
                        }}
                     ></rect>
                     <text
                        ref={labelTextRef}
                        x={center.x}
                        y={center.y}
                        textAnchor="middle"
                        alignmentBaseline="central"
                        dominantBaseline="central"
                        fontSize={45}
                        style={{
                           fill: "white",
                        }}
                     >
                        {square.label || "Test"}
                     </text>
                  </>
               ) : null}
            </>
         )}

         {/* <circle cx={center.x} cy={center.y} r={6} fill="green"></circle> */}
         {/* <circle
            cx={square.start.x}
            cy={square.start.y}
            r={6}
            fill="red"
         ></circle> */}
      </g>
   );
};

export default Square;
