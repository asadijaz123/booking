import { StringNullableChain } from "lodash";
import {
   IVisualizerData,
   IVisualizerState,
} from "../contexts/VisualizerContext";
import { distabledSeatColor, seatsLabelGenerator } from "./data";
import { sortParalellRows } from "./utils";
import Color from "color";
import { getUserId } from "./others";

export function matchRowLabelType(rows: IRow[]): IRowLabelType | undefined {
   const allLabelTypes: IRowLabelType[] = [
      "None",
      "letters-big",
      "letters-small",
      "numbers-normal",
   ];
   const originalLabels = sortParalellRows(rows).map((row) => row.label);
   const result: IRowLabelType | undefined = allLabelTypes.find((type) => {
      const myArrayOfLabels: string[] = seatsLabelGenerator[type](rows.length);
      return (
         originalLabels.length === myArrayOfLabels.length &&
         myArrayOfLabels.every((label, i) => originalLabels[i] === label)
      );
   });
   return result;
}

export const getNoOfSeatsWithoutDeleted = (row: IRow): number => {
   const deletedSeats = row.seats.filter((seat) => seat.deleted);
   return row.noOfSeats - deletedSeats.length;
};

type EntityWithSeats = IRow | IRoundTable | IRectTable;

type SeatMapperFunction<T extends EntityWithSeats> = (
   seat: ISeat,
   entity: T,
   index: number
) => ISeat;

export const mapSeats = <T extends EntityWithSeats>(
   entities: T[],
   mapFunc: SeatMapperFunction<T>
): T[] => {
   return entities.map((entity) => ({
      ...entity,
      seats: entity.seats.map((seat, i) => mapFunc(seat, entity, i)),
   }));
};
export const mapSelectedSeats = <T extends EntityWithSeats>(
   rows: T[],
   mapFunc: SeatMapperFunction<T>
) => {
   return rows.map((row) => ({
      ...row,
      seats: row.seats.map((seat, i) =>
         seat.selected ? mapFunc(seat, row, i) : seat
      ),
   }));
};

export const getAllSeats = (state: IVisualizerData): ISeat[] => {
   const allSeats = [
      ...state.roundTables.map((table) => table.seats),
      ...state.rows.map((row) => row.seats),
      ...state.rectTables.map((row) => row.seats),
   ].flat();
   return allSeats;
};

export const getAllSeatingObjects = (state: IVisualizerState) => {
   return [
      ...state.data.rows,
      ...state.data.roundTables,
      ...state.data.rectTables,
   ];
};
export const getTicketOptionsOfObject = (
   state: IVisualizerState,
   object: ISeat | ISquare | IPolygon
) => {
   const myCategory = state.data.settings.allCategories.find(
      (cat) => cat.id === object.categoryId
   );
   const myTickets = state.baseTickets.filter((ticket) =>
      myCategory?.ticketIds.includes(ticket.id)
   );
   return myTickets;
};

export const isSeatPurchased = (state: IVisualizerState, object: ISeat) => {
   const { seatSelections, zoneSelections } = state.selectionDetails;
   const isSeatPurchased = seatSelections.some(
      (sel) => sel.objectId === object.id
   );
   return isSeatPurchased;
};
export const isZonePurchased = (
   state: IVisualizerState,
   object: IPolygon | ISquare
) => {
   return false;
};
export const isObjectPurchased = (
   state: IVisualizerState,
   object: ISeat | ISquare | IPolygon
) => {
   if (object && (object as ISeat).radius) {
      // console.log("object from isobjpurchased", state.selectionDetails);
      return isSeatPurchased(state, object as ISeat);
   } else return isZonePurchased(state, object as ISquare);
};
export const isSeatBlocked = (state: IVisualizerState, seat: ISeat) => {
   const allBlocks = state.seatBlockingData.myGroups.flatMap(
      (group) => group.blocks
   );
   return allBlocks.some(
      (block) => block.numberOfSeats === 1 && block.objectId === seat.id
   );
};
export const isSeatBlockedForBooking = (
   state: IVisualizerState,
   seat: ISeat
) => {
   const allBlocks = state.seatBlockingData.allGroups.flatMap(
      (group) => group.blocks
   );
   return allBlocks.some(
      (block) => block.numberOfSeats === 1 && block.objectId === seat.id
   );
};
export const getZoneBlockCount = (state: IVisualizerState, zoneId: string) => {
   const allBlocks = state.seatBlockingData.myGroups.flatMap(
      (group) => group.blocks
   );
   const count = allBlocks.reduce(
      (ac, block) =>
         block.objectId === zoneId ? block.numberOfSeats + ac : ac,
      0
   );
   return count;
};
export const getTicketStatus = (state: IVisualizerState, object: ISeat) => {
   const { seatSelections, zoneSelections } = state.selectionDetails;
   const mySelection = seatSelections.find((sel) => sel.objectId === object.id);
   return mySelection?.objectId;
};
export const getTotalTicketsCost = (state: IVisualizerState) => {
   return 0;
};
const removeTicketFromSeat = (
   seat: ISeat,
   objectId: string,
   ticketId: string
): ISeat => ({
   ...seat,
   ticketIdSelected: undefined,
});

// export const removeTicketFromAllObjects = (
//    objectId: string,
//    ticketId: string,
//    state: IVisualizerState
// ): IVisualizerState => {
//    const allObjects = [...getAllSeats(state.data)];

//    const object = allObjects.find((object) => object.id === objectId);

//    if (object?.radius) {
//       return {
//          ...state,
//          data: {
//             ...state.data,
//             rows: mapSeats(state.data.rows, (seat) =>
//                removeTicketFromSeat(seat, objectId, ticketId)
//             ),
//             roundTables: mapSeats(state.data.roundTables, (seat) =>
//                removeTicketFromSeat(seat, objectId, ticketId)
//             ),
//             rectTables: mapSeats(state.data.rectTables, (seat) =>
//                removeTicketFromSeat(seat, objectId, ticketId)
//             ),
//          },
//       };
//    } else {
//       return {
//          ...state,
//          data: {
//             ...state.data,
//             squares: state.data.squares.map((square) =>
//                square.id === objectId
//                   ? {
//                        ...square,
//                        ticketOptions: square.ticketOptions?.map((ticketOpt) =>
//                           ticketOpt.id === ticketId
//                              ? { ...ticketOpt, purchased: 0, selected: 0 }
//                              : ticketOpt
//                        ),
//                     }
//                   : square
//             ),
//             polygons: state.data.polygons.map((polygon) =>
//                polygon.id === objectId
//                   ? {
//                        ...polygon,
//                        ticketOptions: polygon.ticketOptions?.map((ticketOpt) =>
//                           ticketOpt.id === ticketId
//                              ? { ...ticketOpt, purchased: 0, selected: 0 }
//                              : ticketOpt
//                        ),
//                     }
//                   : polygon
//             ),
//          },
//       };
//    }
// };
export const purchaseTicketForSeat = (
   seat: ISeat,
   ticketId: string
): ISeat => ({ ...seat, ticketIdSelected: ticketId });
export const isSeatSelected = (state: IVisualizerState, seat: ISeat) => {
   const { seatSelections } = state.selectionDetails;
   const selection = seatSelections.find((sel) => sel.objectId === seat.id);
   return Boolean(selection);
};
export const getSeatBlockGroup = (state: IVisualizerState, seat: ISeat) => {
   const blockingData = state.seatBlockingData;
   return blockingData.myGroups.find((group) =>
      group.blocks.some((block) => block.objectId === seat.id)
   );
};
// export const getTotalTicketsCost = (state: IVisualizerState): number => {
//    const allSeats = getAllSeats(state.data);
//    const allShapes = [...state.data.squares, ...state.data.polygons];
//    const allTickets = [
//       ...allSeats.flatMap((seat) => seat.ticketOptions),
//       ...allShapes.flatMap((shape) => shape.ticketOptions),
//    ].filter((ticket) => ticket?.purchased) as TicketOption[];
//    return allTickets.reduce(
//       (acc, ticket) => acc + ticket.purchased * ticket.price,
//       0
//    );
// };
export const isSeatSelectedByMe = (state: IVisualizerState, seat: ISeat) => {
   const { seatSelections } = state.selectionDetails;
   const selection = seatSelections.find((sel) => sel.objectId === seat.id);
   const user = JSON.parse(localStorage.getItem("user") as string);
   return selection?.userId === user.userId;
};

export const calcSeatFillColor = (
   state: IVisualizerState,
   seat: ISeat,
   filterCategoryId: string | undefined,
   myCategory: ICategory
) => {
   let color; // Declare a variable to hold the color value

   // console.log(
   //    "inside calc color",
   //    isObjectPurchased(state, seat),
   //    isSeatSelectedByMe(state, seat)
   // );
   const otherGroups = state.seatBlockingData.allGroups
      .filter((group) => group.userId !== getUserId())
      .filter((group) => group.checked);
   const allOtherBlocks = otherGroups.flatMap((group) => group.blocks);
   const isBlockedBySomeoneElse = allOtherBlocks.some(
      (block) => block.objectId === seat.id
   );
   if (state.visualizerOptions?.blocking) {
      const myBlockingGroup = getSeatBlockGroup(state, seat);
      if (myBlockingGroup) {
         return darkenColor(myCategory.color.background);
      }
      if (isBlockedBySomeoneElse) {
         return distabledSeatColor;
      }
   } else {
      const allBlocks = state.seatBlockingData.allGroups
         .filter((group) => group.checked)
         .flatMap((group) => group.blocks);
      const isBlocked = allBlocks.some((block) => block.objectId === seat.id);
      if (isBlocked) return distabledSeatColor;
   }

   // console.log(seat, "seat fill color", isObjectPurchased(seat));
   if (filterCategoryId && filterCategoryId !== seat!.categoryId) {
      color = distabledSeatColor; // Assign disabled seat color if the first condition is true
   } else if (
      isObjectPurchased(state, seat) &&
      isSeatSelectedByMe(state, seat)
   ) {
      // If the seat is purchased, darken the final category's background color
      color = darkenColor(myCategory?.color.background);
   } else if (
      isObjectPurchased(state, seat) &&
      !isSeatSelectedByMe(state, seat)
   ) {
      color = "rgba(218, 218, 218, 1)";
   } else {
      // Otherwise, use the final category's background color or a default if it's not available
      color = myCategory?.color.background || "rgba(218, 218, 218, 1)";
   }
   return color;
};
export const darkenColor = (color: string) => {
   return Color(color).darken(0.4).hex();
};

//It is used to check whether I can click seat or not.
export const isSeatBlockedForMe = (
   state: IVisualizerState,
   seat: ISeat
): boolean => {
   if (state.visualizerOptions?.blocking) {
      const otherGroups = state.seatBlockingData.allGroups.filter(
         (group) => group.userId !== getUserId()
      );
      const enabledGroups = otherGroups.filter((group) => group.checked);
      console.log("other groups from is seat blocked for me", otherGroups);
      const otherBlocks = enabledGroups.flatMap((group) => group.blocks);
      const isInOtherBlocks = otherBlocks.some(
         (block) => block.objectId === seat.id
      );
      return isInOtherBlocks;
   } else {
      const enabledGroups = state.seatBlockingData.allGroups.filter(
         (group) => group.checked
      );
      const allBlocks = enabledGroups.flatMap((group) => group.blocks);
      const isInAllBlocks = allBlocks.some(
         (block) => block.objectId === seat.id
      );
      return isInAllBlocks;
   }
};

// export const unselectSeatTicket = (
//    objects: EntityWithSeats[],
//    givenSeatId: string
// ) => {
//    return mapSeats(objects, (seat) =>
//       seat.id === givenSeatId
//          ? {
//               ...seat,
//               ticketOptions: seat.ticketOptions?.map((ticketOption) => ({
//                  ...ticketOption,
//                  purchased: 0,
//                  selected: 0,
//               })),
//            }
//          : seat
//    );
// };

export const unselectSeatTicket = (
   parentObjects: EntityWithSeats[],
   seatId: string
) => {
   return mapSeats(parentObjects, (seat) =>
      seatId === seat.id
         ? { ...seat, selected: false, ticketIdSelected: undefined }
         : seat
   );
};

export const calcPermenantBlockCountForZone = (
   state: IVisualizerState,
   zoneId: string
) => {
   const allBlocks = state.seatBlockingData.myGroups.flatMap((x) => x.blocks);
   return allBlocks
      .filter((blocking) => blocking.objectId === zoneId)
      .reduce((ac, blocking) => ac + blocking.numberOfSeats, 0);
};

export const removeDuplicateZoneBlocks = (blocks: ISeatBlock[]) => {
   const obj: { [k in string]: number } = {};
   const seatBlocks = blocks.filter((block) => block.type === "seat");
   const zoneBlocks = blocks.filter((block) => block.type === "zone");
   zoneBlocks.forEach((block) => {
      obj[block.objectId] = (obj[block.objectId] || 0) + block.numberOfSeats;
   });
   console.log(obj);

   return [
      ...Object.entries(obj).map(
         ([k, v]) =>
            ({ numberOfSeats: v, objectId: k, type: "zone" } as ISeatBlock)
      ),
      ...seatBlocks,
   ];
};
