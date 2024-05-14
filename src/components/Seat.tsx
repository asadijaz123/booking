import classNames from "classnames";
import {
   calcSeatFillColor,
   isObjectPurchased,
   isSeatPurchased,
} from "../utils/non-geom";
import { useState } from "react";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { isObject } from "lodash";

interface SeatProps {
   seat: ISeat;
   i: number;
}

const Seat: React.FC<SeatProps> = ({ seat }) => {
   return <></>;
};

export default Seat;
