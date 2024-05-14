import classNames from "classnames";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { icons } from "../helpers/icons";
import {
   calcPermenantBlockCountForZone,
   getAllSeats,
   getTicketOptionsOfObject,
} from "../utils/non-geom";
import Stepper from "../basecomponents/Stepper";
import { useState } from "react";
import { updateSeatSelection } from "../apis/ticketSelection";
import { getSeatId, getUserId } from "../utils/others";

interface ZoneBlockingDialogProps {}

const ZoneBlockingDialog: React.FC<ZoneBlockingDialogProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const [noTicketError, setNoTicketError] = useState(false);

   const objectId = state.seatBlockingData.zoneBlockingDialogData?.zoneId;
   const allSeats = getAllSeats(state.data);
   const seat = allSeats.find((seat) => seat.id === objectId);

   const allShapes = [...state.data.polygons, ...state.data.squares];
   const shape = allShapes.find((seat) => seat.id === objectId);

   console.log(state.seatBlockingData.zoneBlockingDialogData?.counts, "counts");
   if (shape) {
      // return null;
      const floorName = "Floor";
      const categoryName = state.data.settings.allCategories.find(
         (cat) => cat.id === shape?.categoryId
      )?.name;
      const titleString = `${floorName}-${categoryName}`;
      const ticketOptions = getTicketOptionsOfObject(state, shape);
      const mySelections = state.tempStandingZoneSelections.filter(
         (sel) => sel.objectId === shape.id
      );

      const myPurchases = state.selectionDetails.zonePurchases.filter(
         (sel) => sel.objectId === shape.id
      );
      const allBlockGroups = state.seatBlockingData.myGroups;
      return (
         <>
            <div className="h-full w-full bg-gray-250 absolute z-40 "></div>
            <div className="grid grid-cols-1 grid-rows-[min-content_auto_min-content] gap-4 bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-50 absolute w-fit rounded-lg min-w-[20rem]">
               <div className="flex flex-col w-full overflow-auto">
                  <div className="flex justify-between items-center mb-1.5">
                     <div className="text-gray-300 text-xs">
                        Select tickets to block
                     </div>
                     <div
                        className="cursor-pointer"
                        onClick={() =>
                           dispatch({
                              setBlockingData: {
                                 zoneBlockingDialogData: undefined,
                              },
                           })
                        }
                     >
                        {icons.general.closeBig}
                     </div>
                  </div>
                  <div className="text-gray-500 font-raleway font-medium">
                     {titleString}
                  </div>
               </div>
               <div className="flex flex-col relative w-full gap-1.5 overflow-auto pr-2 max-h-40">
                  {allBlockGroups?.map((group, i) => {
                     const totalCapacity = shape.capacityData.reduce(
                        (ac, item) => item.capcity + ac,
                        0
                     );
                     const selectionsAndPurchases = [
                        ...state.selectionDetails.zonePurchases,
                        ...state.selectionDetails.zoneSelections,
                     ];
                     const permenantBlockedCount =
                        calcPermenantBlockCountForZone(
                           state,
                           state.seatBlockingData.zoneBlockingDialogData
                              ?.zoneId || ""
                        );

                     const tempBlocked =
                        state.seatBlockingData.zoneBlockingDialogData?.counts.find(
                           (c) => c.blockValue === group.value
                        )?.count || 0;
                     const totalCountOfNonAvailable =
                        selectionsAndPurchases.reduce(
                           (ac, a) => ac + a.count,
                           0
                        );
                     const totalAvailable =
                        totalCapacity -
                        totalCountOfNonAvailable -
                        tempBlocked -
                        permenantBlockedCount;

                     return (
                        <div
                           // onClick={() => {
                           //    dispatch({
                           //       purchaseTicket:
                           //          state.activeTicketSelectionObjectId,
                           //    });
                           // }}
                           className={classNames(
                              "grid grid-cols-2 gap-12 items-center pb-1.5  border-b-gray-250 cursor-pointer",
                              {
                                 "border-b-0": allBlockGroups.length - 1 === i,
                                 "border-b": allBlockGroups.length - 1 !== i,
                              }
                           )}
                        >
                           <div className="flex flex-col h-full w-full gap-1.5">
                              <div className="text-gray-500 font-raleway font-medium">
                                 {group.title}
                              </div>
                              <div className="text-gray-300 text-xs items-center">
                                 {" "}
                                 {totalAvailable} tickets available
                              </div>
                           </div>
                           <div className="flex flex-col items-center  gap-1.5">
                              <Stepper
                                 bgColor={state.visualizerOptions?.colors.main}
                                 textColor={
                                    state.visualizerOptions?.colors
                                       .buttonTextColor
                                 }
                                 value={tempBlocked}
                                 onChange={(value) => {
                                    console.log(
                                       state.seatBlockingData
                                          .zoneBlockingDialogData?.counts
                                    );
                                    const newCounts =
                                       state.seatBlockingData.zoneBlockingDialogData?.counts.map(
                                          (countItem) =>
                                             countItem.blockValue ===
                                             group.value
                                                ? { ...countItem, count: value }
                                                : { ...countItem }
                                       );
                                    console.log("new counts", newCounts);
                                    dispatch({
                                       setBlockingData: {
                                          zoneBlockingDialogData: {
                                             counts: newCounts || [],
                                             zoneId: shape.id,
                                          },
                                       },
                                    });
                                 }}
                                 max={totalCapacity}
                              ></Stepper>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <div className="  w-full  flex flex-col gap-4">
                  <div className="text-error-500 text-sm">
                     {noTicketError && "Please select at least one to continue"}
                  </div>
                  <div className="flex gap-4 items-center">
                     <button
                        style={{
                           borderColor: state.visualizerOptions?.colors.main,
                        }}
                        className="btn  bg-white text-purple-main hover:bg-purple-main hover:text-white transition-all duration-250 border  rounded-md w-full"
                        onClick={() => {
                           dispatch({
                              setBlockingData: {
                                 zoneBlockingDialogData: undefined,
                              },
                           });
                        }}
                     >
                        Cancel
                     </button>
                     <button
                        style={{
                           backgroundColor:
                              state.visualizerOptions?.colors.main,
                        }}
                        className="btn  btn-primary rounded-md w-full"
                        onClick={async () => {
                           const isAnyTicketSelected =
                              state.seatBlockingData.zoneBlockingDialogData?.counts.some(
                                 (countItem) => countItem.count !== 0
                              );
                           if (!isAnyTicketSelected) {
                              setNoTicketError(true);
                           } else {
                              setNoTicketError(false);

                              dispatch({
                                 confirmZoneBlockings: null,
                              });
                           }
                        }}
                     >
                        Add tickets
                     </button>
                  </div>
               </div>
            </div>
         </>
      );
   } else return null;
};

export default ZoneBlockingDialog;
