import { useEffect, useMemo, useRef, useState } from "react";
import * as Ably from "ably";
import { gsap, Power0 } from "gsap";
import {
   getRotationDotPointFromSelectionRect,
   indexToRotationDot,
   toolToCursorTypeObject,
   zoomAnimationDuration,
} from "../utils/data";
import {
   changeRectToStandardRect,
   correctRowPoints,
   findPointOnLineAtDistance,
   getAllRowGroups,
   getAllSeatPoints,
   getAngleBetweenLines,
   getBoundingRectOfCircles,
   getDistance,
   getEnclosingRectangle,
   getNoOfSeats,
   getRandomId,
   getRectAroundRowsToRender,
   getRectAroundSeats,
   getRelativeMousePos,
   getRelativeTouchPos,
   getRoundTableRadius,
   getSeatsBySeatIds,
   getSelectedRowsRect,
   getSelectionLinesAroundRect,
   getViewboxForZoom,
   isPointInsideRect,
   makeRowPointsForRect,
   rectTableToCenteredRect,
   rotateRows,
   rotateSelectionRect,
   roundToNearest,
   tableToCircle,
} from "../utils/utils";
import Row from "./Row";
import RowGroup from "./RowGroup";
import classNames from "classnames";
import RoundTable from "./RoundTable";
import {
   calculateGeneralZoom,
   comparePoints,
   getUserId,
} from "../utils/others";
import RectTable from "./RectTable";
import Square from "./Square";
import Polygon from "./Polygon";
import { getAllSeats, getTicketOptionsOfObject } from "../utils/non-geom";
import CategoryFilterSelect from "../basecomponents/CategoryFilterSelect";
import {
   IVisualizerData,
   useVisualizerContext,
} from "../contexts/VisualizerContext";
import { set } from "lodash";
import { icons } from "../helpers/icons";
import MiniMap from "./MiniMap";
import TicketSelectionDialog from "./TicketSelectionDialog";
import ObjectHoverCard from "./ObjectHoverCard";
import SelectedSeatsOval from "./SelectedSeastsOval";
import { useParams } from "react-router-dom";
import {
   updateSeatSelection,
   updateZoneSelection,
} from "../apis/ticketSelection";
import SessionFilterSelect from "../basecomponents/SessionFilterSelect";
import ZoneBlockingDialog from "../dialogs/ZoneBlockingDialog";
import CreateBlockGroupDialog from "./CreateBlockGroupDialog";
import { updateSeatBlocking } from "../apis/seatBlocking";
import EditBlockGroupDialog from "./EditBlockGroupDialog";
export interface VisualizerProps {
   planId: string; //done
   backendHost: string; //done
   tickets: IBaseTicketDetails[]; //done
   userId: string; //done
   ablyKey: string; // done
   categoryTicketMapping: { [k in string]: string[] }; // done
   onObjectStatusChanged?: (data: GetSelectionAndBlockingResponse) => void; // done;
   onClick?: (e: MouseEvent) => void; //done
   onRendered?: (
      planData: IVisualizerData,
      selections: GetTicketSelectionAndPurchaseResponse
   ) => void; //done
   showLabels?: boolean; //done
   showZoneLabels?: boolean; //done
   hiddenCategoires?: string[]; // done
   seatingZoneRender?: SeatingZoneRender; //later
   colors?: {
      main: string;
      buttonTextColor: string;
   }; //done;
   showMinimap?: boolean; //done;
   fullTable?: boolean; //later;
   userSession?: UserSessionType; //later;
   timeHold?: number; //later;
   userLang?: string; //later;
   seatValidation?: SeatValidationType; //later;
   initialFloor?: number;
   blocking: boolean;
   customData?: IVisualizerData;
}
const Visualizer: React.FC<VisualizerProps> = ({
   planId,
   backendHost,
   tickets,
   userId,
   ablyKey,
   categoryTicketMapping,
   onObjectStatusChanged,
   onRendered,
   showLabels = false,
   showZoneLabels = true,
   hiddenCategoires = [],
   seatingZoneRender = "always",
   colors = { main: "#6777CC", buttonTextColor: "white" },
   showMinimap = true,
   fullTable = false,
   userSession = "restart",
   timeHold = 15 * 60,
   userLang = "",
   seatValidation = "normal",
   onClick,
   blocking,
   customData,
}) => {
   const svgRef = useRef<SVGSVGElement | null>(null);
   const [state, dispatch] = useVisualizerContext();

   const params = useParams();
   const { settings, rows, rowGroups, testPoints, roundTables } = state.data;
   const wrapperRef = useRef<HTMLDivElement | null>(null);
   const [tempZoomProps, setTempZoomProps] = useState({
      viewbox: { x: 0, y: 0 },
      height: 0,
      width: 0,
   });

   useEffect(() => {
      if (onClick) {
         svgRef.current?.addEventListener("click", onClick);
         return () => svgRef.current?.removeEventListener("click", onClick);
      }
   }, [onClick]);
   useEffect(() => {
      dispatch({
         setState: {
            visualizerOptions: {
               ablyKey,
               backendHost,
               categoryTicketMapping,
               colors,
               fullTable,
               hiddenCategoires,
               planId,
               seatingZoneRender,
               seatValidation,
               showLabels,
               showMinimap,
               showZoneLabels,
               tickets,
               timeHold,
               userId,
               userLang,
               userSession,
               blocking,
            },
         },
      });
   }, [
      ablyKey,
      backendHost,
      categoryTicketMapping,
      colors.main,
      colors.buttonTextColor,
      fullTable,
      JSON.stringify(hiddenCategoires),
      planId,
      seatingZoneRender,
      seatValidation,
      showLabels,
      showMinimap,
      showZoneLabels,
      tickets,
      timeHold,
      userId,
      userLang,
      userSession,
      blocking,
   ]);

   const selectedRows = rows.filter((x) => x.selected);
   useEffect(() => {
      localStorage.setItem("userId", "userid1");
      localStorage.setItem("user", JSON.stringify({ userId: userId }));
   }, []);
   useEffect(() => {
      dispatch({ setState: { baseTickets: tickets } });
   }, [tickets]);

   useEffect(() => {
      if (state.unselectedSeatId) {
         const mySelection = state.selectionDetails.seatSelections.find(
            (selection) => selection.objectId === state.unselectedSeatId
         );
         updateSeatSelection(backendHost, {
            objectId: state.unselectedSeatId,
            planId: state.data.planId,
            selectionType: "seat",
            status: "unselected",
            ticketId: mySelection?.ticketId || "",
            userId: JSON.parse(localStorage.getItem("user") as string).userId,
         })
            .then(() => {})
            .catch((err) => {
               alert(err);
            });
      }
   }, [state.unselectedSeatId]);
   useEffect(() => {
      if (state.seatIdForApiCall) {
         const seat = getAllSeats(state.data).find(
            (x) => x.id === state.seatIdForApiCall
         ) as ISeat;
         const ticketOptions = getTicketOptionsOfObject(state, seat);
         updateSeatSelection(backendHost, {
            objectId: state.seatIdForApiCall,
            planId: state.data.planId,
            selectionType: "seat",
            status: "selected",
            ticketId: ticketOptions[0].id,
            userId: JSON.parse(localStorage.getItem("user") as string).userId,
         })
            .then(() => {})
            .catch((err) => {
               alert(err);
            });
      }
   }, [state.seatIdForApiCall]);
   useEffect(() => {
      localStorage.setItem("user", JSON.stringify({ userId: userId }));
   }, []);

   // useEffect(() => {
   //    const client = new Ably.Realtime.Promise({
   //       key: ablyKey,
   //       clientId: userId,
   //    });

   //    const channel = client.channels.get(`${planId}`);
   //    channel.presence.enter("online").catch(console.error);
   //    channel.subscribe((data) => {
   //       const message: GetSelectionAndBlockingResponse = JSON.parse(data.data);
   //       console.log("Message from ably", message);
   //       onObjectStatusChanged?.(message);
   //       dispatch({
   //          setState: {
   //             selectionDetails: { ...state.selectionDetails, ...message },
   //             tempStandingZoneSelections: message.zoneSelections,
   //          },
   //       });
   //       dispatch({
   //          setBlockingData: { myGroups: JSON.parse(message.blockingData) },
   //       });
   //    });

   //    return () => {
   //       // Automatically leaves presence when the component unmounts or the connection closes
   //       channel.presence.leave();
   //       channel.unsubscribe(planId);
   //    };
   // }, [planId]);
   useEffect(() => {
      return;
      const client = new Ably.Realtime.Promise({
         key: ablyKey,
         clientId: userId,
      });

      const channel = client.channels.get(`${planId}`);
      channel.presence.enter("online").catch(console.error);
      channel.subscribe((data) => {
         const message: GetSelectionAndBlockingResponse = JSON.parse(data.data);
         onObjectStatusChanged?.(message);
         const allBlockingGroups = JSON.parse(
            message.blockingData
         ) as IBlockingGroup[];
         const myBlockingGroups = allBlockingGroups.filter(
            (group) => group.userId === getUserId()
         );
         const isSessionGroupMissing = !myBlockingGroups.some(
            (group) => group.value === "a"
         );
         if (isSessionGroupMissing) {
            console.log("session block missing");
            myBlockingGroups.push({
               blocks: [],
               checked: false,
               letter: "A",
               value: "a",
               title: "Session Block",
               userId: getUserId(),
            });
         }

         console.log("selection details", message);
         dispatch({
            setState: {
               selectionDetails: { ...state.selectionDetails, ...message },
               tempStandingZoneSelections: message.zoneSelections,
            },
            setBlockingData: {
               myGroups: myBlockingGroups,
               allGroups: allBlockingGroups,
            },
         });
      });

      return () => {
         // Automatically leaves presence when the component unmounts or the connection closes
         channel.presence.leave();
         channel.unsubscribe(planId);
      };
   }, [planId, getUserId]);

   const availableSeats = getAllSeats(state.data as IVisualizerData)
      .filter((x) => x.status !== "not-available")
      .filter(
         (seat) =>
            !state.filterCategoryId ||
            seat.categoryId !== state.filterCategoryId
      ).length;

   useEffect(() => {
      if (state.zoneSelectionsToSendForApi) {
         updateZoneSelection(backendHost, {
            selectionType: "standing-zone",
            planId,
            selections: state.zoneSelectionsToSendForApi.filter(
               (item) => item.purchasedBy === userId
            ),
            status: "selected",
            userId: userId,
         }).then((data) => {});
      }
   }, [state.zoneSelectionsToSendForApi]);
   useEffect(() => {
      // document.write("<h1>Effect is called<h1>");
      if (customData) {
         console.log("custom data", customData);
         let planData = customData as IVisualizerData;
         const newCategories = planData.settings.allCategories.map((cat) => ({
            ...cat,
            ticketIds: categoryTicketMapping[cat.id] || [],
         }));

         planData = {
            ...planData,
            settings: {
               ...planData.settings,
               allCategories: newCategories,
            },
            squares: planData.squares.map((square: ISquare) => ({
               ...square,
               objectType: "square",
            })),

            rows: planData.rows.map((row: IRow) => ({
               ...row,
               objectType: "row",
               seats: row.seats.map((seat) => ({
                  ...seat,
               })),
            })),
            roundTables: planData.roundTables.map((table: IRoundTable) => ({
               ...table,
               objectType: "round-table",
               seats: table.seats.map((seat) => ({
                  ...seat,
               })),
            })),
         };

         onRendered?.(planData, {
            seatPurchases: [],
            seatSelections: [],
            zonePurchases: [],
            zoneSelections: [],
         });
         dispatch({
            setData: planData,
            setState: { planLoaded: true },
         });
         return;
      }
      fetch(`${backendHost}/api/plan/selections/${planId}`)
         .then((res) => res.json())
         .then((selectionsData: GetTicketSelectionAndPurchaseResponse) => {
            dispatch({
               setState: {
                  selectionDetails: selectionsData,
                  tempStandingZoneSelections: selectionsData.zoneSelections,
               },
            });
            fetch(`${backendHost}/api/plan/${planId}`)
               .then((res) => res.json())
               .then((data: string) => {
                  const plan = JSON.parse(data);
                  let planData = JSON.parse(plan.data) as IVisualizerData;
                  const newCategories = planData.settings.allCategories.map(
                     (cat) => ({
                        ...cat,
                        ticketIds: categoryTicketMapping[cat.id] || [],
                     })
                  );

                  planData = {
                     ...planData,
                     settings: {
                        ...planData.settings,
                        allCategories: newCategories,
                     },
                     squares: planData.squares.map((square: ISquare) => ({
                        ...square,
                        objectType: "square",
                     })),

                     rows: planData.rows.map((row: IRow) => ({
                        ...row,
                        objectType: "row",
                        seats: row.seats.map((seat) => ({
                           ...seat,
                        })),
                     })),
                     roundTables: planData.roundTables.map(
                        (table: IRoundTable) => ({
                           ...table,
                           objectType: "round-table",
                           seats: table.seats.map((seat) => ({
                              ...seat,
                           })),
                        })
                     ),
                  };
                  onRendered?.(planData, selectionsData);
                  dispatch({
                     setData: planData,
                     setState: { planLoaded: true },
                  });
               });
         });
   }, [planId]);

   useEffect(() => {
      if (!state.planLoaded) return;
      const height = wrapperRef.current?.clientHeight || 0;
      const width = wrapperRef.current?.clientWidth || 0;
      const selectionRect = getSelectedRowsRect(
         state.data.rows.map(correctRowPoints).map(makeRowPointsForRect),
         [
            ...state.data.roundTables.map((table) => ({
               center: table.centerBeforeRotation || table.center,
               radius: getRoundTableRadius(table).enclosingRadius,
            })),

            ...state.data.rectTables.flatMap((table) =>
               (table.seatsBeforeRotation || table.seats).map((seat) => ({
                  center: seat.position,
                  radius: 10,
               }))
            ),
         ],

         [],
         state.data.squares,
         state.data.polygons
         // state.rectTables
         //    .filter((x) => x.selected)
         //    .map(rectTableToCenteredRect)
      );
      const planHeight = Math.abs(selectionRect.start.y - selectionRect.end.y);
      const planWidth = Math.abs(selectionRect.start.x - selectionRect.end.x);
      console.log(
         "svgHeight",
         state.svgHeight,
         state.svgWidth,
         state.planLoaded
      );
      const generalZoom = calculateGeneralZoom(
         height,
         width,
         planHeight,
         planWidth
      );

      dispatch({
         setState: {
            generalZoom,
            currentZoom: generalZoom,
            viewboxAnimationData: {
               current: {
                  x: 0,
                  y: 0,
                  height: state.svgHeight / generalZoom,
                  width: state.svgWidth / generalZoom,
               },
               target: {
                  x: 0,
                  y: 0,
                  height: state.svgHeight / generalZoom,
                  width: state.svgWidth / generalZoom,
               },
            },
         },
      });
   }, [state.svgWidth, state.svgHeight, state.planLoaded]);
   const intervalRef = useRef<number | null>(null);
   useEffect(() => {
      dispatch({
         setState: {
            svgHeight: wrapperRef.current?.clientHeight || 0,
            svgWidth: wrapperRef.current?.clientWidth || 0,
         },
      });
      const func = () => {
         dispatch({
            setState: {
               svgHeight: wrapperRef.current?.clientHeight || 0,
               svgWidth: wrapperRef.current?.clientWidth || 0,
            },
         });
      };
      window.addEventListener("resize", func);
      return () => {
         window.removeEventListener("resize", func);
      };
   }, []);
   // useEffect(() => {
   //    console.log(
   //       "effect ran",
   //       state.currentZoom,
   //       state.tempCurrentZoom,
   //       state.zoomCenterPoint
   //    );
   //    if (state.zoomAnimationRunning) {
   //       setTimeout(() => {
   //          dispatch({
   //             setState: { viewboxAnimationData: {} },
   //          });
   //       }, 0);
   //       // viewBox={`${state.viewboxOffset.x} ${state.viewboxOffset.y} ${
   //       //    (wrapperRef.current?.clientWidth || 0) / state.currentZoom
   //       // } ${
   //       //    (wrapperRef.current?.clientHeight || 0) / state.currentZoom
   //       // }`}
   //    } else {
   //       dispatch({ setState: { zoomAnimationRunning: false } });
   //    }
   // }, [state.currentZoom, state.tempCurrentZoom]);
   useEffect(() => {
      // if (state.zoomAnimationRunning) {
      //    setTimeout(() => {
      //       svgRef.current!.style.transition = "none";

      //       dispatch({
      //          setState: {
      //             zoomAnimationRunning: false,
      //             viewboxAnimationData: {
      //                current: { ...state.viewboxAnimationData!.target },
      //                target: { ...state.viewboxAnimationData!.target },
      //             },
      //          },
      //       });
      //    }, zoomAnimationDuration);
      // }
      if (state.viewboxAnimationData && state.zoomAnimationRunning) {
         const tempObj = { ...state.viewboxAnimationData.current };
         gsap.to(tempObj, {
            ...state.viewboxAnimationData?.target,
            duration: zoomAnimationDuration / 1000,
            ease: Power0.easeIn,

            onUpdate: (obj, abc, abd) => {
               dispatch({
                  setState: {
                     viewboxAnimationData: {
                        current: tempObj,
                        target: state.viewboxAnimationData!.target,
                     },
                  },
               });
            },
            onComplete: () => {
               dispatch({ setState: { zoomAnimationRunning: false } });
            },
         });
      }
   }, [state.zoomAnimationRunning]);
   const renderRemoveFilters = () => {
      if (state.removeFilterDialog) {
         return (
            <div
               className="flex flex-col p-2.5 bg-white shadow-sm gap-1.5 items-center rounded-md absolute z-20"
               style={{
                  top: state.removeFilterDialog?.y,
                  left: state.removeFilterDialog?.x,
               }}
            >
               <div className="text-10px">Blocked by filter</div>
               <div
                  className="text-purple-main font-bold text-xs cursor-pointer"
                  onClick={() => {
                     dispatch({
                        setState: {
                           filterCategoryId: "",
                           removeFilterDialog: undefined,
                        },
                     });
                  }}
               >
                  Remove Filters
               </div>
            </div>
         );
      }
   };
   const tempViewbox = useMemo(() => {
      console.log(
         "zoom animation running",
         state.zoomAnimationRunning,
         state.viewboxOffset
      );
      return state.zoomAnimationRunning
         ? state.viewboxAnimationData!.current
         : state.viewboxOffset;
   }, [
      state.zoomAnimationRunning,
      state.viewboxAnimationData,
      state.viewboxOffset,
   ]);
   console.log("viewbox offset in component log", state.viewboxOffset);
   const translateValues = useMemo(() => {
      const svgCenterX = state.svgWidth / 2;
      const svgCenterY = state.svgHeight / 2;
      const svgTranslateX = state.zoomAnimationRunning
         ? svgCenterX - state.zoomCenterPoint!.x
         : 0;
      const svgTranslateY = state.zoomAnimationRunning
         ? svgCenterY - state.zoomCenterPoint!.y
         : 0;
      return { x: svgTranslateX, y: svgTranslateY };
   }, [
      state.zoomAnimationRunning,
      state.zoomCenterPoint,
      state.svgHeight,
      state.svgWidth,
   ]);
   useEffect(() => {
      if (svgRef.current) {
         svgRef.current.addEventListener(
            "touchmove",
            (e: TouchEvent) => {
               e.preventDefault(); // Optionally prevent the default to avoid scrolling and other touch behaviors
               e.stopPropagation();
               if (!e.touches.length) return;
               else if (e.touches.length === 2) {
                  const point1 = getRelativeTouchPos(
                     e.touches[0],
                     svgRef.current
                  );
                  const point2 = getRelativeTouchPos(
                     e.touches[1],
                     svgRef.current
                  );

                  dispatch({
                     onTwoFingerMove: {
                        newDistance: getDistance(point1, point2),
                        touch1: point1,
                        touch2: point2,
                     },
                  });
               } else {
                  dispatch({
                     onMouseMove: getRelativeTouchPos(
                        e.touches[0], // Using the first touch point
                        svgRef.current
                     ),
                  });
               }
            },
            { passive: false }
         );
         svgRef.current.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
               e.preventDefault();
               e.stopPropagation();
               if (!e.touches.length) return;
               else if (e.touches.length === 2) {
                  const point1 = getRelativeTouchPos(
                     e.touches[0],
                     svgRef.current
                  );
                  const point2 = getRelativeTouchPos(
                     e.touches[1],
                     svgRef.current
                  );
                  dispatch({
                     onTwoFingerZoomStart: {
                        initDistance: getDistance(point1, point2),
                        points: [point1, point2],
                     },
                  });
               } else {
                  // alert("touches " + e.touches.length);
                  dispatch({
                     onMouseDown: getRelativeTouchPos(
                        e.touches[0],
                        svgRef.current
                     ),
                  });
               }
            },
            { passive: false }
         );
         svgRef.current.addEventListener(
            "touchend",
            (e: TouchEvent) => {
               e.preventDefault();
               e.stopPropagation();

               // if (!e.touches.length) return;
               // alert("touches " + );
               if (state.twoFingerZooming) {
                  dispatch({ onTwoFingerZoomEnd: null });
               } else {
                  dispatch({
                     onMouseUp: getRelativeTouchPos(
                        e.changedTouches[e.changedTouches.length - 1],
                        svgRef.current
                     ),
                  });
               }
            },

            { passive: false }
         );
         // onTouchStart={(e: React.TouchEvent) => {
         //
         // }}
         // onTouchEnd={(e: React.TouchEvent) => {
         //    e.preventDefault();
         //    e.stopPropagation();
         //    if (!e.changedTouches.length) return;
         //    dispatch({
         //       onMouseUp: getRelativeTouchPos(
         //          e.changedTouches[0], // Directly passing the Touch object
         //          svgRef.current
         //       ),
         //    });
         // }}
      }
   }, [planId, state.twoFingerZooming]);
   const applySeatBlocking = async () => {
      updateSeatBlocking(backendHost, {
         groups: state.seatBlockingData.myGroups.map((group) => ({
            ...group,
            userId: getUserId(),
         })),
         planId,
      })
         .then((res) => {
            alert("Seat blocking updated");
         })
         .catch((err) => {
            alert(err);
         });
   };
   return (
      <div
         className={classNames(
            ` flex  relative overflow-hidden h-full w-full  bg-white `
         )}
         ref={wrapperRef}
      >
         <TicketSelectionDialog></TicketSelectionDialog>
         <ZoneBlockingDialog></ZoneBlockingDialog>
         <CreateBlockGroupDialog></CreateBlockGroupDialog>
         <EditBlockGroupDialog></EditBlockGroupDialog>
         {/* {state.generalZoom !== state.currentZoom && <MiniMap></MiniMap>} */}
         {showMinimap && <MiniMap></MiniMap>}
         <div
            className="relative bg-white mx-auto my-auto h-full w-full"
            id="svg-wrapper"
            style={
               {
                  // height: settings.height,
                  // width: settings.width,
                  // minWidth: settings.width,
               }
            }
         >
            <button
               className="absolute bottom-4 right-4 btn btn-primary px-6 cursor-pointer z-20"
               onClick={applySeatBlocking}
            >
               Save
            </button>
            <ObjectHoverCard></ObjectHoverCard>
            {/* <div className="absolute left-1/2 -translate-x-1/2 select-none z-50">
               x: {state.mouse.x} y: {state.mouse.y}
            </div> */}
            {renderRemoveFilters()}
            {/* <div className="h-4 w-4 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div> */}
            <div className="flex h-12 items-center justify-center bg-white text-base shadow-badge rounded-sm-md px-7 w-fit z-30 relative top-4 left-4 select-none">
               {availableSeats} seats available
            </div>
            {state.currentZoom !== state.generalZoom && (
               <div
                  onClick={() =>
                     dispatch({
                        onClickOnZoomOut: undefined,
                     })
                  }
                  className="flex items-center px-4 justify-center bg-white text-base shadow-badge rounded-sm-md z-30 absolute h-12 w-12 bottom-4 right-4 select-none cursor-pointer"
               >
                  {icons.visualizer.zoomOut}
               </div>
            )}
            <div className="absolute top-4 right-4 z-20">
               <>
                  {state.visualizerOptions?.blocking ? (
                     <SessionFilterSelect
                        onChange={() => {}}
                        options={[...state.seatBlockingData.myGroups]}
                     ></SessionFilterSelect>
                  ) : (
                     <CategoryFilterSelect
                        color={state.visualizerOptions?.colors.main}
                        value={state.filterCategoryId}
                        onChange={(value) =>
                           dispatch({ setState: { filterCategoryId: value } })
                        }
                        options={[
                           {
                              data: {
                                 name: "All Categories",
                                 color: { background: "", foreground: "black" },
                                 disablity: false,
                                 id: "",
                                 ticketIds: [],
                              },
                              value: "",
                           },
                           ...state.data.settings.allCategories
                              .slice(1)
                              .map((opt) => ({
                                 data: opt,
                                 value: opt.id,
                              })),
                        ]}
                     ></CategoryFilterSelect>
                  )}
               </>
            </div>
            {settings.backgroundImage && (
               <img
                  className="absolute top-0 left-0 w-full h-full "
                  src={settings.backgroundImage}
                  style={{ opacity: settings.backgroundOpacity / 100 }}
               />
            )}
            <svg
               id="main-svg"
               ref={svgRef}
               viewBox={`${tempViewbox.x.toFixed(2)} ${tempViewbox.y.toFixed(
                  2
               )} ${state.viewboxAnimationData?.current.width} ${
                  state.viewboxAnimationData?.current.height
               }`}
               style={{
                  height: state.svgHeight,
                  width: state.svgWidth,
                  // transformOrigin: `${state.zoomCenterPoint?.x}px ${state.zoomCenterPoint?.y}px`,
                  // transform: `scale(${
                  //    state.zoomAnimationRunning
                  //       ? state.zoomType === "in"
                  //          ? 2
                  //          : 0.5
                  //       : 1
                  // }) translate(${translateValues.x || 0}px,${
                  //    translateValues.y || 0
                  // }px)`,

                  // transition: `${
                  //    state.zoomAnimationRunning
                  //       ? `transform ${zoomAnimationDuration}ms ease-in`
                  //       : "none"
                  // }`,
               }}
               className={classNames(
                  "z-10 absolute top-0 left-0 w-full h-full "
               )}
               onMouseMove={(e: React.MouseEvent) => {
                  dispatch({
                     onMouseMove: getRelativeMousePos(
                        e,
                        svgRef.current || undefined
                     ),
                  });
               }}
               onMouseDown={(e: React.MouseEvent) => {
                  dispatch({
                     onMouseDown: getRelativeMousePos(
                        e,
                        svgRef.current || undefined
                     ),
                  });
               }}
               onMouseUp={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  dispatch({
                     onMouseUp: getRelativeMousePos(
                        e,
                        svgRef.current || undefined
                     ),
                  });
               }}
            >
               <g>
                  {roundTables.map((table, index) => (
                     <RoundTable table={table}></RoundTable>
                  ))}
               </g>
               <g>
                  {state.data.rectTables.map((table, index) => (
                     <RectTable table={table}></RectTable>
                  ))}
               </g>
               {rowGroups.map((group) => (
                  <RowGroup rowGroup={group}></RowGroup>
               ))}
               {state.data.squares.map((sq) => (
                  <Square square={sq}></Square>
               ))}
               {state.data.polygons.map((poly) => (
                  <Polygon polygon={poly}></Polygon>
               ))}
               <SelectedSeatsOval></SelectedSeatsOval>
               {/* {state.data.tool === 6 ? (
                  <RectTable
                     table={setSeatsOfRectTable({
                        angle: 0,
                        angleBeforeRotation: 0,
                        center: mouse,
                        height: state.rectTableOptions.height,
                        id: getRandomId(),
                        label: "",
                        lastCreated: false,
                        reverseLabel: state.rectTableOptions.reverseLabel,
                        seats: [],
                        seatsBottom: state.rectTableOptions.seatsBottom,
                        seatsLabelType: state.rectTableOptions.seatsLabelType,
                        seatsLeft: state.rectTableOptions.seatsLeft,
                        seatsRight: state.rectTableOptions.seatsRight,
                        seatsTop: state.rectTableOptions.seatsTop,
                        width: state.rectTableOptions.width,
                        selected: false,
                        startingAt: "",
                     })}
                     isDummy
                  ></RectTable>
               ) : null} */}
               {/* {state.tool === 5 ? (
                  <RoundTable
                     table={setSeatsOfRoundTable({
                        angle: 0,
                        angleBeforeRotation: 0,
                        center: mouse,
                        id: getRandomId(),
                        label: "",
                        lastCreated: false,
                        reverseLabel: state.roundTableOptions.reverseLabel,
                        seats: [],
                        seatsLabelType: state.roundTableOptions.seatsLabelType,
                        selected: false,
                        startingAt: "",
                        categoryId: "",
                        noOfSeats: state.roundTableOptions.noOfSeats,
                     })}
                     isDummy
                  ></RoundTable>
               ) : null} */}
               {/* <circle
                  cx={selectionRectToRender.start.x}
                  cy={selectionRectToRender.start.y}
                  r={6}
                  fill="blue"
               ></circle>
               <circle
                  cx={selectionRectToRender.end.x}
                  cy={selectionRectToRender.end.y}
                  r={6}
                  fill="blue"
               ></circle>
               <circle
                  cx={selectionRectToRender.start.x}
                  cy={selectionRectToRender.end.y}
                  r={6}
                  fill="blue"
               ></circle>
               <circle
                  cx={selectionRectToRender.end.x}
                  cy={selectionRectToRender.start.y}
                  r={6}
                  fill="blue"
               ></circle> */}
               {/* {mouseDragRect && (
                  <rect
                     fill="none"
                     x={mouseDragRect.start?.x}
                     height={mouseDragRect.end.y - mouseDragRect.start!.y}
                     width={mouseDragRect.end.x - mouseDragRect.start!.x}
                     y={mouseDragRect.start!.y}
                     className="stroke-gray-500 stroke-1"
                     strokeDasharray="3, 3"
                  ></rect>
               )} */}
               {/* <g
                  transform={
                     isRotating
                        ? `rotate(${angle} ${selectionCenterPoint.x} ${selectionCenterPoint.y})`
                        : ""
                  }
               > */}
               {/* <rect
                     onMouseDown={(e) => {
                        e.stopPropagation();
                        dispatch({ onMoveStart: null });
                     }}
                     fill="none"
                     x={selectionRect.start.x}
                     height={selectionRect.end.y - selectionRect.start.y}
                     width={selectionRect.end.x - selectionRect.start.x}
                     y={selectionRect.start.y}
                     className="stroke-green-500 stroke-2 cursor-move fill-transparent"
                     strokeDasharray="3, 3"
                  ></rect>
                  <rect
                     onMouseDown={(e) => {
                        e.stopPropagation();
                        dispatch({ onMoveStart: null });
                     }}
                     fill="none"
                     x={rectAroundCircles.start.x}
                     height={
                        rectAroundCircles.end.y - rectAroundCircles.start.y
                     }
                     width={rectAroundCircles.end.x - rectAroundCircles.start.x}
                     y={rectAroundCircles.start.y}
                     className="stroke-red-500 stroke-1 cursor-move fill-transparent"
                     strokeDasharray="3, 3"
                  ></rect> */}

               {/* <rect
                     onMouseUp={(e) => {
                        dispatch({
                           onMouseUpOnSelectionRect: getRelativeMousePos(
                              e,
                              svgRef.current || undefined
                           ),
                        });
                     }}
                     onMouseDown={(e) => {
                        e.stopPropagation();
                        dispatch({
                           onMoveStart: getRelativeMousePos(
                              e,
                              svgRef.current || undefined
                           ),
                        });
                     }}
                     fill="none"
                     x={selectionRectToRender.start.x}
                     height={
                        selectionRectToRender.end.y -
                        selectionRectToRender.start.y
                     }
                     width={
                        selectionRectToRender.end.x -
                        selectionRectToRender.start.x
                     }
                     y={selectionRectToRender.start.y}
                     className={classNames(
                        "stroke-blue-main stroke-1 fill-transparent",
                        { "cursor-mover": !cursor }
                     )}
                     strokeDasharray="3, 3"
                  ></rect>

                  {!dontRenderSelectionRect &&
                     selectionRectPoints.map((point, i) => (
                        <rect
                           x={point.x - selectionRectPointRectSize / 2}
                           y={point.y - selectionRectPointRectSize / 2}
                           height={selectionRectPointRectSize}
                           width={selectionRectPointRectSize}
                           className="stroke-blue-main stroke-1 fill-gray-250 cursor-rotate"
                           onMouseDown={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              dispatch({ startRotate: indexToRotationDot[i] });
                           }}
                        ></rect>
                     ))} */}
               {/* {selectionLines.map((line) => (
                     <line
                        x1={line.p1.x}
                        x2={line.p2.x}
                        y1={line.p1.y}
                        y2={line.p2.y}
                        stroke="green"
                        strokeWidth={1}
                     ></line>
                  ))} */}
               {/* </g> */}

               {/* {rows.map((row) => (
                  <>
                     <use
                        onMouseDown={(e) => {
                           e.stopPropagation();
                           dispatch({ onMouseDownOnRowSizeDot: row.id });
                        }}
                        xlinkHref={`#start-rowresize-rect-${row.id}`}
                     ></use>
                     <use
                        onMouseDown={(e) => {
                           e.stopPropagation();
                           dispatch({ onMouseDownOnRowSizeDot: row.id });
                        }}
                        xlinkHref={`#end-rowresize-rect-${row.id}`}
                     ></use>
                  </>
               ))} */}

               {/* {allModifiedSeats.map((seat) => (
                  <circle
                     fill="green"
                     r={3}
                     cx={seat.position.x}
                     cy={seat.position.y}
                  ></circle>
               ))} */}
               <g></g>

               {/* {allSeats.map((seat) => (
                  <circle
                     cx={seat.position.x}
                     cy={seat.position.y}
                     r={2}
                     className="fill-black"
                  ></circle>
               ))} */}

               {/* {state.rectTables.map(rectTableToCenteredRect).map((rect) => (
                  <circle
                     cx={rect.center.x - rect.width / 2}
                     cy={rect.center.y - rect.height / 2}
                     r={10}
                     fill="pink"
                  ></circle>
               ))} */}
               {/* <circle
                  cx={selectionCenterPoint.x}
                  cy={selectionCenterPoint.y}
                  fill="red"
                  r={3}
               ></circle> */}

               <circle cx={500} cy={1500} fill="black" r={10}></circle>
               {/* <circle
                  cx={state.zoomCenterPoint?.x}
                  cy={state.zoomCenterPoint?.y}
                  fill="blue"
                  r={50}
               ></circle> */}

               {/* {state.rectTables
                  .flatMap((table) => table.seats)
                  .map((seat) => (
                     <circle
                        cx={seat.position.x}
                        cy={seat.position.y}
                        r={3}
                        fill="red"
                     ></circle>
                  ))} */}
            </svg>
         </div>
      </div>
   );
};

export default Visualizer;
