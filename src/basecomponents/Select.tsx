import { useEffect, useRef, useState } from "react";
import { icons } from "../helpers/icons";
import classNames from "classnames";

interface ISelectOption<Value extends string = string> {
   text: string;
   value: Value;
}
interface SelectProps<Value extends string = string> {
   options: ISelectOption<Value>[];
   value?: Value;
   onChange: (value: Value) => void;
   openUp?: boolean;
   placeholder?: string;
}

const Select = <Value extends string = string>({
   onChange,
   options,
   value,
   openUp,
   placeholder,
}: SelectProps<Value>) => {
   const [open, setOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
      const func = (e: MouseEvent) => {
         if (!wrapperRef?.current?.contains?.(e?.target as HTMLElement)) {
            setOpen(false);
         }
      };
      window.addEventListener("click", func);
      return () => window.removeEventListener("click", func);
   }, []);

   const selectedOption = options.find((x) => x.value === value);

   return (
      <>
         <div className="flex  relative w-full" ref={wrapperRef}>
            <div
               className="flex items-center rounded-sm-md bg-white px-2 py-1.5 w-full cursor-pointer"
               onClick={() => setOpen(!open)}
            >
               <div
                  className="flex-grow flex items-center justify-center text-center text-xs text-icon-enabled "
                  style={{ lineHeight: "150%" }}
               >
                  {selectedOption?.text || placeholder || ""}
               </div>
               {open ? icons.general.caretUp : icons.general.caretDown}
            </div>
            <div
               className={classNames(
                  `flex flex-col py-4 px-2 gap-2 transition-all bg-white absolute top-full mt-1 left-0 rounded-sm-md z-10 shadow-sm w-full`,
                  {
                     "scale-100": open,
                     "scale-0": !open,
                     "top-0 -translate-y-full": openUp,
                  }
               )}
            >
               {options.map((opt) => (
                  <div className="justify-between flex items-center cursor-pointer">
                     <div
                        className="text-xs flex-grow ml-2 text-gray"
                        onClick={() => {
                           onChange(opt.value);
                           setOpen(false);
                        }}
                     >
                        {opt.text}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </>
   );
};

export default Select;
