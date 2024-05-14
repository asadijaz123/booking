import { useEffect, useMemo, useRef, useState } from "react";

interface StepperProps {
   value: number;
   onChange: (val: number) => void;
   postfix?: string;
   step?: number;
   min?: number;
   max?: number;
   allowMinus?: boolean;
   customPlaceholder?: string;
   bgColor?: string;
   textColor?: string;
}
function useInterval(callback: Function, delay: number | null) {
   const savedCallback = useRef<Function>();

   useEffect(() => {
      savedCallback.current = callback;
   }, [callback]);

   useEffect(() => {
      function tick() {
         savedCallback.current?.();
      }
      if (delay !== null) {
         let id = setInterval(tick, delay);
         return () => clearInterval(id);
      }
   }, [delay]);
}

const Stepper: React.FC<StepperProps> = ({
   value,
   onChange,
   postfix = "",
   step = 1,
   min = -Infinity,
   max = Infinity,
   allowMinus = false,
   customPlaceholder,
   bgColor = "#6777CC",
   textColor = "white",
}) => {
   const [isMouseDownOnPlus, setIsMouseDownOnPlus] = useState(false);
   const [isMouseDownOnMinus, setIsMouseDownOnMinus] = useState(false);
   const [minus, setMinus] = useState(false);
   const [empty, setEmpty] = useState(false);
   useInterval(
      () => value + step <= max && onChange(value + step),
      isMouseDownOnPlus ? 150 : null
   );
   useInterval(
      () => value - step >= min && onChange(value - step),
      isMouseDownOnMinus ? 150 : null
   );
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target;
      const re = allowMinus ? /^-?[0-9\b]+$/ : /^[0-9\b]+$/;

      //if value is not empty and also doesn't match the regex
      if (target.value === "-" && allowMinus) {
         onChange(0);
         setMinus(true);
         return;
      } else {
         setMinus(false);
      }
      if (target.value === "") {
         setEmpty(true);
         onChange(0);
         return;
      } else {
         setEmpty(false);
      }
      if (target.value !== "" && !re.test(target.value)) {
         return;
      }
      const val = Number(e.target.value);
      if (val < min || val > max) return;
      onChange(Number(target.value));
   };
   const finalValue = useMemo(() => {
      if (minus) return "-";
      if (empty) return "";
      else return value;
   }, [value, empty, minus]);
   return (
      <div className="flex flex-row items-center justify-center w-full h-9">
         <div
            onClick={() => value - step >= min && onChange(value - step)}
            onMouseDown={() => setIsMouseDownOnMinus(true)}
            onMouseUp={() => setIsMouseDownOnMinus(false)}
            onMouseLeave={() => setIsMouseDownOnMinus(false)}
            className="h-9 flex w-9 justify-center items-center aspect-square cursor-pointer bg-gray-500 text-2xl font-semibold text-white rounded-sm-md select-none"
         >
            -
         </div>
         <div className="bg-white flex justify-center items-center h-full flex-grow text-xs">
            <input
               className="w-16"
               value={customPlaceholder ? "" : finalValue}
               onChange={handleChange}
               placeholder={customPlaceholder}
            />
            {postfix}
         </div>
         <div
            style={{ backgroundColor: bgColor, color: "white" }}
            onClick={() => value + step <= max && onChange(value + step)}
            onMouseDown={() => setIsMouseDownOnPlus(true)}
            onMouseUp={() => setIsMouseDownOnPlus(false)}
            onMouseLeave={() => setIsMouseDownOnPlus(false)}
            className={`h-9 w-9 flex justify-center items-center cursor-pointer  aspect-square text-2xl bg-purple-bright font-semibold text-white rounded-sm-md select-none`}
         >
            +
         </div>
      </div>
   );
};

export default Stepper;
