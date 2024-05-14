import { memo, useCallback, useEffect } from "react";
import { seatsLabelGenerator } from "../utils/data";
import {
   correctRowPoints,
   curvePoint,
   degToRadians,
   findCurveTangents,
   findLineRotation,
   findPointOnLineAtDistance,
   findPointOnLineAtDistanceWithSkew,
   generateSvgPathForCurvedLine,
   getCenterOfRow,
   getDistance,
   getEndPointsOfLabels,
   getNoOfSeats,
   getRowLabelPos,
   getRowResizeDotPoints,
   skewAndCurvePoint,
   skewEndPoints,
} from "../utils/utils";
import PureRow from "./PureRow";
import { comparePoints } from "../utils/others";
import { useVisualizerContext } from "../contexts/VisualizerContext";

export interface RowProps {
   row: IRow;
   lessNoOfSeats?: boolean;
   index?: number;
}

const Row: React.FC<RowProps> = ({ row, lessNoOfSeats, index = -1 }) => {
   row = correctRowPoints(row);
   const noOfSeats = row.noOfSeats;

   const [state, dispatch] = useVisualizerContext();
   const totalDistance =
      noOfSeats * (row.radius * 2 + row.gapping) - row.gapping;

   const { left: leftLabelPos, right: rightLabelPos } = getRowLabelPos(row);

   const offset = (row.gapping + row.radius * 2) / 2;

   // const onClickOnSeat = useCallback(
   //    (i: string) => {
   //       dispatch({ onSeatClick: { seatId: i } });
   //    },
   //    [dispatch, row.id]
   // );

   const selectedRows: IRow[] = [];
   const resizeDotPoints = getRowResizeDotPoints(row);
   const filterCategoryId = state.filterCategoryId;
   const rowCenter = getCenterOfRow(row);
   useEffect(() => {
      if (row.recentNoOfSeatsChange) {
      }
   }, [row.recentNoOfSeatsChange]);

   return (
      <PureRow
         filterCategoryId={filterCategoryId}
         allCategories={state.data.settings.allCategories}
         center={row.center}
         onRowSizeChange={() => {}}
         onlySelected={
            selectedRows.length === 1 && selectedRows[0].id === row.id
         }
         dotPoints={resizeDotPoints}
         angle={row.angle}
         pathD={
            row.selected
               ? generateSvgPathForCurvedLine(
                    row.start,
                    row.end,
                    row.curve,
                    row.skew
                 )
               : ""
         }
         selected={row.selected}
         tool={0}
         selectingSeats={false}
         id={row.id}
         curve={row.curve}
         end={row.end}
         start={row.start}
         gapping={row.gapping}
         label={row.label}
         labelPosition={row.labelPosition}
         leftLabelPos={leftLabelPos}
         rightLabelPos={rightLabelPos}
         mySeats={row.seats}
         noOfSeats={noOfSeats}
         offsetForLessNoOfSeats={offset}
         radius={row.radius}
         skew={row.skew}
         lessNoOfSeats={row.lessNoOfSeats || lessNoOfSeats}
      ></PureRow>
   );

   // return (
   //    <>
   //       <g>
   //          {(row.labelPosition === "left" ||
   //             row.labelPosition === "left-right") && (
   //             <text
   //                className="svg-text text-gray-500 font-raleway"
   //                textAnchor="middle"
   //                alignmentBaseline="central"
   //                x={leftLabelPos.x}
   //                y={leftLabelPos.y}
   //                // dy="0.3em"
   //                transform={`rotate(${0}, ${leftLabelPos.x}, ${
   //                   leftLabelPos.y
   //                })`}
   //                fontSize={10}
   //                fontFamily="Inter"
   //                fontWeight={300}
   //             >
   //                {row.label}
   //             </text>
   //          )}

   //          {Array(lessNoOfSeats ? noOfSeats - 1 : noOfSeats)
   //             .fill(0)
   //             .map((seat, i) => {
   //                let myDistance =
   //                   i * (row.radius * 2 + row.gapping) + row.radius;
   //                const point = findPointOnLineAtDistance(
   //                   row.start,
   //                   row.end,
   //                   myDistance + (lessNoOfSeats ? offset : 0)
   //                );

   //                const pointAfterCurve = skewAndCurvePoint(
   //                   row.start,
   //                   row.end,
   //                   point,
   //                   row.skew,
   //                   row.curve
   //                );
   //                const mySeat = mySeats.find((x) => x.index === i);

   //                return (
   //                   <g
   //                   // onClick={(e) => {
   //                   //    e.stopPropagation();
   //                   //    dispatch({ onSeatClick: `${row.id}-${i}` });
   //                   // }}
   //                   // onMouseUp={(e) => {
   //                   //    e.stopPropagation();
   //                   // }}
   //                   // onMouseDown={(e) => {
   //                   //    e.stopPropagation();
   //                   // }}
   //                   >
   //                      <circle
   //                         className="fill-gray-250"
   //                         r={row.radius}
   //                         cx={pointAfterCurve.x}
   //                         cy={pointAfterCurve.y}
   //                      ></circle>
   //                      <text
   //                         className="svg-text"
   //                         textAnchor="middle"
   //                         x={pointAfterCurve.x}
   //                         y={pointAfterCurve.y}
   //                         dy="0.3em"
   //                         fontSize={9}
   //                         fontFamily="Inter"
   //                         fontWeight={300}
   //                      >
   //                         {mySeat?.labelModified
   //                            ? mySeat.label
   //                            : seatLabels[i]}
   //                      </text>

   //                      {/* <circle
   //                         className="fill-error-500"
   //                         r={3}
   //                         cx={pointAfterCurve.x}
   //                         cy={pointAfterCurve.y}
   //                      ></circle> */}
   //                   </g>
   //                );
   //             })}
   //          {(row.labelPosition === "right" ||
   //             row.labelPosition === "left-right") && (
   //             <text
   //                className="svg-text text-gray-500 font-raleway"
   //                textAnchor="middle"
   //                alignmentBaseline="central"
   //                x={rightLabelPos.x}
   //                y={rightLabelPos.y}
   //                // dy="0.3em"
   //                transform={`rotate(${0}, ${rightLabelPos.x}, ${
   //                   rightLabelPos.y
   //                })`}
   //                fontSize={10}
   //                fontFamily="Inter"
   //                fontWeight={300}
   //             >
   //                {row.label}
   //             </text>
   //          )}
   //          {/* {labelEndPoints.map((point) => (
   //             <circle
   //                className="fill-black"
   //                r={2}
   //                cx={point.x}
   //                cy={point.y}
   //             ></circle>
   //          ))} */}
   //          {/* <circle
   //             className="fill-purple-500"
   //             r={2}
   //             cx={leftLabelPos.x}
   //             cy={leftLabelPos.y}
   //          ></circle> */}

   //          {/* <circle fill="red" r={3} cx={end.x} cy={end.y}></circle>
   //          <circle
   //             r={3}
   //             fill="orange"
   //             cx={row.start.x}
   //             cy={row.start.y}
   //          ></circle>
   //          <circle r={3} fill="red" cx={row.end.x} cy={row.end.y}></circle>
   //          <circle
   //             r={3}
   //             fill="blue"
   //             cx={row.center.x}
   //             cy={row.center.y}
   //          ></circle> */}
   //       </g>
   //    </>
   // );
};

export default memo(Row);
