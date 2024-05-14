import classNames from "classnames";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { icons } from "../helpers/icons";
import { getAllSeats, getTicketOptionsOfObject } from "../utils/non-geom";
import Stepper from "../basecomponents/Stepper";
import { useState } from "react";
import { updateSeatSelection } from "../apis/ticketSelection";
import { getSeatId, getUserId } from "../utils/others";

interface CreateBlockGroupDialogProps {}

const CreateBlockGroupDialog: React.FC<CreateBlockGroupDialogProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const [error, setError] = useState("");

   const { activeTicketSelectionObjectId: objectId } = state;
   const allSeats = getAllSeats(state.data);
   const seat = allSeats.find((seat) => seat.id === objectId);

   const allShapes = [...state.data.polygons, ...state.data.squares];
   const shape = allShapes.find((seat) => seat.id === objectId);

   const sessionGroup = state.seatBlockingData.myGroups.find(
      (group) => group.value === "a"
   );
   const sessionGroupSelectionsCount = sessionGroup?.blocks.reduce(
      (ac, a) => ac + a.numberOfSeats,
      0
   );
   if (state.seatBlockingData.createBlockGroupDialogData.visible) {
      return (
         <>
            <div className="h-full w-full bg-gray-250 absolute z-40 "></div>
            <div className="grid grid-cols-1 grid-rows-[min-content_auto_min-content] gap-4 bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-50 absolute w-fit rounded-lg min-w-[20rem]">
               <div className="flex flex-col w-full overflow-auto">
                  <div className="flex justify-between items-center mb-1.5">
                     <div className="text-gray-300 text-xs">
                        Create a block group
                     </div>
                     <div
                        className="cursor-pointer"
                        onClick={() => {
                           dispatch({
                              setState: {
                                 activeTicketSelectionObjectId: undefined,
                              },
                              setBlockingData: {
                                 createBlockGroupDialogData: {
                                    visible: false,
                                    groupName: "",
                                 },
                              },
                           });
                        }}
                     >
                        {icons.general.closeBig}
                     </div>
                  </div>
                  <div className="text-gray-500 font-raleway font-medium">
                     {sessionGroupSelectionsCount} seats and tickets selected
                  </div>
               </div>

               <div className="flex flex-col gap-1 w-full">
                  <div className="text-sm text-gray-400">Group name</div>
                  <input
                     className="text-left border-gray-300 text-sm px-4 border rounded-md  border-solid"
                     placeholder="Add group name"
                     value={
                        state.seatBlockingData.createBlockGroupDialogData
                           .groupName
                     }
                     onChange={(e) =>
                        dispatch({
                           setBlockingData: {
                              createBlockGroupDialogData: {
                                 groupName: e.target.value,
                                 visible: true,
                              },
                           },
                        })
                     }
                  ></input>
               </div>

               <div className="  w-full  flex flex-col gap-4">
                  {error && (
                     <div className="text-error-500 text-sm">{error}</div>
                  )}
                  <div className="flex items-center gap-4">
                     <button
                        style={{
                           borderColor: state.visualizerOptions?.colors.main,
                        }}
                        className="btn  bg-white text-purple-main hover:bg-purple-main hover:text-white transition-all duration-250 border  rounded-md w-full"
                        onClick={() => {
                           dispatch({
                              setBlockingData: {
                                 createBlockGroupDialogData: {
                                    visible: false,
                                    groupName: "",
                                 },
                              },
                           });
                        }}
                     >
                        Cancel
                     </button>
                     <button
                        style={{
                           backgroundColor:
                              state.visualizerOptions?.colors.main,
                        }}
                        className="btn  btn-primary rounded-md w-full"
                        onClick={() => {
                           if (
                              !state.seatBlockingData.createBlockGroupDialogData
                                 .groupName
                           ) {
                              setError("Add a valid group name");
                           } else {
                              setError("");
                              dispatch({ createBlockGroup: null });
                           }
                        }}
                     >
                        Create Group
                     </button>
                  </div>
               </div>
            </div>
         </>
      );
   }
   return null;
};

export default CreateBlockGroupDialog;
