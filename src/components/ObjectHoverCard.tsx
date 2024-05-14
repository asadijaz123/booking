import classNames from "classnames";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { getTicketOptionsOfObject, isObjectPurchased } from "../utils/non-geom";

interface ObjectHoverCardProps {}

const ObjectHoverCard: React.FC<ObjectHoverCardProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   if (!state.hoveredObject) {
      return <></>;
   }
   if (state.hoveredObject) {
      const hoveredObject = state.hoveredObject as ISquare;
      const category = state.data.settings.allCategories.find(
         (x) => x.id === hoveredObject.categoryId
      );
      const tickets = getTicketOptionsOfObject(state, hoveredObject);
      const allPrices = tickets.map((ticket) => ticket.price);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      const firstTicket = tickets[0];
      const isDisabled =
         state.filterCategoryId &&
         hoveredObject.categoryId !== state.filterCategoryId;

      if (isDisabled) return <></>;
      if ((state.hoveredObject as ISquare).type === "standing") {
         const ticketAvailable = true;
         return (
            <div
               className="flex flex-col py-3 px-5 bg-white shadow-sm gap-0 items-center rounded-md absolute z-20"
               style={{ top: state.mouse.y + 10, left: state.mouse.x + 10 }}
            >
               <div className="text-gray-300 text-xs">{category?.name}</div>
               <div className="text-gray-300 text-xs">Floor 1: Palco</div>
               <div className="text-base text-gray-500 font-semibold">
                  {minPrice === maxPrice
                     ? firstTicket.priceFormat
                        ? firstTicket.priceFormat(minPrice)
                        : `$${minPrice}`
                     : `${
                          firstTicket.priceFormat
                             ? firstTicket.priceFormat(minPrice)
                             : `$${minPrice}`
                       } - ${
                          firstTicket.priceFormat
                             ? firstTicket.priceFormat(maxPrice)
                             : `$${maxPrice}`
                       }`}
               </div>
               {ticketAvailable && (
                  <div className="text-gray-500 font-bold text-xs">
                     50 tickets available
                  </div>
               )}
               {!ticketAvailable && (
                  <div className="text-error-500 font-bold text-xs">
                     no tickets available
                  </div>
               )}
            </div>
         );
      } else if ((state.hoveredObject as ISeat)?.radius) {
         const seat = state.hoveredObject as ISeat;
         const myRow = state.data.rows.find((row) => row.id === seat.rowId);
         const ticketAvailable = true;

         if (state.currentZoom !== 1) return <></>;
         return (
            <div
               className="flex flex-col  py-3 px-5 bg-white shadow-sm gap-0 items-center rounded-md absolute z-20"
               style={{ top: state.mouse.y + 10, left: state.mouse.x + 10 }}
            >
               <div className="text-gray-300 text-xs">{category?.name}</div>
               <div
                  className={classNames("text-xs", {
                     "text-gray-300": !ticketAvailable,
                     "text-gray-500": ticketAvailable,
                  })}
               >
                  Floor 1: Palco
               </div>
               <div
                  className={classNames("text-xs", {
                     "text-gray-300": !ticketAvailable,
                     "text-gray-500": ticketAvailable,
                  })}
               >
                  Seat {seat.index} Row {myRow?.label}
               </div>
               {ticketAvailable && (
                  <div className="text-base text-gray-500 font-semibold">
                     {minPrice === maxPrice
                        ? firstTicket.priceFormat
                           ? firstTicket.priceFormat(minPrice)
                           : `$${minPrice}`
                        : `${
                             firstTicket.priceFormat
                                ? firstTicket.priceFormat(minPrice)
                                : `$${minPrice}`
                          } - ${
                             firstTicket.priceFormat
                                ? firstTicket.priceFormat(maxPrice)
                                : `$${maxPrice}`
                          }`}
                  </div>
               )}
               {!ticketAvailable && (
                  <div className="text-error-500 font-bold text-xs">
                     Not available
                  </div>
               )}
               {isObjectPurchased(state, hoveredObject) && (
                  <div className="text-purple-main font-bold text-xs">
                     Selected Seat
                  </div>
               )}
            </div>
         );
      } else return <></>;
   } else return <></>;
};

export default ObjectHoverCard;
