import { useEffect, useRef, useState } from "react";
import { icons } from "../helpers/icons";
import classNames from "classnames";
import { defaultMainColor } from "../utils/data";

interface ISelectOption<Value extends string = string> {
   data: ICategory;
   value: Value;
}
interface SelectProps<Value extends string = string> {
   options: ISelectOption<Value>[];
   value?: Value;
   onChange: (value: Value) => void;
   openUp?: boolean;
   placeholder?: string;
   color?: string;
}

const CategoryFilterSelect = <Value extends string = string>({
   onChange,
   options,
   value,
   openUp,
   placeholder,
   color = defaultMainColor,
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
         <div
            className="flex  relative w-full overflow-visible "
            ref={wrapperRef}
         >
            <div
               className={classNames(
                  "flex items-center  rounded-sm-md bg-white h-12 w-12 justify-center cursor-pointer shadow-sm relative",
                  {
                     [`text-[${color}]`]: Boolean(value),
                  }
               )}
               onClick={() => setOpen(!open)}
            >
               {icons.visualizer.dropdown}
               {Boolean(value) && (
                  <div className="bg-orange-500 h-[5px] w-[5px] rounded-full absolute bottom-1/4 right-1/4 translate-x-0.5 translate-y-0.5"></div>
               )}
            </div>
            <div
               className={classNames(
                  `flex flex-col py-6 px-1 ap-2 transition-all bg-white absolute top-full mt-1 right-0 rounded-sm-md z-10 shadow-sm w-fit whitespace-nowrap max-h-56 overflow-auto`,
                  {
                     "scale-100": open,
                     "scale-0": !open,
                     "top-0 -translate-y-full": openUp,
                  }
               )}
            >
               {options.map((opt) => (
                  <div
                     className="gap-2 flex items-center cursor-pointer hover:bg-gray-250 transition-all duration-150 px-2"
                     onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                     }}
                  >
                     <div
                        className={classNames(
                           `rounded-full h-3 w-3  border-purple-main`,
                           { border: opt.value === value }
                        )}
                        style={{
                           borderColor: color,
                           backgroundColor: opt.data.color.background,
                        }}
                     ></div>

                     <div className="flex flex-col">
                        <div
                           className={classNames(
                              "text-gray-500 text-base font-semibold"
                           )}
                           style={{
                              color: value === opt.value ? color : undefined,
                           }}
                        >
                           {opt.data.name}
                        </div>
                        <div className="text-gray-300 text-xs">
                           $2.00 - $ 15.00
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </>
   );
};

export default CategoryFilterSelect;
