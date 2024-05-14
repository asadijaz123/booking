import React from "react";
import { createCustomContext } from "../utils/CreateCustomContext";
import { icons } from "../helpers/icons";
import { categoryColors } from "../helpers/colors";
import {
   addPoints,
   changeRectToStandardRect,
   correctRowPoints,
   degToRadians,
   findLineRotation,
   findPointOnLineAtDistance,
   findThirdPointY,
   getAllSeatPoints,
   getAngleBetweenLines,
   getCenterOfRows,
   getDistance,
   getLineEquation,
   getNoOfSeats,
   getRandomId,
   getRectAroundRowsToRender,
   getRoundTableRadius,
   getSeatsBySeatIds,
   getSelectedRowsRect,
   intersectionWithPerpendicular,
   isPointInsideCircle,
   isPointInsideRect,
   isRectTouchingCircle,
   makeRowPointsForRect,
   removeDuplicateSeats,
   rotatePoint,
   rotateRoundTables,
   rotateRows,
   rotateToNearest,
   roundToNearest,
   rowsHaveSameDirectionVectors,
   sortParalellRows,
   rectTableToCenteredRect,
   rotateRectTables,
   isPointInRotatedRect,
   getNoOfNonDeletedSeatsOfRectTable,
   isRectTouchingSquare,
   isPointInsideSquare,
   isPointInsidePolygon,
   isRectTouchingPolygon,
   rotatePolygons,
   rotateSquares,
   getPolygonBounds,
   isClickOnObject,
   getClickedObject,
   getOvalAroundSelectedSeats,
} from "../utils/utils";
import {
   comparePoints,
   correctViewbox,
   getNextLabelTo,
   getUserId,
   tryToSelectSeat,
} from "../utils/others";
import {
   defaultSeatRadius,
   getRotationDotPointFromSelectionRect,
   minRectTableGap,
   miniMapOriginalDimensions,
   rectTableScale,
   seatsLabelGenerator,
   standardZooms,
   ticketOptions,
} from "../utils/data";
import {
   getAllSeats,
   getNoOfSeatsWithoutDeleted,
   getSeatBlockGroup,
   getTicketOptionsOfObject,
   getTotalTicketsCost,
   isObjectPurchased,
   isSeatBlocked,
   isSeatBlockedForBooking,
   isSeatBlockedForMe,
   mapSeats,
   mapSelectedSeats,
   purchaseTicketForSeat,
   removeDuplicateZoneBlocks,
   unselectSeatTicket,
} from "../utils/non-geom";
import { updatePolygonBounds } from "../utils/shapes";
import { cloneDeep, isObject, max, result, round } from "lodash";
import { errors } from "../helpers/errors";
import ZoneBlockingDialog from "../dialogs/ZoneBlockingDialog";
interface ISeatDetailOptions {
   label: string;
   seatType: ISeatType;
   status: ISeatAvailable;
}

interface ISettings {
   height: number;
   width: number;
   backgroundImage: string;
   name: string;
   category: string;
   allCategories: ICategory[];
   categoryBeingEdited?: string;
   backgroundOpacity: number;
   zoom: number;
   allTickets: IBaseTicketDetails[];
}

interface ITempRowSettings {
   seatSpacing?: number;
   seatLabelType?: ISeatLabelType;
}
interface ITempRowGroupSettings {
   seatSpacing?: number;
   rowSpacing?: number;
   seatLabelType?: ISeatLabelType;
   rowLabelType?: IRowLabelType;
}

interface CategoryDialogData {
   position: Point;
   open: boolean;
   mousedownPoint?: Point;
   mouse?: Point;
   positionBeforeMovement?: Point;
}

export interface IVisualizerData {
   settings: ISettings;
   rows: IRow[];
   rowGroups: IRowGroup[];
   tempRowSettings: ITempRowSettings;
   tempRowGroupSetting: ITempRowGroupSettings;
   testPoints: { point: Point; color: string }[];
   roundTables: IRoundTable[];

   rectTables: IRectTable[];
   defaultShapeOptions: DefaultShapeOptions;
   squares: ISquare[];
   polygons: IPolygon[];
   seatClickData?: SeatClickData;
   noOfTables: number;

   planId: string;
   // selectionCenterPoint: "right" | "left";
}
interface TicketSelectionDialogData {
   objectId: string;
}
interface StandingZoneTicketDialogData {
   objectId: string;
   values: number[];
}

export interface IVisualizerState {
   visualizerOptions?: IVisualizerOptions;
   baseTickets: IBaseTicketDetails[];
   data: IVisualizerData;
   filterCategoryId?: string;
   generalZoom: number;
   currentZoom: number;
   planLoaded: boolean;
   mouse: Point;
   mouseDownPoint?: Point;
   viewboxOffset: Point;
   previousViewboxOffset?: Point;
   svgHeight: number;
   svgWidth: number;
   removeFilterDialog?: Point;
   hoveredObject?: ISeat | ISquare | IPolygon;
   clickedObject?: ISeat | ISquare | IPolygon;
   activeTicketSelectionObjectId?: string;
   tempPurchasedObjectIds: string[];
   standingZoneTicketDialogData: StandingZoneTicketDialogData;
   checkoutError: string;
   promotionCode: string;
   minimapMouseDownPoint?: Point;
   tempCurrentZoom: number;
   zoomCenterPoint?: Point;
   zoomAnimationRunning: boolean;
   tempViewbox: Point;
   viewboxAnimationData?: { target: ViewboxData; current: ViewboxData };
   zoomType: "out" | "in";
   selectionDetails: GetTicketSelectionAndPurchaseResponse;
   unselectedSeatId?: string;
   seatIdForApiCall?: string;
   tempStandingZoneSelections: ZoneSelectionResponse[];
   zoneSelectionsToSendForApi?: ZoneSelectionResponse[];
   zoomStartDistance?: number;
   twoFingerZooming?: boolean;
   twoFingerZoomStartPoints: Point[];
   viewboxOffsetBeforeTwoFingerZoom: Point;
   seatBlockingData: ISeatBlockingData;
}
interface IZoneBlockingDialogCountItem {
   count: number;
   blockValue: string;
}
interface IZoneBlockingDialogData {
   zoneId: string;
   counts: IZoneBlockingDialogCountItem[];
}
interface ISeatBlockingData {
   myGroups: IBlockingGroup[];
   allGroups: IBlockingGroup[];
   zoneBlockingDialogData?: IZoneBlockingDialogData;
   createBlockGroupDialogData: { groupName: string; visible: boolean };
   editBlockGroupDialogData: { groupName: string; activeGroupValue: string };
}
interface SimpleTempStandingZoneSelection {
   objectId: string;
   ticketId: string;
   count: number;
}
interface ViewboxData {
   x: number;
   y: number;
   height: number;
   width: number;
}
export const initialData: IVisualizerData = {
   noOfTables: 0,

   planId: "",
   squares: [],
   testPoints: [{ color: "black", point: { x: 200, y: 200 } }],
   polygons: [],
   roundTables: [],
   rectTables: [],

   rowGroups: [],

   settings: {
      allTickets: [],
      zoom: 1,
      height: 1000,
      width: 1000,
      backgroundImage: "",
      backgroundOpacity: 50,
      name: "",
      category: "",
      allCategories: [],
      categoryBeingEdited: "",
   },
   rows: [],
   tempRowSettings: {},
   tempRowGroupSetting: {},
   defaultShapeOptions: { figureType: "square", shapeType: "normal" },
};
export const initialBlockingData: ISeatBlockingData = {
   editBlockGroupDialogData: { groupName: "", activeGroupValue: "" },
   myGroups: [
      {
         letter: "A",
         blocks: [],
         title: "Session Block",
         value: "a",
         checked: false,
         userId: getUserId(),
      },
   ],
   allGroups: [],
   createBlockGroupDialogData: { groupName: "", visible: false },
};
export const initialState: IVisualizerState = {
   viewboxOffsetBeforeTwoFingerZoom: { x: 0, y: 0 },
   twoFingerZoomStartPoints: [],
   seatBlockingData: initialBlockingData,
   baseTickets: [],
   tempStandingZoneSelections: [],
   selectionDetails: {
      seatSelections: [],
      zoneSelections: [],
      seatPurchases: [],
      zonePurchases: [],
   },
   promotionCode: "",
   tempViewbox: { x: 0, y: 0 },
   tempPurchasedObjectIds: [],
   mouse: { x: 0, y: 0 },
   data: initialData,
   filterCategoryId: "",
   generalZoom: 1,
   currentZoom: 1,
   planLoaded: false,
   viewboxOffset: { x: 0, y: 0 },
   svgHeight: 0,
   svgWidth: 0,
   standingZoneTicketDialogData: {
      objectId: "",
      values: [],
   },
   tempCurrentZoom: 0.25,
   checkoutError: "",
   zoomAnimationRunning: false,
   zoomType: "in",
};
const DEFAULT_ROW_GAPPPING = 2;
const DEFAULT_SEAT_GAPPING = 2;
const DEFAULT_RADIUIS = 10;

const updateSeatBlockingGroup = (
   state: IVisualizerState,
   data: { value: string; props: Partial<IBlockingGroup> }
): IVisualizerState => {
   return {
      ...state,
      seatBlockingData: {
         ...state.seatBlockingData,
         myGroups: state.seatBlockingData.myGroups.map((group) =>
            group.value !== data.value ? group : { ...group, ...data.props }
         ),
      },
   };
};
const functions = {
   setData: (state: IVisualizerState, data: IVisualizerData) => ({
      ...state,
      data,
   }),
   setState: (
      state: IVisualizerState,
      newState: Partial<IVisualizerState>
   ) => ({ ...state, ...newState }),
   toggleBlockingGroup: (
      state: IVisualizerState,
      data: { value: string; checked: boolean }
   ): IVisualizerState => {
      return updateSeatBlockingGroup(state, {
         value: data.value,
         props: { checked: data.checked },
      });
   },
   deleteBlockGroupByValue: (
      state: IVisualizerState,
      data: { value: string }
   ): IVisualizerState => {
      return {
         ...state,
         seatBlockingData: {
            ...state.seatBlockingData,
            myGroups: state.seatBlockingData.myGroups.filter(
               (group) => group.value !== data.value
            ),
         },
      };
   },
   updateBlockGroupByValue: (
      state: IVisualizerState,
      data: { value: string; props: Partial<IBlockingGroup> }
   ): IVisualizerState => {
      return updateSeatBlockingGroup(state, data);
   },
   setBlockingData: (
      state: IVisualizerState,
      props: Partial<ISeatBlockingData>
   ): IVisualizerState => {
      return {
         ...state,
         seatBlockingData: { ...state.seatBlockingData, ...props },
      };
   },
   createBlockGroup: (
      state: IVisualizerState,
      props: null
   ): IVisualizerState => {
      const sessionBlock = state.seatBlockingData.myGroups.find(
         (group) => group.value === "a"
      ) as IBlockingGroup;
      const allOriginalLetters = "abcdefghiopqrstuvwxyz";
      const currentGroupLetters = state.seatBlockingData.myGroups.map(
         (group) => group.value
      );
      const allIndexes = currentGroupLetters.map((letter) =>
         allOriginalLetters.indexOf(letter)
      );
      const maxIndex = Math.max(...allIndexes);
      const nextLetter = allOriginalLetters[maxIndex + 1];

      return {
         ...state,
         seatBlockingData: {
            ...state.seatBlockingData,
            createBlockGroupDialogData: { groupName: "", visible: false },
            myGroups: [
               ...state.seatBlockingData.myGroups.filter(
                  (group) => group.value !== "a"
               ),
               { ...sessionBlock, blocks: [] },
               {
                  blocks: sessionBlock?.blocks || [],
                  checked: false,
                  letter: nextLetter.toUpperCase(),
                  title: state.seatBlockingData.createBlockGroupDialogData
                     .groupName,
                  value: nextLetter,
                  userId: getUserId(),
               },
            ],
         },
      };
   },
   confirmZoneBlockings: (
      state: IVisualizerState,
      props: null
   ): IVisualizerState => {
      const tempCounts =
         state.seatBlockingData.zoneBlockingDialogData?.counts || [];
      let blockingData = state.seatBlockingData;
      console.log(blockingData.zoneBlockingDialogData?.zoneId, "zone id");
      blockingData = {
         ...state.seatBlockingData,
         zoneBlockingDialogData: undefined,
         myGroups: blockingData.myGroups.map((group) => {
            return {
               ...group,

               blocks: removeDuplicateZoneBlocks(
                  [
                     ...group.blocks,
                     ...tempCounts.map((tempCountItem) =>
                        tempCountItem.blockValue === group.value
                           ? ({
                                objectId:
                                   blockingData.zoneBlockingDialogData
                                      ?.zoneId || "",
                                numberOfSeats: tempCountItem.count,
                                type: "zone",
                             } as ISeatBlock)
                           : null
                     ),
                  ]
                     .filter((x) => x !== null)
                     .filter(
                        (block) => block?.numberOfSeats !== 0
                     ) as ISeatBlock[]
               ),
            };
         }),
      };
      console.log("new blocking data", blockingData, tempCounts);
      return { ...state, seatBlockingData: blockingData };
   },
   // onClickOnPlan: (
   //    state: IVisualizerState,
   //    props: null
   // ): IVisualizerState => {},
   onClickOnMiniMap: (
      state: IVisualizerState,
      point: Point
   ): IVisualizerState => {
      // const miniMapOriginalDimensions = { height: 50, width: 96 };
      // const xRatio = miniMapOriginalDimensions.width / state.svgWidth;
      // const yRatio = miniMapOriginalDimensions.height / state.svgHeight;
      // const reverseZoom = state.currentZoom / state.generalZoom;

      // const clickedPoint = {
      //    x: point.x / xRatio / state.generalZoom,
      //    y: point.y / yRatio / state.generalZoom,
      // };
      // const final = {
      //    x: clickedPoint.x - state.svgWidth / state.currentZoom / 2,
      //    y: clickedPoint.y - state.svgHeight / state.currentZoom / 2,
      // };
      // // const xOffset = state.svgWidth / state.currentZoom / 2;
      // // const yOffset = state.svgWidth / state.currentZoom / 2;
      // return correctViewbox({
      //    ...state,
      //    viewboxOffset: final,
      //    removeFilterDialog: undefined,
      // });
      return state;
   },
   onMouseDownOnMiniMap: (
      state: IVisualizerState,
      point: Point
   ): IVisualizerState => {
      return {
         ...state,
         minimapMouseDownPoint: point,
         previousViewboxOffset: state.viewboxOffset,
      };
   },
   onTwoFingerZoomStart: (
      state: IVisualizerState,
      props: {
         initDistance: number;
         points: Point[];
      }
   ): IVisualizerState => {
      // alert("Distance " + initDistance);
      return {
         ...state,
         twoFingerZoomStartPoints: props.points,
         viewboxOffsetBeforeTwoFingerZoom: { ...state.viewboxOffset },
         zoomStartDistance: props.initDistance,
         twoFingerZooming: true,
      };
   },
   onTwoFingerMove: (
      state: IVisualizerState,
      props: { newDistance: number; touch1: Point; touch2: Point }
   ): IVisualizerState => {
      const viewboxOffset = { ...state.viewboxOffset };
      let currentZoom = state.currentZoom;
      const startPoints = state.twoFingerZoomStartPoints;
      const originalCenterX = (startPoints[0].x + startPoints[1].x) / 2;
      const originalCenterY = (startPoints[0].y + startPoints[1].y) / 2;
      if (state.zoomStartDistance) {
         const scale =
            (props.newDistance / state.zoomStartDistance) * state.currentZoom;
         const svgWidth = state.svgWidth;
         const svgHeight = state.svgHeight;
         const newWidth = svgWidth / scale;
         const newHeight = svgHeight / scale;
         const scale2 = svgWidth / newWidth;
         if (scale2 >= 1) return state;

         const centerX = originalCenterX;
         const centerY = originalCenterY;

         const defaultCenterX = centerX * (1 / state.currentZoom);
         const defaultCenterY = centerY * (1 / state.currentZoom);

         const newX =
            defaultCenterX * (scale2 - 0.25) +
            state.viewboxOffsetBeforeTwoFingerZoom.x;
         const newY =
            defaultCenterY * (scale2 - 0.25) +
            state.viewboxOffsetBeforeTwoFingerZoom.y;

         viewboxOffset.x = newX;
         viewboxOffset.y = newY;
         currentZoom = svgWidth / newWidth;
         console.log(viewboxOffset, "new viewbox offset");
         console.log("scales", scale, scale2, newWidth, svgWidth);
         console.log(
            originalCenterX,
            originalCenterY,
            defaultCenterX,
            defaultCenterY,
            newX,
            newY,
            state.currentZoom,
            scale2,
            "original center"
         );

         const correctedViewbox = {
            ...state,
            tempCurrentZoom: currentZoom,
            viewboxOffset: { x: newX, y: newY },
            viewboxAnimationData: {
               current: {
                  height: newHeight,
                  width: newWidth,
                  x: newX,
                  y: newY,
               },
               target: {
                  height: newHeight,
                  width: newWidth,
                  x: newX,
                  y: newY,
               },
            },
         };
         console.log(correctedViewbox.viewboxOffset, "corrected viewbox");
         return correctedViewbox;
      } else return state;
   },
   onTwoFingerZoomEnd: (
      state: IVisualizerState,
      data: null
   ): IVisualizerState => {
      const newZoom =
         state.svgHeight / state.viewboxAnimationData!.current.height;
      console.log("current zoom changed", state.currentZoom);
      return {
         ...state,
         currentZoom: newZoom,
         twoFingerZooming: false,
      };
   },
   onMouseUpOnMiniMap: (
      state: IVisualizerState,
      point: Point
   ): IVisualizerState => {
      if (
         state.minimapMouseDownPoint &&
         comparePoints(point, state.minimapMouseDownPoint)
      ) {
         const xRatio = miniMapOriginalDimensions.width / state.svgWidth;
         const yRatio = miniMapOriginalDimensions.height / state.svgHeight;
         const reverseZoom = state.currentZoom / state.generalZoom;

         const clickedPoint = {
            x: point.x / xRatio / state.generalZoom,
            y: point.y / yRatio / state.generalZoom,
         };
         const final = {
            x: clickedPoint.x - state.svgWidth / state.currentZoom / 2,
            y: clickedPoint.y - state.svgHeight / state.currentZoom / 2,
         };
         // const xOffset = state.svgWidth / state.currentZoom / 2;
         // const yOffset = state.svgWidth / state.currentZoom / 2;
         return correctViewbox({
            ...state,
            viewboxOffset: final,
            removeFilterDialog: undefined,
            minimapMouseDownPoint: undefined,
         });
      }
      return { ...state, minimapMouseDownPoint: undefined };
   },
   onMouseMoveOnMiniMap: (
      state: IVisualizerState,
      point: Point
   ): IVisualizerState => {
      if (state.minimapMouseDownPoint) {
         const diffX = state.minimapMouseDownPoint.x - point.x;
         const diffY = state.minimapMouseDownPoint.y - point.y;

         const xRatio = miniMapOriginalDimensions.width / state.svgWidth;
         const yRatio = miniMapOriginalDimensions.height / state.svgHeight;
         const reverseZoom = state.currentZoom / state.generalZoom;

         const adjustedDiff = {
            x: diffX / xRatio / state.generalZoom,
            y: diffY / yRatio / state.generalZoom,
         };
         const adjustedPreviousViewboxOffset = {
            x: state.previousViewboxOffset!.x,
            y: state.previousViewboxOffset!.y,
         };

         const final = {
            x: adjustedPreviousViewboxOffset!.x - adjustedDiff.x,
            y: adjustedPreviousViewboxOffset!.y - adjustedDiff.y,
         };

         // const xOffset = state.svgWidth / state.currentZoom / 2;
         // const yOffset = state.svgWidth / state.currentZoom / 2;
         return correctViewbox({
            ...state,
            viewboxOffset: final,
            removeFilterDialog: undefined,
         });
      }
      return state;
   },
   onMouseMove: (state: IVisualizerState, point: Point): IVisualizerState => {
      const hoveredObject = getClickedObject(state, point);

      if (state.mouseDownPoint && state.currentZoom !== state.generalZoom) {
         //Dragging
         if (!comparePoints(state.mouseDownPoint, point)) {
            const distanceX = point.x - state.mouseDownPoint.x;
            const distanceY = point.y - state.mouseDownPoint.y;
            const adjustedX = distanceX;
            const adjustedY = distanceY;
            let finalX = state.previousViewboxOffset!.x - adjustedX;
            let finalY = state.previousViewboxOffset!.y - adjustedY;

            return correctViewbox({
               hoveredObject,
               ...state,
               mouse: point,
               removeFilterDialog: undefined,
               viewboxOffset: {
                  x: finalX,
                  y: finalY,
               },
            });
         }
      }
      return { ...state, mouse: point, hoveredObject };
   },
   onMouseDown: (state: IVisualizerState, point: Point): IVisualizerState => {
      return {
         ...state,
         mouseDownPoint: point,
         previousViewboxOffset: state.viewboxOffset,
      };
   },
   onClickOnZoomOut: (state: IVisualizerState, _: Point): IVisualizerState => {
      console.log("zoom out called");
      if (state.zoomAnimationRunning) return state;
      let newCurrentZoom = state.currentZoom / 2;
      if (!standardZooms.includes(state.currentZoom)) {
         newCurrentZoom =
            standardZooms.find((zoom, i) => zoom > state.currentZoom) ||
            state.generalZoom;
         newCurrentZoom = newCurrentZoom / 2;
      }

      const newWidth = state.svgWidth / newCurrentZoom;
      const newHeight = state.svgHeight / newCurrentZoom;

      let point = { x: state.svgWidth / 2, y: state.svgHeight / 2 };
      const centerAfterZoomOut = { ...point };
      const currentCenter = {
         x:
            state.viewboxOffset.x / 4 +
            (state.svgWidth * state.currentZoom) / 2,
         y:
            state.viewboxOffset.y / 4 +
            (state.svgHeight * state.currentZoom) / 2,
      };
      let adjustedX = point.x / state.currentZoom + state.viewboxOffset.x;
      let adjustedY = point.y / state.currentZoom + state.viewboxOffset.y;

      let minX = adjustedX - newWidth / 2;
      let minY = adjustedY - newHeight / 2;
      let viewboxAnimationData = state.viewboxAnimationData;
      let currentZoom = state.currentZoom;
      let viewboxOffset = state.viewboxOffset;
      let zoomCenterPoint = {
         ...currentCenter,
      };
      let zoomAnimationRunning = state.zoomAnimationRunning;
      currentZoom = state.currentZoom / 2;
      viewboxOffset = { x: minX, y: minY };

      // zoomCenterPoint = {
      //    x: point.x - state.viewboxOffset.x,
      //    y: point.y - state.viewboxOffset.y,
      // };
      // if (zoomCenterPoint.x < state.svgWidth / 4) {
      //    zoomCenterPoint.x = state.svgWidth / 4;
      // }
      // if (zoomCenterPoint.y < state.svgHeight / 4) {
      //    zoomCenterPoint.y = state.svgHeight / 4;
      // }

      const tempState = correctViewbox({
         ...state,
         currentZoom: newCurrentZoom,
         removeFilterDialog: undefined,
         zoomAnimationRunning: true,
         viewboxAnimationData,
         viewboxOffset,

         zoomType: "out",
         zoomCenterPoint,
      });
      viewboxAnimationData = {
         current: {
            x: state.viewboxOffset.x,
            y: state.viewboxOffset.y,
            height: state.svgHeight / state.currentZoom,
            width: state.svgWidth / state.currentZoom,
         },
         target: {
            x: tempState.viewboxOffset.x,
            y: tempState.viewboxOffset.y,
            height: state.svgHeight / currentZoom,
            width: state.svgWidth / currentZoom,
         },
      };
      return correctViewbox({ ...tempState, viewboxAnimationData });
   },
   onMouseUpOnApp: (
      state: IVisualizerState,
      point: Point
   ): IVisualizerState => {
      return {
         ...state,
         mouseDownPoint: undefined,
         minimapMouseDownPoint: undefined,
      };
   },
   onMouseUp: (state: IVisualizerState, point: Point): IVisualizerState => {
      let mouseDownPoint = state.mouseDownPoint;
      let removeFilterDialog = state.removeFilterDialog;
      let currentZoom = state.currentZoom;
      let viewboxOffset = state.viewboxOffset;
      let activeTicketSelectionObjectId = state.activeTicketSelectionObjectId;
      let standingZoneTicketDialogData = state.standingZoneTicketDialogData;
      let rows = state.data.rows;
      let rectTables = state.data.rectTables;
      let roundTables = state.data.roundTables;
      let zoomCenterPoint = state.zoomCenterPoint;
      let zoomAnimationRunning = state.zoomAnimationRunning;
      let viewboxAnimationData = state.viewboxAnimationData;
      let unselectedSeatId = state.unselectedSeatId;
      let seatIdForApiCall = state.seatIdForApiCall;
      let seatBlockingData = state.seatBlockingData;
      console.log("mouse up called");

      if (
         state.mouseDownPoint &&
         comparePoints(state!.mouseDownPoint as Point, point)
      ) {
         const clickedObject = getClickedObject(state, point);
         console.log("clicked object", clickedObject);

         const isDisabled =
            state.filterCategoryId &&
            state.filterCategoryId !== clickedObject?.categoryId;
         //Clicked on standing zone
         if (clickedObject && (clickedObject as ISquare).type === "standing") {
            //Blocking Mode
            if (state.visualizerOptions?.blocking) {
               seatBlockingData = {
                  ...seatBlockingData,
                  zoneBlockingDialogData: {
                     zoneId: clickedObject.id,
                     counts: state.seatBlockingData.myGroups.map((group) => ({
                        count: 0,
                        blockValue: group.value,
                     })),
                  },
               };
            }

            //Normal visualizer
            else {
               if (isDisabled) {
                  removeFilterDialog = point;
               } else {
                  const myCategory = state.data.settings.allCategories.find(
                     (cat) => cat.id === clickedObject.categoryId
                  );
                  const ticketOptions = state.baseTickets.filter((ticket) =>
                     myCategory?.ticketIds.includes(ticket.id)
                  );
                  console.log("Standing zone is clicked", ticketOptions);
                  activeTicketSelectionObjectId = clickedObject.id;
                  standingZoneTicketDialogData = {
                     objectId: clickedObject.id,
                     values: ticketOptions?.map((option) => 0) || [],
                  };
               }
            }
         } else if (state.currentZoom !== 1 && !state.zoomAnimationRunning) {
            const newWidth = state.svgWidth / (state.currentZoom * 2);
            const newHeight = state.svgHeight / (state.currentZoom * 2);
            let adjustedX = point.x / state.currentZoom + state.viewboxOffset.x;
            let adjustedY = point.y / state.currentZoom + state.viewboxOffset.y;

            let minX = adjustedX - newWidth / 2;
            let minY = adjustedY - newHeight / 2;
            currentZoom = state.currentZoom * 2;
            viewboxOffset = { x: minX, y: minY };
            zoomCenterPoint = { x: point.x, y: point.y };
            if (zoomCenterPoint.x < state.svgWidth / 4) {
               zoomCenterPoint.x = state.svgWidth / 4;
            }
            if (zoomCenterPoint.y < state.svgHeight / 4) {
               zoomCenterPoint.y = state.svgHeight / 4;
            }

            zoomAnimationRunning = true;
            const mainSvg = document.querySelector("#main-svg");

            // viewboxOffset = { x: minX, y: minY };
            // const totalPlanHeight = state.svgHeight / state.generalZoom;
            // const totalPlanWidth = state.svgWidth / state.generalZoom;
            // const maxViewboxX =
            //    totalPlanWidth -
            //    totalPlanWidth * (state.generalZoom / state.currentZoom);
            // const maxViewboxY =
            //    totalPlanHeight -
            //    totalPlanHeight * (state.generalZoom / state.currentZoom);
            // if (viewboxOffset.x < 0) viewboxOffset.x = 0;
            // if (viewboxOffset.y < 0) viewboxOffset.y = 0;
            // if (viewboxOffset.x > maxViewboxX) viewboxOffset.x = maxViewboxX;
            // if (viewboxOffset.y > maxViewboxY) viewboxOffset.y = maxViewboxY;
            const tempState = correctViewbox({
               ...state,
               currentZoom,
               removeFilterDialog: undefined,
               zoomAnimationRunning: true,
               viewboxAnimationData,
               viewboxOffset,

               zoomType: "out",
               zoomCenterPoint,
            });
            viewboxAnimationData = {
               current: {
                  x: state.viewboxOffset.x,
                  y: state.viewboxOffset.y,
                  height: state.svgHeight / state.currentZoom,
                  width: state.svgWidth / state.currentZoom,
               },
               target: {
                  x: tempState.viewboxOffset.x,
                  y: tempState.viewboxOffset.y,
                  height: state.svgHeight / currentZoom,
                  width: state.svgWidth / currentZoom,
               },
            };
         } else {
            //If clicked object is a seat
            if ((clickedObject as ISeat)?.radius) {
               const seatBlockedForMe = isSeatBlockedForMe(
                  state,
                  clickedObject as ISeat
               );
               console.log("seat blocked for me", seatBlockedForMe);
               //Blocking
               if (state.visualizerOptions?.blocking && !seatBlockedForMe) {
                  const purchased = isObjectPurchased(
                     state,
                     clickedObject as ISeat
                  );
                  const blockGroup = getSeatBlockGroup(
                     state,
                     clickedObject as ISeat
                  );

                  //Unselect previous block group
                  if (blockGroup) {
                     const alteredState = updateSeatBlockingGroup(state, {
                        value: blockGroup.value,
                        props: {
                           blocks: [
                              ...blockGroup.blocks.filter(
                                 (sel) => sel.objectId !== clickedObject?.id
                              ),
                           ],
                        },
                     });
                     seatBlockingData = alteredState.seatBlockingData;
                  }

                  //If it is available
                  else if (!purchased) {
                     const clickedSeat = clickedObject as ISeat;
                     const sessionBlock = state.seatBlockingData.myGroups.find(
                        (group) => group.value === "a"
                     );
                     seatBlockingData = updateSeatBlockingGroup(state, {
                        value: "a",
                        props: {
                           blocks: [
                              ...sessionBlock!.blocks,
                              {
                                 objectId: clickedSeat.id,
                                 type: "seat",
                                 numberOfSeats: 1,
                              },
                           ],
                        },
                     }).seatBlockingData;
                  }
               }

               // Normal visualizer
               else {
                  const seatBlockedForBooking = isSeatBlockedForBooking(
                     state,
                     clickedObject as ISeat
                  );
                  console.log("seat blocked", seatBlockedForBooking);
                  if (!seatBlockedForBooking) {
                     if (isDisabled) {
                        removeFilterDialog = point;
                     } else {
                        const purchased = isObjectPurchased(
                           state,
                           clickedObject as ISeat
                        );
                        const clickedSeat = clickedObject as ISeat;
                        if (purchased) {
                           unselectedSeatId = clickedObject?.id;
                           rows = rows = unselectSeatTicket(
                              rows,
                              clickedSeat.id
                           ) as IRow[];
                           roundTables = unselectSeatTicket(
                              roundTables,
                              clickedSeat.id
                           ) as IRoundTable[];
                           rectTables = unselectSeatTicket(
                              rectTables,
                              clickedSeat.id
                           ) as IRectTable[];
                        } else {
                           const myCategory =
                              state.data.settings.allCategories.find(
                                 (cat) => cat.id === clickedSeat.categoryId
                              );
                           const ticketOptions = state.baseTickets.filter(
                              (ticket) =>
                                 myCategory?.ticketIds.includes(ticket.id)
                           );
                           if (ticketOptions.length > 1) {
                              activeTicketSelectionObjectId = clickedObject?.id;
                           } else {
                              seatIdForApiCall = clickedObject?.id;
                           }
                        }
                     }
                  }
               }
            }
         }
      }

      const resultState: IVisualizerState = {
         ...state,
         currentZoom,
         viewboxOffset,
         seatIdForApiCall,

         data: { ...state.data, rows, roundTables, rectTables },
         mouse: point,
         mouseDownPoint: undefined,
         removeFilterDialog,
         activeTicketSelectionObjectId,
         standingZoneTicketDialogData,
         zoomCenterPoint: zoomCenterPoint,
         zoomAnimationRunning,
         viewboxAnimationData,
         minimapMouseDownPoint: undefined,
         zoomType: "in",
         unselectedSeatId,
         seatBlockingData,
      };
      return resultState;
   },
   removeZoneTicketSelection: (
      state: IVisualizerState,
      data: { objectId: string; ticketId: string }
   ): IVisualizerState => {
      const tempStandingZoneSelections =
         state.tempStandingZoneSelections.filter(
            (sel) =>
               !(
                  sel.objectId === data.objectId &&
                  sel.ticketId === data.ticketId &&
                  sel.purchasedBy === getUserId()
               )
         );
      console.log(tempStandingZoneSelections, "selections after removal");
      return {
         ...state,
         tempStandingZoneSelections,
         zoneSelectionsToSendForApi: tempStandingZoneSelections,
      };
   },
   changeStandingZoneTicketData: (
      state: IVisualizerState,
      data: { objectId: string; ticketId: string; count: number }
   ): IVisualizerState => {
      const newTempStandingZoneSelections: ZoneSelectionResponse[] = [
         ...state.tempStandingZoneSelections.filter(
            (sel) =>
               !(
                  sel.objectId === data.objectId &&
                  sel.ticketId === sel.ticketId &&
                  sel.purchasedBy === getUserId()
               )
         ),
         {
            objectId: data.objectId,
            ticketId: data.ticketId,
            count: data.count,
            purchasedBy: getUserId(),
         },
      ];
      console.log(
         "new standing zone ticket data",
         newTempStandingZoneSelections
      );
      return {
         ...state,
         tempStandingZoneSelections: newTempStandingZoneSelections,
      };
      // return { ...state, data: { ...state.data, polygons, squares } };
   },

   purchaseStandingZoneTickets: (
      state: IVisualizerState,
      data: null
   ): IVisualizerState => {
      // const allShapes = [...state.data.polygons, ...state.data.squares];
      // const selectedShape = allShapes.find(
      //    (shape) => shape.id === state.standingZoneTicketDialogData.objectId
      // );
      // let polygons = state.data.polygons.map((polygon) => ({
      //    ...polygon,
      //    ticketOptions: polygon.ticketOptions?.map((option, index) => ({
      //       ...option,
      //       purchased:
      //          selectedShape?.id === polygon.id
      //             ? option.selected
      //             : option.purchased,
      //    })),
      // }));
      // let squares = state.data.squares.map((square) => ({
      //    ...square,
      //    ticketOptions: square.ticketOptions?.map((option, index) => ({
      //       ...option,
      //       purchased:
      //          selectedShape?.id === square.id
      //             ? option.selected
      //             : option.purchased,
      //    })),
      // }));
      return {
         ...state,
         // data: { ...state.data, polygons, squares },
         standingZoneTicketDialogData: { objectId: "", values: [] },
         zoneSelectionsToSendForApi: [...state.tempStandingZoneSelections],
         activeTicketSelectionObjectId: undefined,
      };
   },
   onContinueToCheckout: (
      state: IVisualizerState,
      data: null
   ): IVisualizerState => {
      const ticketsCost = getTotalTicketsCost(state);
      if (ticketsCost === 0) {
         return {
            ...state,
            checkoutError: errors.checkoutErrors.noTicket,
         };
      }
      return state;
   },
   deleteTicketItem: (
      state: IVisualizerState,
      data: { ticketOptionId: string; objectId: string }
   ): IVisualizerState => {
      return state;
      // return removeTicketFromAllObjects(
      //    data.objectId,
      //    data.ticketOptionId,
      //    state
      // );
   },
   selectTicket: (
      state: IVisualizerState,
      ticketId: string
   ): IVisualizerState => {
      const allSeats = getAllSeats(state.data);
      const clickedSeat = allSeats.find(
         (seat) => seat.id === state.activeTicketSelectionObjectId
      );
      let rows = state.data.rows;
      let rectTables = state.data.rectTables;
      let roundTables = state.data.roundTables;
      if (clickedSeat) {
         // clickedSeat.tempPurchased = true;
         const myTicketOptions = getTicketOptionsOfObject(state, clickedSeat);
         rows = mapSeats(state.data.rows, (seat) =>
            purchaseTicketForSeat(seat, ticketId)
         );
         rectTables = mapSeats(state.data.rectTables, (seat) => ({
            ...seat,
            selected: true,
         }));
         roundTables = mapSeats(state.data.roundTables, (seat) => ({
            ...seat,
            selected: true,
         }));
      }

      const clickedShape = [...state.data.squares, ...state.data.polygons].find(
         (shape) => shape.id === state.activeTicketSelectionObjectId
      );
      if (clickedShape) {
      }

      // getOvalAroundSelectedSeats({
      //    ...state,
      //    rows,
      //    roundTables,
      //    rectTables,
      // });
      return {
         ...state,
         data: { ...state.data, rows, roundTables, rectTables },
         activeTicketSelectionObjectId: undefined,
      };
   },
};

const { Context, Provider, useContextHook } = createCustomContext<
   IVisualizerState,
   typeof functions
>({
   initialState,
   functions,
});

export const VisualizerContextProvider = Provider;
export const useVisualizerContext = useContextHook;
