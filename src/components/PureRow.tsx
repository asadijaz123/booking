import { memo } from "react";
import {
   findPointOnLineAtDistance,
   generateSvgPathForCurvedLine,
   getCenterOfRow,
   skewAndCurvePoint,
} from "../utils/utils";
import _, { filter } from "lodash";
import classNames from "classnames";
import { placeUndefinedAtIndices } from "../utils/others";
import { icons } from "../helpers/icons";
import disablityIcon from "../assets/images/disable-icon.png";
import { distabledSeatColor } from "../utils/data";
import checkImage from "../assets/images/check.svg";
import circleImage from "../assets/images/circle.png";
import {
   calcSeatFillColor,
   getSeatBlockGroup,
   isObjectPurchased,
   isSeatSelectedByMe,
} from "../utils/non-geom";
import Color from "color";
import { useVisualizerContext } from "../contexts/VisualizerContext";

interface PureRowProps {
   labelPosition: IRowLabelPosition;
   leftLabelPos: Point;
   rightLabelPos: Point;
   lessNoOfSeats?: boolean;
   noOfSeats: number;
   label: string;
   radius: number;
   start: Point;
   end: Point;
   gapping: number;
   skew: number;
   curve: number;
   offsetForLessNoOfSeats: number;
   mySeats: ISeat[];
   id: string;
   tool: number;
   selectingSeats?: boolean;
   selected?: boolean;
   pathD: string;
   angle: number;
   onlySelected: boolean;
   onRowSizeChange: () => void;
   dotPoints: Rect;
   center: Point;
   allCategories: ICategory[];
   categoryId?: string;
   filterCategoryId?: string;
}

const PureRow: React.FC<PureRowProps> = ({
   labelPosition,
   leftLabelPos,
   rightLabelPos,
   noOfSeats,
   lessNoOfSeats,
   label,
   radius,
   gapping,
   start,
   end,
   skew,
   curve,
   offsetForLessNoOfSeats,
   mySeats,
   tool,
   selectingSeats,
   id,
   selected,
   pathD,
   angle,
   onlySelected,
   onRowSizeChange,
   dotPoints,
   center,
   allCategories,
   categoryId,
   filterCategoryId,
}) => {
   const [state, dispatch] = useVisualizerContext();
   const addRowRectSize = 8;

   const skewedStart = skewAndCurvePoint(start, end, start, skew, curve);
   const skewedEnd = skewAndCurvePoint(start, end, end, skew, curve);
   const recentlyDeleted = mySeats.filter(
      (seat) => seat.recentlyDeleted
   ).length;
   const allDeleted = mySeats.filter((seat) => seat.deleted).length;
   const seatLabelsToBeIgnored = allDeleted - recentlyDeleted;

   const indeciesOfSeatsToBeIgnored = mySeats.reduce(
      (ac, a, i) => (a.deleted && !a.recentlyDeleted ? [...ac, a.index] : ac),
      [] as number[]
   );
   // const myNewSeatLabels: (string | undefined)[] = placeUndefinedAtIndices(
   //    seatLabels,
   //    indeciesOfSeatsToBeIgnored
   // );
   const rowCategory = allCategories.find(
      (category) => category.id === categoryId
   );
   return (
      <>
         <g>
            {/* {(labelPosition === "left" || labelPosition === "left-right") && (
               <text
                  className="svg-text font-raleway"
                  textAnchor="middle"
                  alignmentBaseline="central"
                  dominantBaseline="central"
                  x={leftLabelPos.x}
                  y={leftLabelPos.y}
                  // dy="0.3em"
                  transform={`rotate(${0}, ${leftLabelPos.x}, ${
                     leftLabelPos.y
                  })`}
                  fontSize={9}
                  fontWeight={200}
               >
                  {label}
               </text>
            )} */}
            {/* {
               <path
                  strokeWidth={0.5}
                  d={pathD}
                  className="stroke-blue-main"
                  fill="none"
               ></path>
            } */}

            {Array(lessNoOfSeats ? noOfSeats - 1 : noOfSeats)
               .fill(0)
               .map((seat, i) => {
                  let myDistance = i * (radius * 2 + gapping) + radius;
                  const point = findPointOnLineAtDistance(
                     start,
                     end,
                     myDistance + (lessNoOfSeats ? offsetForLessNoOfSeats : 0)
                  );

                  const deletedSeatsBeforeMe = mySeats.filter(
                     (seat, j) => seat.deleted && !seat.recentlyDeleted && j < i
                  ).length;
                  const pointAfterCurve = skewAndCurvePoint(
                     start,
                     end,
                     point,
                     skew,
                     curve
                  );
                  const mySeat = mySeats.find((x) => x.index === i);
                  const seatCategory = allCategories.find(
                     (c) => c.id === mySeat?.categoryId
                  );
                  const finalCategory = seatCategory || rowCategory;
                  let myLabel = mySeats[i - deletedSeatsBeforeMe].label;

                  const seatPurchased = isObjectPurchased(
                     state,
                     mySeat as ISeat
                  );
                  const selectedByMe = isSeatSelectedByMe(
                     state,
                     mySeat as ISeat
                  );
                  const seatBlockingGroup = getSeatBlockGroup(
                     state,
                     mySeat as ISeat
                  );
                  if (seatBlockingGroup && state.visualizerOptions?.blocking) {
                     myLabel = seatBlockingGroup.letter;
                  }

                  const isInHiddenCategory =
                     state.visualizerOptions?.hiddenCategoires.includes(
                        finalCategory!.id
                     );

                  //If Seat category is hidden
                  if (isInHiddenCategory) {
                     return null;
                  }
                  if (mySeat?.deleted) {
                     if (selected) {
                        return (
                           <circle
                              className={classNames(
                                 "stroke-blue-main fill-white"
                              )}
                              r={radius}
                              cx={pointAfterCurve.x}
                              cy={pointAfterCurve.y}
                           ></circle>
                        );
                     } else return null;
                  }

                  // console.log(
                  //    "Pure row category id",
                  //    finalCategory,
                  //    filterCategoryId
                  // );
                  return (
                     <g>
                        {/* {mySeat?.selected && (
                           <rect
                              transform={`rotate(${angle}, ${pointAfterCurve.x}, ${pointAfterCurve.y})`}
                              x={pointAfterCurve.x - radius}
                              y={pointAfterCurve.y - radius}
                              height={radius * 2}
                              width={radius * 2}
                              className="stroke-blue-main fill-none"
                              strokeDasharray={"3,3"}
                           ></rect>
                        )} */}
                        <circle
                           className={classNames("", {
                              // "stroke-blue-main": selected || mySeat?.selected,
                              // "fill-gray-250": !Boolean(finalCategory?.color),
                           })}
                           style={{
                              fill: calcSeatFillColor(
                                 state,

                                 mySeat as ISeat,
                                 filterCategoryId,
                                 finalCategory as ICategory
                              ),
                           }}
                           strokeWidth={1}
                           r={radius}
                           cx={pointAfterCurve.x}
                           cy={pointAfterCurve.y}
                        ></circle>
                        {seatPurchased &&
                        selectedByMe &&
                        !state.visualizerOptions?.blocking ? (
                           <>
                              {/* <image
                                 xlinkHref={circleImage}
                                 x={pointAfterCurve.x - 9}
                                 y={pointAfterCurve.y - 9}
                                 height="18"
                                 width="18"
                              ></image> */}
                              <image
                                 xlinkHref={checkImage}
                                 x={pointAfterCurve.x - 7.5}
                                 y={pointAfterCurve.y - 7.5}
                                 height="15"
                                 width="15"
                              ></image>
                           </>
                        ) : null}

                        {state.visualizerOptions?.showLabels &&
                        !seatPurchased &&
                        !selectedByMe ? (
                           <text
                              className="svg-text font-raleway"
                              textAnchor="middle"
                              alignmentBaseline="central"
                              dominantBaseline="central"
                              x={pointAfterCurve.x}
                              y={pointAfterCurve.y}
                              // dy="0.3em"
                              fontSize={9}
                              fontWeight={300}
                              style={{
                                 fill:
                                    finalCategory?.color.foreground ||
                                    "#5A5A5A",
                              }}
                           >
                              {myLabel}
                           </text>
                        ) : null}
                        {/* {finalCategory?.disablity ? null : (
                        )} */}
                        {/* <g
                           transform={`translate(${pointAfterCurve.x}, ${pointAfterCurve.y})`}
                           textAnchor="middle"
                        >
                           {finalCategory?.disablity ? (
                              <image
                                 href={disablityIcon}
                                 height={20}
                                 width={20}
                                 transform={`translate(${-10}, -10)`}
                              ></image>
                           ) : null}
                        </g> */}

                        {/* <circle
                           r="2"
                           cx={mySeat?.position.x}
                           cy={mySeat?.position.y}
                           fill="green"
                        ></circle> */}
                        {/* <circle
                           className="fill-error-500"
                           r={3}
                           cx={pointAfterCurve.x}
                           cy={pointAfterCurve.y}
                        ></circle> */}
                     </g>
                  );
               })}
            {/* {(labelPosition === "right" || labelPosition === "left-right") && (
               <text
                  className="svg-text  font-raleway"
                  textAnchor="middle"
                  dominantBaseline="central"
                  alignmentBaseline="central"
                  x={rightLabelPos.x}
                  y={rightLabelPos.y}
                  // dy="0.3em"
                  transform={`rotate(${0}, ${rightLabelPos.x}, ${
                     rightLabelPos.y
                  })`}
                  fontSize={9}
                  // dy="0.3em"
                  fontWeight={300}
               >
                  {label}
               </text>
            )} */}

            {/* {labelEndPoints.map((point) => (
               <circle
                  className="fill-black"
                  r={2}
                  cx={point.x}
                  cy={point.y}
               ></circle>
            ))} */}
            {/* <circle
               className="fill-purple-500"
               r={2}
               cx={leftLabelPos.x}
               cy={leftLabelPos.y}
            ></circle> */}

            {/* <circle fill="red" r={3} cx={end.x} cy={end.y}></circle>
            <circle r={3} fill="orange" cx={start.x} cy={start.y}></circle>
            <circle r={3} fill="red" cx={end.x} cy={end.y}></circle> */}
            <circle r={3} fill="blue" cx={center.x} cy={center.y}></circle>
            <line
               x1={dotPoints.start.x}
               y1={dotPoints.start.y}
               x2={skewedStart.x}
               y2={skewedStart.y}
               stroke="white"
               strokeWidth={4}
            ></line>
            <line
               x1={dotPoints.end.x}
               y1={dotPoints.end.y}
               x2={skewedEnd.x}
               y2={skewedEnd.y}
               stroke="white"
               strokeWidth={4}
            ></line>
            {selected && (
               <>
                  <rect
                     id={`start-rowresize-rect-${id}`}
                     height={addRowRectSize}
                     width={addRowRectSize}
                     x={dotPoints.start.x - addRowRectSize / 2}
                     y={dotPoints.start.y - addRowRectSize / 2}
                     className="fill-blue-300 cursor-resize-row"
                     onMouseDown={(e) => {
                        e.stopPropagation();
                        onRowSizeChange();
                     }}
                  ></rect>
                  <rect
                     id={`end-rowresize-rect-${id}`}
                     height={addRowRectSize}
                     width={addRowRectSize}
                     x={dotPoints.end.x - addRowRectSize / 2}
                     y={dotPoints.end.y - addRowRectSize / 2}
                     className="fill-blue-300 cursor-resize-row"
                     onMouseDown={(e) => {
                        e.stopPropagation();
                        onRowSizeChange();
                     }}
                  ></rect>
               </>
            )}
         </g>
      </>
   );
};

export default memo(PureRow, (prevProps, nextProps) => {
   return _.isEqual(prevProps, nextProps);
});
