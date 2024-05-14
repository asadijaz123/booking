import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { icons } from "../helpers/icons";
import CustomSwitch from "./CustomSwitch";
import { useVisualizerContext } from "../contexts/VisualizerContext";

interface SessionFilterSelectProps {
   options: IBlockingGroup[];
   value?: string;
   onChange: (value: string) => void;
   openUp?: boolean;
   placeholder?: string;
   color?: string;
}

const SessionFilterSelect: React.FC<SessionFilterSelectProps> = ({
   onChange,
   options,
   openUp,
   color,
   placeholder,
   value,
}) => {
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
   const [state, dispatch] = useVisualizerContext();
   const sessionGroup = state.seatBlockingData.myGroups.find(
      (group) => group.value === "a"
   );
   const sessionGroupSelectionsCount = sessionGroup?.blocks.reduce(
      (ac, a) => ac + a.numberOfSeats,
      0
   );
   return (
      <>
         <div
            className="flex  relative w-full overflow-visible "
            ref={wrapperRef}
         >
            <div
               className={classNames(
                  "flex items-center  rounded-sm-md bg-white py-2 px-4 gap-4 justify-center cursor-pointer shadow-sm relative",
                  {
                     [`text-[${color}]`]: Boolean(value),
                  }
               )}
               onClick={() => setOpen(!open)}
            >
               <div
                  className={classNames(
                     `rounded-full h-4 w-4 border-purple-main text-purple-main text-xxs border font-bold flex justify-center items-center`
                  )}
               >
                  A
               </div>
               <div className="flex flex-col">
                  <div
                     className={classNames(
                        "text-purple-main text-base font-semibold"
                     )}
                     style={{
                        color: color,
                     }}
                  >
                     Session Block
                  </div>
                  <div className="text-gray-300 text-xs">
                     {sessionGroup!.blocks.reduce(
                        (ac, a) => ac + a.numberOfSeats,
                        0
                     )}{" "}
                     seats and tickets
                  </div>
               </div>
               <div className="">{icons.visualizer.chevronDownBig}</div>
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
               <div className="text-gray-500 text-sm text-center mb-4 font-semibold ">
                  Groups
               </div>
               {[
                  options.find((x) => x.value === "a") as IBlockingGroup,
                  ...options.filter((opt) => opt.value !== "a"),
               ].map((opt, i) => (
                  <div className="gap-8 flex items-center cursor-pointer justify-between  transition-all duration-150 px-2">
                     <div className="flex items-center gap-2">
                        <div
                           className={classNames(
                              `rounded-full h-4 w-4 border-purple-main text-purple-main text-xxs border font-bold flex justify-center items-center`
                           )}
                        >
                           {opt.letter}
                        </div>

                        <div className="flex flex-col">
                           <div
                              className={classNames(
                                 "text-purple-main text-base font-semibold"
                              )}
                              style={{
                                 color: value === opt.value ? color : undefined,
                              }}
                           >
                              {opt.title}
                           </div>
                           <div className="text-gray-300 text-xs">
                              {opt.blocks.reduce(
                                 (ac, a) => ac + a.numberOfSeats,
                                 0
                              )}{" "}
                              seats and tickets
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        {opt.value !== "a" ? (
                           <div
                              className={classNames(
                                 "text-gray-500 cursor-pointer"
                              )}
                              onClick={() =>
                                 dispatch({
                                    setBlockingData: {
                                       editBlockGroupDialogData: {
                                          activeGroupValue: opt.value,
                                          groupName: opt.title,
                                       },
                                    },
                                 })
                              }
                           >
                              {icons.visualizer.edit}
                           </div>
                        ) : null}
                        <CustomSwitch
                           disabled={opt.blocks.length === 0}
                           checked={opt.checked}
                           onChange={(checked) => {
                              dispatch({
                                 toggleBlockingGroup: {
                                    value: opt.value,
                                    checked,
                                 },
                              });
                           }}
                        ></CustomSwitch>
                     </div>
                  </div>
               ))}
               <div
                  className={classNames(
                     "btn btn-primary  text-purple-main text-center rounded-md text-lg mt-3 font-semibold cursor-pointer",
                     {
                        "text-gray-400 cursor-default":
                           sessionGroupSelectionsCount === 0,
                     }
                  )}
                  onClick={() => {
                     if (sessionGroupSelectionsCount !== 0) {
                        dispatch({
                           setBlockingData: {
                              createBlockGroupDialogData: {
                                 groupName: "",
                                 visible: true,
                              },
                           },
                        });
                     }
                  }}
               >
                  Add selection to group
               </div>
            </div>
         </div>
      </>
   );
};

export default SessionFilterSelect;
