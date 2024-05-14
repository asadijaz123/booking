import classNames from "classnames";
import {
   degToRadians,
   getEquallySpacedPointsOnCircle,
   getRectCorners,
   getRotatedStartPoint,
   getRoundTableRadius,
   rectTableToCenteredRect,
   rotatePoint,
} from "../utils/utils";
import {
   distabledSeatColor,
   rectTableScale,
   seatsLabelGenerator,
} from "../utils/data";
import disablityIcon from "../assets/images/disable-icon.png";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import {
   calcSeatFillColor,
   isObjectPurchased,
   isSeatSelectedByMe,
} from "../utils/non-geom";
import checkImage from "../assets/images/check.png";
import circleImage from "../assets/images/circle.png";

interface RectTableProps {
   table: IRectTable;
   isDummy?: boolean;
}

const RectTable: React.FC<RectTableProps> = ({ table, isDummy }) => {
   const [state, dispatch] = useVisualizerContext();
   // const { tableRadius, seatsCircleRadius } = getRecTable(table);

   // const seatPoints = getEquallySpacedPointsOnCircle(
   //    table.center,
   //    seatsCircleRadius,
   //    table.noOfSeats
   // );
   // const myCategory = state.settings.allCategories.find(
   //    (cate) => cate.id === table.categoryId
   // );
   // const myLabelsWithoutReverse = seatsLabelGenerator[table.seatsLabelType](
   //    table.noOfSeats
   // );
   // const myLabels = table.reverseLabel
   //    ? myLabelsWithoutReverse.reverse()
   //    : myLabelsWithoutReverse;
   const pixelWidth = table.width * rectTableScale;
   const pixelHeight = table.height * rectTableScale;

   // Determine the top-left corner of the rect.
   const topLeftX = table.center.x - pixelWidth / 2;
   const topLeftY = table.center.y - pixelHeight / 2;
   // const corners = getRectCorners(rectTableToCenteredRect(table));
   return (
      <g>
         <rect
            transform={`rotate(${table.angle}, ${table.center.x}, ${table.center.y})`}
            x={topLeftX}
            y={topLeftY}
            width={pixelWidth}
            height={pixelHeight}
            className="fill-gray-250"
         />
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
                        className={classNames("stroke-blue-main fill-white")}
                        r={seat.radius}
                        cx={seat.position.x}
                        cy={seat.position.y}
                     ></circle>
                  );
               } else return null;
            }
            return (
               <g>
                  <circle
                     className={classNames("", {
                        "stroke-blue-main": table.selected || seat?.selected,
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
                  )}
                  <g
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
               </g>
            );
         })}
         {/* {corners.map((corner) => (
            <circle r={7} fill="red" cx={corner.x} cy={corner.y}></circle>
         ))} */}
      </g>
   );
};

export default RectTable;
