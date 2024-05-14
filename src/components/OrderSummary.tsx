import { useMemo } from "react";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { getAllShapes, getUserId } from "../utils/others";
import {
   getAllSeatingObjects,
   getAllSeats,
   getTicketOptionsOfObject,
   getTotalTicketsCost,
   isObjectPurchased,
} from "../utils/non-geom";
import { icons } from "../helpers/icons";

interface OrderSummaryProps {}

const OrderSummary: React.FC<OrderSummaryProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const allShapes = getAllShapes(state);
   const allSeats = getAllSeats(state.data);
   const anyTicketSelected = useMemo(() => {
      return (
         allShapes.some((shape) => {
            const myTicketOptions = getTicketOptionsOfObject(state, shape);
            return isObjectPurchased(state, shape);
         }) || allSeats.some((seat) => isObjectPurchased(state, seat))
      );
   }, [allSeats, allShapes]);
   const totalCost = getTotalTicketsCost(state);
   return (
      <div className="md:flex flex-col hidden ">
         <div className="text-gray-500 font-medium text-xl mb-6">
            Order Summary
         </div>
         <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between text-gray-500">
               <div>
                  {!anyTicketSelected ? "No tickets selected" : "Tickets"}
               </div>
               <div>{totalCost}€</div>
            </div>
            <div className="grid grid-cols-[2fr_1fr_0.5fr_0.5fr] w-full gap-y-2 pb-6 border-b border-b-gray-250">
               {allSeats.map((seat, i) => {
                  const category = state.data.settings.allCategories.find(
                     (category) => category.id === seat.categoryId
                  );
                  const floorName = "Floor";
                  const categoryName = state.data.settings.allCategories.find(
                     (cat) => cat.id === seat.categoryId
                  )?.name;
                  const seatIndex = seat.index;
                  const allObjects = getAllSeatingObjects(state);
                  const parentObject = allObjects.find((object) =>
                     object.seats.some((seat2) => seat2.id === seat.id)
                  );
                  const parentObjectIndex = parentObject?.label;

                  const titleString = `${floorName}-${categoryName} ${
                     parentObject?.label || ""
                  }-${seatIndex}`;
                  const ticketOptions = getTicketOptionsOfObject(state, seat);
                  const seatSelections =
                     state.selectionDetails.seatSelections.filter(
                        (sel) => sel.userId === getUserId()
                     );
                  const myTicketOptionDetails = seatSelections.find(
                     (option) => option.objectId === seat.id
                  );
                  const myBaseTicket = ticketOptions.find(
                     (opt) => opt.id === myTicketOptionDetails?.ticketId
                  );

                  if (myBaseTicket) {
                     return (
                        <>
                           <div className="flex items-center gap-2">
                              <div
                                 className="w-5 h-5 rounded-full"
                                 style={{
                                    backgroundColor: category?.color.background,
                                 }}
                              ></div>
                              <div className="text-sm text-gray-500">
                                 {titleString}
                              </div>
                           </div>
                           <div className="text-sm text-gray-500">
                              {myBaseTicket.name}
                           </div>
                           <div className="text-sm text-gray-500">
                              {myBaseTicket.price}€
                           </div>
                           <div
                              className="flex justify-end cursor-pointer"
                              onClick={() => {
                                 dispatch({
                                    setState: { unselectedSeatId: seat.id },
                                 });
                              }}
                           >
                              {icons.sidebar.category.delete}
                           </div>
                        </>
                     );
                  }
                  return null;
               })}
               {allShapes.map((shape) => {
                  const category = state.data.settings.allCategories.find(
                     (category) => category.id === shape.categoryId
                  );
                  const floorName = "Floor";
                  const categoryName = category?.name;

                  const titleString = `${floorName}-${categoryName} ${shape.label}`;
                  const mySelectionsOfThisObject =
                     state.tempStandingZoneSelections.filter(
                        (sel) =>
                           sel.purchasedBy === getUserId() &&
                           sel.objectId === shape.id
                     );

                  // const ticketOptions = shape.ticketOptions;
                  // const myTicketOption = ticketOptions?.find(
                  //    (opt) => opt.purchased
                  // );
                  return mySelectionsOfThisObject.map((sel, i) => {
                     const myBaseTicket = state.baseTickets.find(
                        (ticket) => ticket.id === sel.ticketId
                     ) as IBaseTicketDetails;
                     return (
                        <>
                           <div className="flex items-center gap-2">
                              <div
                                 className="w-5 h-5 rounded-full"
                                 style={{
                                    backgroundColor: category?.color.background,
                                 }}
                              ></div>
                              <div className="text-sm text-gray-500 whitespace-nowrap">
                                 {titleString}
                                 <b>({sel.count})</b>
                              </div>
                           </div>
                           <div className="text-sm text-gray-500">
                              {myBaseTicket?.name}
                           </div>
                           <div className="text-sm text-gray-500">
                              {myBaseTicket?.price * sel.count}€
                           </div>
                           <div
                              className="flex justify-end cursor-pointer"
                              onClick={() =>
                                 dispatch({
                                    removeZoneTicketSelection: {
                                       objectId: sel.objectId,
                                       ticketId: sel.ticketId,
                                    },
                                 })
                              }
                           >
                              {icons.sidebar.category.delete}
                           </div>
                        </>
                     );
                  });
               })}
            </div>

            <div className="flex flex-col gap-2 mb-1">
               <div className="flex w-full justify-between items-center">
                  <div className="text-sm text-gray-500">Subtotal</div>
                  <div className="text-sm text-gray-500">0€</div>
               </div>
               <div className="flex w-full justify-between items-center">
                  <div className="text-sm text-gray-500">Operative cost</div>
                  <div className="text-sm text-gray-500">0€</div>
               </div>
               <div className="flex w-full justify-between items-center">
                  <div className="text-sm text-gray-500">Discount</div>
                  <div className="text-sm text-gray-500">0€</div>
               </div>
               <div className="flex w-full justify-between items-center">
                  <div className=" font-semibold text-gray-500">TOTAL</div>
                  <div className=" font-semibold text-purple-main">0€</div>
               </div>
            </div>
            <div className="flex flex-col">
               <div
                  className="relative w-full mb-5
               rounded
              border border-gray-30 "
               >
                  <div className="text-gray-250 absolute top-1/2 -translate-y-1/2 right-4 text-base">
                     Aplicar
                  </div>
                  <input
                     className="w-full shadow-sm text-left 0       text-base placeholder:text-gray-250"
                     placeholder="Add a promotional code"
                  ></input>
               </div>
               {state.checkoutError && (
                  <div className="text-error-500 text-xs mb-2">
                     {state.checkoutError}
                  </div>
               )}
               <button
                  className="btn btn-primary w-full"
                  onClick={() => dispatch({ onContinueToCheckout: null })}
               >
                  Continue
               </button>
            </div>
         </div>
      </div>
   );
};

export default OrderSummary;
