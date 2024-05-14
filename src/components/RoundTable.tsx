import classNames from "classnames";
import {
   getEquallySpacedPointsOnCircle,
   getRoundTableRadius,
} from "../utils/utils";
import { distabledSeatColor, seatsLabelGenerator } from "../utils/data";
import disablityIcon from "../assets/images/disable-icon.png";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { isObject } from "lodash";
import checkImage from "../assets/images/check.svg";
import {
   calcSeatFillColor,
   isObjectPurchased,
   isSeatSelectedByMe,
} from "../utils/non-geom";

interface RoundTableProps {
   table: IRoundTable;
   isDummy?: boolean;
}

const RoundTable: React.FC<RoundTableProps> = ({ table, isDummy }) => {
   const [state, dispatch] = useVisualizerContext();
   const { tableRadius, seatsCircleRadius } = getRoundTableRadius(table);

   const myCategory = state.data.settings.allCategories.find(
      (cate) => cate.id === table.categoryId
   );
   const myLabelsWithoutReverse = seatsLabelGenerator[table.seatsLabelType](
      table.noOfSeats
   );

   return (
      <g>
         <circle
            r={tableRadius}
            cx={table.center.x}
            cy={table.center.y}
            className={classNames("fill-gray-250", {
               // "stroke-blue-main": table.selected,
            })}
            strokeWidth={1}
         ></circle>
         {table.centerBeforeRotation && (
            <circle
               r={5}
               cx={table.centerBeforeRotation.x}
               cy={table.centerBeforeRotation.y}
               className={classNames("fill-blue-500")}
            ></circle>
         )}
         {/* <text
            className="svg-text"
            textAnchor="middle"
            x={table.center.x}
            y={table.center.y}
            dy="0.3em"
            fontSize={9}
            fontFamily="Inter"
            fontWeight={300}
         >
            {isDummy ? "" : table.label}
         </text> */}
         {table.seats.map((seat, i) => {
            const finalCategory = state.data.settings.allCategories.find(
               (cat) => cat.id === seat.categoryId
            );
            const deletedSeatsBeforeMe = table.seats.filter(
               (seat, j) => seat.deleted && !seat.recentlyDeleted && j < i
            ).length;
            const myLabel = table.seats[i - deletedSeatsBeforeMe].label;
            const seatPurchased = isObjectPurchased(state, seat as ISeat);
            const selectedByMe = isSeatSelectedByMe(state, seat as ISeat);
            const isInHiddenCategory =
               state.visualizerOptions?.hiddenCategoires.includes(
                  finalCategory!.id
               );

            //If Seat category is hidden
            if (isInHiddenCategory) {
               return null;
            }
            if (seat?.deleted) {
               if (table.selected) {
                  return (
                     <circle
                        // className={classNames("stroke-blue-main fill-white")}
                        r={seat.radius}
                        cx={seat.position.x}
                        cy={seat.position.y}
                     ></circle>
                  );
               } else return null;
            }
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
                        // "stroke-blue-main": table.selected || seat?.selected,
                        "fill-gray-250": !Boolean(finalCategory?.color),
                     })}
                     style={{
                        fill: calcSeatFillColor(
                           state,
                           seat,
                           state.filterCategoryId,
                           finalCategory as ICategory
                        ),
                     }}
                     strokeWidth={1}
                     r={seat.radius}
                     cx={seat.position.x}
                     cy={seat.position.y}
                  ></circle>
                  {seatPurchased ? (
                     <>
                        <image
                           xlinkHref={checkImage}
                           x={seat.position.x - 7.5}
                           y={seat.position.y - 7.5}
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
                        x={seat.position.x}
                        y={seat.position.y}
                        // dy="0.3em"
                        fontSize={9}
                        fontWeight={300}
                        style={{
                           fill: finalCategory?.color.foreground || "#5A5A5A",
                        }}
                     >
                        {isDummy ? "" : myLabel}
                     </text>
                  ) : null}
                  {/* {finalCategory?.disablity ? null : (
                     
                  )} */}
                  {/* <g
                     transform={`translate(${seat.position.x}, ${seat.position.y})`}
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
      </g>
   );
};

export default RoundTable;
