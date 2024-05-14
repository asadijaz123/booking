interface ICategory {
   id: string;
   name: string;
   disablity: boolean;
   color: ICategoryColor;
   ticketIds: string[];
}
type Point = { x: number; y: number };
type IRowLabelPosition = "left-right" | "left" | "right" | "none";
type ISeatLabelType =
   | "numbers-normal"
   | "numbers-even"
   | "numbers-center"
   | "numbers-odd"
   | "letters-small"
   | "letters-big";

type IRowLabelType =
   | "numbers-normal"
   | "letters-small"
   | "letters-big"
   | "None";

interface ISeatChangeInfo {
   noOfSeats: number;
   position: "start" | "end";
}
interface IRow {
   radius: number;
   start: Point;
   end: Point;
   gapping: number;
   beingCreated?: boolean;
   label: string;
   noOfSeats: number;
   curve: number;
   skew: number;
   labelPosition: IRowLabelPosition;
   seatsLabelType: number;
   startingAt: string;
   reverseLabel: boolean;
   selected?: boolean;
   positionBeforeRotation?: { start: Point; end: Point };
   angle: number;
   angleBeforeRotation: number;
   center: Point;
   groupId?: string;
   rowSpacing: number;
   labelType: ISeatLabelType;
   id: string;
   ignoreDeletedSeatsForLabels: boolean;
   positionBeforeMovement?: Rect;
   lessNoOfSeats?: boolean;
   positionBeforeRowSizeChange?: Rect;
   recentNoOfSeatsChange?: number;
   seats: ISeat[];
   seatChangeInfo?: ISeatChangeInfo;

   objectType: "row";
}
interface IToolOption {
   text: string;
   icon?: JSX.Element;
   onClick?: () => void;
}

type ITool = {
   options?: IToolOption[];
   text: string;
   icon: JSX.Element;
   onClick?: () => void;
};

interface ICategoryColor {
   background: string;
   foreground?: string;
}
type IRotationDot = `${"top" | "bottom"}-${"left" | "right"}`;

interface IRoundTable {
   id: string;
   categoryId: string;
   center: Point;
   noOfSeats: number;
   seatsLabelType: ISeatLabelType;
   label: string;
   lastCreated: boolean;
   selected: boolean;
   reverseLabel: boolean;
   centerBeforeRotation?: Point;
   centerBeforeMovement?: Point;
   startingAt: string;
   seats: ISeat[];
   angle: number;
   angleBeforeRotation: number;
   objectType: "round-table";
}

interface IRectTableOptions {
   height: number;
   width: number;

   seatsTop: number;

   seatsLeft: number;
   seatsRight: number;
   seatsBottom: number;

   seatsLabelType: ISeatLabelType;
   label: string;
   startingAt: string;
   reverseLabel: boolean;
   seats: ISeat[];
}
interface IRectTable {
   id: string;
   height: number;
   width: number;
   angle: number;
   angleBeforeRotation: number;

   seatsTop: number;

   seatsLeft: number;
   seatsRight: number;
   seatsBottom: number;
   center: Point;

   seatsLabelType: ISeatLabelType;
   label: string;
   lastCreated: boolean;
   selected: boolean;
   reverseLabel: boolean;
   centerBeforeRotation?: Point;
   centerBeforeMovement?: Point;
   startingAt: string;
   seats: ISeat[];
   seatsBeforeRotation?: ISeat[];
   objectType: "rect-table";
}
type ObjectType = "rect-table" | "round-table" | "row" | "square" | "polygon";
type FigureType = "circle" | "square" | "polygon";
type ShapeType = "normal" | "seating" | "standing";

interface DefaultShapeOptions {
   figureType: FigureType;
   shapeType: ShapeType;
}
interface ISquare {
   capacityData: { ticketId: string; capcity: number }[];
   start: Point;
   height: number;
   width: number;
   beingCreated: boolean;
   selected: boolean;
   id: string;
   rounded: boolean;
   angle: number;
   angleBeforeRotation: number;
   startBeforeMovement?: Point;
   startBeforeRotation?: Point;
   label: string;
   color: string;
   type: ShapeType;
   colorType: ShapeColorType;
   staged?: boolean;
   categoryId: string;
   seats: ISeat[];
   objectType: "square";
}

type SeatClickData = {
   seatId: string;
   time: number;
};

type ShapeColorType = "filled" | "border";
interface ColorDialogData {
   color: string;
   position: Point;
   open: boolean;
   mousedownPoint?: Point;
   mouse?: Point;
   positionBeforeMovement?: Point;
   colorType: ShapeColorType;
}
interface IPolygon {
   capacityData: { ticketId: string; capcity: number }[];
   objectType: "polygon";
   points: Point[];
   pointsBeforeMovement?: Point[];
   pointsBeforeRotation?: Point[];
   beingCreated: boolean;
   selected: boolean;
   id: string;
   color: string;
   label: string;
   type: ShapeType;
   colorType: ShapeColorType;
   staged?: boolean;
   categoryId: string;
   seats: ISeat[];
}

type IExpansionType = "normal" | "curved";
interface IShapeOptions {
   height: number;
   width: number;
   label: string;
   color: string;
   expansionType: IExpansionType;
   staged: boolean;
}

type IObjectWithSeats = IRow | IRoundTable | IRectTable | ISquare | IPolygon;
interface IMultipleObjectOptions {
   label: string;
   seatsLabelType: ISeatLabelType;
   reverseLabel: boolean;
}

interface IRowOptions {
   noOfSeats: number;
   curve: number;
   skew: number;
   gapping: number;
   labelPosition: IRowLabelPosition;
   label: string;
   angle: number;
   labelType: ISeatLabelType;
   startingAt: string;
   reverseLabel: boolean;
}
interface CenteredRect {
   center: Point;
   width: number;
   height: number;
   angle: number;
}
interface IMultipleRowOptions {
   rowsLabelType: IRowLabelType;
   noOfRows: number;
   rowSpacing: number;
   noOfSeats: number;
   curve: number;
   skew: number;
   gapping: number;
   labelPosition: IRowLabelPosition;
   label: string;
   angle: number;
   labelType: ISeatLabelType;
   startingAt: string;
   rowStyle: number;
   reverseLabel: boolean;
   reverseRowsLabel: boolean;
   rowsLabelStartingAt: string;
}
interface ICircle {
   center: Point;
   radius: number;
}
interface IRoundTableOptions {
   noOfSeats: number;
   seatsLabelType: ISeatLabelType;
   label: string;
   reverseLabel: boolean;
   startingAt: string;
}

interface ISeat {
   id: string;
   index: number;
   rowId: string;
   position: Point;

   radius: number;
   seatType?: ISeatType;
   label?: string;
   status?: ISeatAvailable;
   labelModified?: boolean;
   ticketIdSelected?: string;
   selected: boolean;
   deleted: boolean;
   recentlyDeleted: boolean;
   categoryId?: string;
   location?: ISeatLocation;
   objectType: "seat";
}
type SeatingObject = IRow | IRoundTable | IRectTable;
interface TicketOption {
   name: string;
   price: number;
   available: number;
   selected: number;
   purchased: number;
   id: string;
}

type ISeatLocation = "top" | "right" | "bottom" | "left";
type ISeatType = "seat" | "chair" | "stool" | "bench";
type ISeatAvailable = "available" | "not-available";
type Entries<T> = {
   [K in keyof T]: [K, T[K]];
}[keyof T][];
interface LineEquation {
   a: number;
   b: number;
   c: number;
}
interface IRowGroup {
   rowSpacing: number;
   rowsLabelType: IRowLabelType;
   rowsLabelStartingAt: string;
   reverseRowsLabel: boolean;
   selected: boolean;
   beingCreated: boolean;
   id: string;
   rowStyle: number;
   noOfRows: number;
}
interface Rect {
   start: Point;
   end: Point;
}

interface ISelectOption<Value extends string = string> {
   text: string;
   value: Value;
}

interface IValidationError {
   noOfSeats: number;
   type: string;
   objectIdToSelect: string;
}

type ICursor =
   | "cursor-rotate"
   | "cursor-resize-row"
   | "cursor-row-selector"
   | "cursor-seat-selector"
   | "cursor-close-hand"
   | "cursor-open-hand"
   | "cursor-mover"
   | "cursor-create";

interface IPlan {
   id: string;
   title: string;
   desccription: string;
   published: boolean;
   private: boolean;
   type: number;
   createdAt: number;
   editedAt: number;
}

type SeatingZoneRender = "always" | "afterZoom";
type UserSessionType = "keep" | "restart";
type SeatValidationType = "normal" | "no-orphan-seats";

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
interface IVisualizerOptions {
   planId: string;
   backendHost: string;
   tickets: IBaseTicketDetails[];
   userId: string;
   ablyKey: string;
   categoryTicketMapping: { [k in string]: string[] };
   showLabels: boolean;
   showZoneLabels: boolean;
   hiddenCategoires: string[];
   seatingZoneRender: SeatingZoneRender;
   colors: {
      main: string;
      buttonTextColor: string;
   };
   showMinimap: boolean;
   fullTable: boolean;
   userSession: UserSessionType;
   timeHold: number;
   userLang: string;
   seatValidation: SeatValidationType;
   blocking: boolean;
}
