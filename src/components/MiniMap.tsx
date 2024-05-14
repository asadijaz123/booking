import { useRef } from "react";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { resizeContentToFit } from "../utils/others";
import Polygon from "./Polygon";
import RectTable from "./RectTable";
import RoundTable from "./RoundTable";
import RowGroup from "./RowGroup";
import Square from "./Square";
import { getRelativeMousePos } from "../utils/utils";
import { miniMapOriginalDimensions } from "../utils/data";

interface MiniMapProps {}

const MiniMap: React.FC<MiniMapProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const miniMapDimensions = resizeContentToFit(miniMapOriginalDimensions, {
      height: state.svgHeight,
      width: state.svgWidth,
   });
   // console.log(
   //    miniMapDimensions,
   //    "miniMapDimensions",
   //    state.svgHeight,
   //    state.svgWidth
   // );
   const xRatio = miniMapOriginalDimensions.width / state.svgWidth;
   const yRatio = miniMapOriginalDimensions.height / state.svgHeight;
   const svgRef = useRef<SVGSVGElement | null>(null);
   if (state.generalZoom === state.currentZoom) return null;
   return (
      <div
         className={`flex h-[${miniMapOriginalDimensions.height}px] rounded-sm-md w-[${miniMapOriginalDimensions.width}px] bg-white shadow-sm absolute left-4 bottom-4 z-20 justify-center items-center `}
      >
         <svg
            ref={svgRef}
            onClick={(e) => {
               dispatch({
                  onClickOnMiniMap: getRelativeMousePos(
                     e,
                     svgRef.current || undefined
                  ),
               });
            }}
            onMouseDown={(e) => {
               dispatch({
                  onMouseDownOnMiniMap: getRelativeMousePos(
                     e,
                     svgRef.current || undefined
                  ),
               });
            }}
            onMouseUp={(e) => {
               dispatch({
                  onMouseUpOnMiniMap: getRelativeMousePos(
                     e,
                     svgRef.current || undefined
                  ),
               });
            }}
            onMouseMove={(e) => {
               dispatch({
                  onMouseMoveOnMiniMap: getRelativeMousePos(
                     e,
                     svgRef.current || undefined
                  ),
               });
            }}
            viewBox={`0 0 ${state.svgWidth / state.generalZoom} ${
               state.svgHeight / state.generalZoom
            }`}
            className="h-fit w-fit"
            height={miniMapDimensions.height}
            width={miniMapDimensions.width}
         >
            <g>
               {state.data.roundTables.map((table, index) => (
                  <RoundTable table={table}></RoundTable>
               ))}
            </g>
            <g>
               {state.data.rectTables.map((table, index) => (
                  <RectTable table={table}></RectTable>
               ))}
            </g>
            {state.data.rowGroups.map((group) => (
               <RowGroup rowGroup={group}></RowGroup>
            ))}
            {state.data.squares.map((sq) => (
               <Square square={sq}></Square>
            ))}
            {state.data.polygons.map((poly) => (
               <Polygon polygon={poly}></Polygon>
            ))}
            <rect
               x={state.viewboxOffset.x}
               y={state.viewboxOffset.y}
               height={state.svgHeight / state.currentZoom}
               width={state.svgWidth / state.currentZoom}
               fill="none"
               className="stroke-gray-500"
               strokeWidth={6 / xRatio}
            ></rect>
         </svg>
      </div>
   );
};

export default MiniMap;
