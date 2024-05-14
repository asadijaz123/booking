import classNames from "classnames";
import { getMostContrastingGray, pointsToPolygonString } from "../utils/others";
import { getPolygonCenter } from "../utils/shapes";
import { useMemo } from "react";
import { useVisualizerContext } from "../contexts/VisualizerContext";

interface PolygonProps {
   polygon: IPolygon;
}

const creationDotSize = 6;
const Polygon: React.FC<PolygonProps> = ({ polygon }) => {
   const [state, dispatch] = useVisualizerContext();
   const center = getPolygonCenter(polygon);
   const myBackgroundColor = useMemo(() => {
      if (polygon.type === "standing") {
         const myCategory = state.data.settings.allCategories.find(
            (x) => x.id === polygon.categoryId
         );
         return {
            stroke: "",
            fill: myCategory?.color.background || "rgb(195, 195,195)",
         };
      }
      return {
         stroke: polygon.colorType === "border" ? polygon.color : "",
         fill:
            polygon.colorType === "filled"
               ? polygon.color || "rgb(195, 195, 195)"
               : "transparent",
      };
   }, [polygon, state.data.settings.allCategories]);
   const labelColor = getMostContrastingGray(
      polygon.colorType === "border"
         ? "white"
         : polygon.color || "rgb(195, 195, 195)"
   );
   return (
      <g>
         {!polygon.beingCreated ? (
            <>
               <polygon
                  points={pointsToPolygonString(polygon.points)}
                  style={{
                     fill: myBackgroundColor.fill,
                     stroke: myBackgroundColor.stroke,
                  }}
               ></polygon>

               <g className="fill-red-300">
                  {state.visualizerOptions?.showZoneLabels ? (
                     <text
                        x={center.x}
                        y={center.y}
                        textAnchor="middle"
                        alignmentBaseline="central"
                        dominantBaseline="central"
                        fontSize={8}
                        style={{
                           fill: labelColor,
                        }}
                     >
                        {polygon.label}
                     </text>
                  ) : null}
               </g>
            </>
         ) : null}
         {polygon.beingCreated
            ? polygon.points.map((point, index) => (
                 <rect
                    x={point.x - creationDotSize / 2}
                    y={point.y - creationDotSize / 2}
                    height={creationDotSize}
                    width={creationDotSize}
                    className="stroke-blue-main fill-gray-250"
                 ></rect>
              ))
            : null}
      </g>
   );
};

export default Polygon;
