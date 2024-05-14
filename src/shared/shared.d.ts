interface IPublishPlanRequestBody {
   planData: string;
   userId: string;
   planId: string;
}

interface SeatSelectionData {
   planId: string;
   ticketId: string;
   selectionType: "seat";
   objectId: string;
   userId: string;
   status: "selected" | "purchased" | "unselected";
}

interface StandingZoneTicketSelection {
   objectId: string;
   ticketId: string;
   count: number;
   purchasedBy: string;
}

interface StandingZoneSelectionData {
   planId: string;
   selectionType: "standing-zone";
   selections: StandingZoneTicketSelection[];
   status: "selected" | "purchased";
   userId: string;
}
// type SeatVisualizerStatus = "selected" | "purchased";
interface SeatSelectionResponse {
   objectId: string;
   ticketId: string;
   userId: string;
   // status: SeatVisualizerStatus;
}
interface ZoneSelectionResponse {
   objectId: string;
   ticketId: string;
   count: number;
   purchasedBy: string;
}
interface GetTicketPurchaseResponse {
   seatPurchases: SeatSelectionResponse[];
   zonePurchases: ZoneSelectionResponse[];
}
interface GetTicketSelectionResponse {
   seatSelections: SeatSelectionResponse[];
   zoneSelections: ZoneSelectionResponse[];
}

interface GetSelectionAndBlockingResponse {
   seatSelections: SeatSelectionResponse[];
   zoneSelections: ZoneSelectionResponse[];
   blockingData: string;
}

type GetTicketSelectionAndPurchaseResponse = GetTicketPurchaseResponse &
   GetTicketSelectionResponse;

type UpdateSelectionRequestBody = StandingZoneSelectionData | SeatSelectionData;
interface ISeatBlock {
   objectId: string;
   numberOfSeats: number;
   type: "seat" | "zone";
}

interface IBlockingGroup {
   title: string;
   value: string;
   blocks: ISeatBlock[];
   letter: string;
   checked: boolean;
   userId: string;
}

interface UpdateSeatBlockingRequestBody {
   planId: string;
   groups: IBlockingGroup[];
}
interface IZoneTicketOption {
   id: string;
   purchases: IZoneTicketPurchaseItem[];
   total: number;
}
interface StandingZoneTotalTicketMapping {
   objectId: string;
   total: number;
}

interface IBaseTicketDetails {
   name: string;
   price: number;
   id: string;
   priceFormat?: (val: number) => string;
}
interface ITicketSeatOption {
   id: string;
   purchased: boolean;
   purchasedBy: string;
}
interface IZoneTicketPurchaseItem {
   purchasedBy: string;
   count: number;
}

interface IZoneTicketOption {
   id: string;
   purchases: IZoneTicketPurchaseItem[];
   total: number;
}

type ErrorKey = "seat-not-available" | "zone-ticket-limit-reached";
