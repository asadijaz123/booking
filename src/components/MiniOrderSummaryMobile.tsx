import { useVisualizerContext } from "../contexts/VisualizerContext";
import { icons } from "../helpers/icons";

interface MiniOrderSummaryMobileProps {}

const MiniOrderSummaryMobile: React.FC<MiniOrderSummaryMobileProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   return (
      <div className="md:hidden flex flex-col gap-4 p-4 shadow-sm bg-white  left-0 w-full z-10">
         <div
            className="relative w-full 
               rounded
              border border-gray-30 "
         >
            <div className="text-gray-250 absolute top-1/2 text-xs -translate-y-1/2 right-4 ">
               Aplicar
            </div>
            <input
               className="w-full shadow-sm text-left 0      text-xs  placeholder:text-gray-250"
               placeholder="Add a promotional code"
            ></input>
         </div>
         <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <div className="flex gap-2 cursor-pointer items-center">
                  <div className="text-gray-500 font-semibold">Total</div>
                  {icons.visualizer.chevronDownBig}
               </div>
               <div className="font-semibold text-purple-bright">25€</div>
            </div>
            <button
               className="btn btn-primary w-full"
               onClick={() => dispatch({ onContinueToCheckout: null })}
            >
               Continue
            </button>
         </div>
      </div>
   );
};

export default MiniOrderSummaryMobile;
