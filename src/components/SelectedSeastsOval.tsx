import { isObject } from "lodash";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import {
   getAllSeats,
   getZoneBlockCount,
   isObjectPurchased,
} from "../utils/non-geom";
import { getAllSeatPoints, getOvalAroundSelectedSeats } from "../utils/utils";
import selectionMarker from "../assets/images/selection-marker.png";

interface SelectedSeatsOvalProps {}

const imageHeight = 44;
const imageWidth = 33;
const SelectedSeatsOval: React.FC<SelectedSeatsOvalProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const allSeats = getAllSeats(state.data);
   const selectedSeats = allSeats.filter((seat) =>
      isObjectPurchased(state, seat)
   );
   const allZones = [...state.data.squares, ...state.data.polygons];
   const rects = getOvalAroundSelectedSeats(state);
   const blockedZones = allZones.map((zone) => {
      const count = getZoneBlockCount(state, zone.id);
      let markerPos: Point | null = null;
      let centerTextPos: Point | null = null;
      if (zone.objectType === "square") {
         markerPos = {
            x: zone.start.x + zone.width / 2 - imageWidth / 2,
            y: zone.start.y + -imageHeight / 2,
         };
         centerTextPos = {
            x: zone.start.x + zone.width / 2 - imageWidth / 2,
            y: zone.start.y + zone.height / 2 - imageHeight / 2,
         };
      }
      return { markerPos: markerPos, centerTextPos, count };
   });
   if (state.currentZoom === 1) {
      return (
         <>
            {blockedZones.map(
               (blockedZone) =>
                  blockedZone.centerTextPos &&
                  blockedZone.count && (
                     <>
                        <text
                           textAnchor="middle"
                           alignmentBaseline="central"
                           x={blockedZone.centerTextPos!.x + imageWidth / 2}
                           fill="white"
                           fontSize={14}
                           y={
                              blockedZone.centerTextPos!.y + imageHeight / 2 - 5
                           }
                        >
                           {blockedZone.count.toString()} seats selected
                        </text>
                     </>
                  )
            )}
         </>
      );
   }
   return (
      <>
         {blockedZones.map(
            (blockedZone) =>
               blockedZone.markerPos &&
               blockedZone.count && (
                  <>
                     <image
                        xlinkHref={selectionMarker}
                        x={blockedZone.markerPos?.x}
                        y={blockedZone.markerPos?.y}
                        height={imageHeight}
                        width={imageWidth}
                     ></image>
                     <text
                        textAnchor="middle"
                        alignmentBaseline="central"
                        x={blockedZone.markerPos.x + imageWidth / 2}
                        fill="white"
                        fontSize={14}
                        y={blockedZone.markerPos.y + imageHeight / 2 - 5}
                     >
                        {blockedZone.count.toString()}
                     </text>
                  </>
               )
         )}
         {rects?.map((rect) => {
            const rectX = rect.x + rect.width / 2 - imageWidth / 2;
            const rectY = rect.y - imageHeight / 2;
            return (
               <g>
                  <rect
                     x={rect.x}
                     y={rect.y}
                     height={rect.height}
                     width={rect.width}
                     rx={rect.rx}
                     ry={rect.ry}
                     stroke="black"
                     strokeWidth={1}
                     fill="transparent"
                  ></rect>
                  <image
                     xlinkHref={selectionMarker}
                     x={rectX}
                     y={rectY}
                     height={imageHeight}
                     width={imageWidth}
                  ></image>
                  <text
                     textAnchor="middle"
                     alignmentBaseline="central"
                     x={rectX + imageWidth / 2}
                     fill="white"
                     fontSize={14}
                     y={rectY + imageHeight / 2 - 5}
                  >
                     {rect.label}
                  </text>
               </g>
            );
         })}
      </>
   );
};

export default SelectedSeatsOval;
