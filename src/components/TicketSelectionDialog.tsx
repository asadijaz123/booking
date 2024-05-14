import classNames from "classnames";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { icons } from "../helpers/icons";
import { getAllSeats, getTicketOptionsOfObject } from "../utils/non-geom";
import Stepper from "../basecomponents/Stepper";
import { useState } from "react";
import { updateSeatSelection } from "../apis/ticketSelection";
import { getSeatId, getUserId } from "../utils/others";

interface TicketSelectionDialogProps {}

const TicketSelectionDialog: React.FC<TicketSelectionDialogProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const [noTicketError, setNoTicketError] = useState(false);

   const { activeTicketSelectionObjectId: objectId } = state;
   const allSeats = getAllSeats(state.data);
   const seat = allSeats.find((seat) => seat.id === objectId);

   const allShapes = [...state.data.polygons, ...state.data.squares];
   const shape = allShapes.find((seat) => seat.id === objectId);
   if (seat) {
      const floorName = "Floor";
      const categoryName = state.data.settings.allCategories.find(
         (cat) => cat.id === seat.categoryId
      )?.name;
      const seatIndex = seat.index;
      const rowId = seat.rowId;
      const titleString = `${floorName}-${categoryName} ${rowId}-${seatIndex}`;
      const ticketOptions = getTicketOptionsOfObject(state, seat);
      return (
         <>
            <div className="h-full w-full bg-gray-250 absolute z-40 "></div>
            <div className="flex flex-col gap-4 bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-50 absolute w-fit rounded-lg min-w-[20rem] max-h-60">
               <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center mb-1.5">
                     <div className="text-gray-300 text-xs">
                        Select Ticket Option
                     </div>
                     <div
                        className="cursor-pointer"
                        onClick={() =>
                           dispatch({
                              setState: {
                                 activeTicketSelectionObjectId: undefined,
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
               <div className="flex flex-col w-full gap-1.5 overflow-auto pr-2">
                  {ticketOptions?.map((ticketOption, i) => (
                     <div
                        onClick={async () => {
                           dispatch({
                              selectTicket: ticketOption.id,
                           });
                           const res = await updateSeatSelection(
                              state.visualizerOptions!.backendHost,
                              {
                                 planId: state.data.planId,
                                 objectId: getSeatId(seat),
                                 selectionType: "seat",
                                 ticketId: ticketOption.id,
                                 userId: JSON.parse(
                                    localStorage.getItem("user") as string
                                 ).userId,
                                 status: "selected",
                              }
                           );
                           if (res.error) {
                              window.alert(res.error);
                           }
                        }}
                        className={classNames(
                           "grid grid-cols-2 items-center pb-1.5  border-b-gray-250 cursor-pointer",
                           {
                              "border-b-0": ticketOptions.length - 1 === i,
                              "border-b": ticketOptions.length - 1 !== i,
                           }
                        )}
                     >
                        <div className="flex flex-col h-full w-full gap-1.5">
                           <div className="text-gray-500 font-raleway font-medium">
                              {ticketOption.name}
                           </div>
                           <div className="text-gray-300 text-xs">
                              {" "}
                              {ticketOption.price} €
                           </div>
                        </div>
                        <div className="flex w-full justify-end">
                           {icons.visualizer.chevromLeftBig}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </>
      );
   } else if (shape) {
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
      return (
         <>
            <div className="h-full w-full bg-gray-250 absolute z-40 "></div>
            <div className="grid grid-cols-1 grid-rows-[min-content_auto_min-content] gap-4 bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-50 absolute w-fit rounded-lg min-w-[20rem]">
               <div className="flex flex-col w-full overflow-auto">
                  <div className="flex justify-between items-center mb-1.5">
                     <div className="text-gray-300 text-xs">
                        Select Ticket Option
                     </div>
                     <div
                        className="cursor-pointer"
                        onClick={() =>
                           dispatch({
                              setState: {
                                 activeTicketSelectionObjectId: undefined,
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
                  {ticketOptions?.map((ticketOption, i) => {
                     const totalCapacity =
                        shape.capacityData.find(
                           (item) => item.ticketId === ticketOption.id
                        )?.capcity || 0;

                     const thisTicketSelections = mySelections.filter(
                        (sel) => sel.ticketId === ticketOption.id
                     );

                     const totalSelected = thisTicketSelections.reduce(
                        (ac, sel) => ac + sel.count,
                        0
                     );
                     console.log(
                        thisTicketSelections,
                        "this ticket selections",
                        mySelections
                     );
                     console.log(totalSelected, "total selected");
                     const thisUserSelection = thisTicketSelections.find(
                        (sel) => sel.purchasedBy === getUserId()
                     );
                     console.log("this user selection", thisUserSelection);
                     const available = totalCapacity - totalSelected;
                     return (
                        <div
                           // onClick={() => {
                           //    dispatch({
                           //       purchaseTicket:
                           //          state.activeTicketSelectionObjectId,
                           //    });
                           // }}
                           className={classNames(
                              "grid grid-cols-2 items-center pb-1.5  border-b-gray-250 cursor-pointer",
                              {
                                 "border-b-0": ticketOptions.length - 1 === i,
                                 "border-b": ticketOptions.length - 1 !== i,
                              }
                           )}
                        >
                           <div className="flex flex-col h-full w-full gap-1.5">
                              <div className="text-gray-500 font-raleway font-medium">
                                 {ticketOption.name}
                              </div>
                              <div className="text-gray-300 text-xs items-center">
                                 {" "}
                                 {ticketOption.price} | {available} available
                              </div>
                           </div>
                           <div className="flex flex-col items-center  gap-1.5">
                              <Stepper
                                 bgColor={state.visualizerOptions?.colors.main}
                                 textColor={
                                    state.visualizerOptions?.colors
                                       .buttonTextColor
                                 }
                                 value={thisUserSelection?.count || 0}
                                 onChange={(value) =>
                                    dispatch({
                                       changeStandingZoneTicketData: {
                                          objectId: shape.id,
                                          count: value,
                                          ticketId: ticketOption.id,
                                       },
                                    })
                                 }
                                 max={totalCapacity}
                              ></Stepper>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <div className="  w-full  flex flex-col gap-4">
                  <div className="text-error-500 text-sm">
                     {noTicketError && "Please select a ticket option."}
                  </div>
                  <button
                     style={{
                        backgroundColor: state.visualizerOptions?.colors.main,
                     }}
                     className="btn  btn-primary rounded-md w-full"
                     onClick={() => {
                        const myAllSelections =
                           state.tempStandingZoneSelections.filter(
                              (sel) =>
                                 sel.purchasedBy === getUserId() &&
                                 sel.objectId === shape.id
                           );
                        const isAnyTicketSelected = myAllSelections.some(
                           (sel) => sel.count
                        );
                        if (!isAnyTicketSelected) {
                           setNoTicketError(true);
                        } else {
                           setNoTicketError(false);
                           dispatch({ purchaseStandingZoneTickets: null });
                        }
                     }}
                  >
                     Select Tickets
                  </button>
               </div>
            </div>
         </>
      );
   } else return null;
};

export default TicketSelectionDialog;
