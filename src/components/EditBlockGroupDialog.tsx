import classNames from "classnames";
import { useVisualizerContext } from "../contexts/VisualizerContext";
import { icons } from "../helpers/icons";
import { getAllSeats, getTicketOptionsOfObject } from "../utils/non-geom";
import Stepper from "../basecomponents/Stepper";
import { useState } from "react";
import { updateSeatSelection } from "../apis/ticketSelection";
import { getSeatId, getUserId } from "../utils/others";

interface EditBlockGroupDialogProps {}

const EditBlockGroupDialog: React.FC<EditBlockGroupDialogProps> = () => {
   const [state, dispatch] = useVisualizerContext();
   const [error, setError] = useState("");

   const activeGroupValue =
      state.seatBlockingData.editBlockGroupDialogData.activeGroupValue;

   const activeGroup = state.seatBlockingData.myGroups.find(
      (group) => group.value === activeGroupValue
   );
   const activeGroupSelectionsCount = activeGroup?.blocks.reduce(
      (ac, a) => ac + a.numberOfSeats,
      0
   );
   if (activeGroupValue) {
      return (
         <>
            <div className="h-full w-full bg-gray-250 absolute z-40 "></div>
            <div className="grid grid-cols-1 grid-rows-[min-content_auto_min-content] gap-4 bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md z-50 absolute w-fit rounded-lg min-w-[20rem]">
               <div className="flex flex-col w-full overflow-auto">
                  <div className="flex justify-between items-center mb-1.5">
                     <div className="text-gray-300 text-xs">
                        Edit block group
                     </div>
                     <div
                        className="cursor-pointer"
                        onClick={() => {
                           dispatch({
                              setState: {
                                 activeTicketSelectionObjectId: undefined,
                              },
                              setBlockingData: {
                                 editBlockGroupDialogData: {
                                    groupName: "",
                                    activeGroupValue: "",
                                 },
                              },
                           });
                        }}
                     >
                        {icons.general.closeBig}
                     </div>
                  </div>
                  <div className="text-gray-500 font-raleway font-medium">
                     {activeGroupSelectionsCount} seats and tickets selected
                  </div>
               </div>

               <div className="flex flex-col gap-1 w-full">
                  <div className="text-sm text-gray-400">Group name</div>
                  <input
                     className="text-left border-gray-300 text-sm px-4 border rounded-md  border-solid"
                     placeholder="Add group name"
                     value={
                        state.seatBlockingData.editBlockGroupDialogData
                           .groupName
                     }
                     onChange={(e) =>
                        dispatch({
                           setBlockingData: {
                              editBlockGroupDialogData: {
                                 groupName: e.target.value,
                                 activeGroupValue:
                                    state.seatBlockingData
                                       .editBlockGroupDialogData
                                       .activeGroupValue,
                              },
                           },
                        })
                     }
                  ></input>
               </div>
               <div
                  className="flex justify-between cursor-pointer mb-2"
                  onClick={() =>
                     dispatch({
                        deleteBlockGroupByValue: { value: activeGroupValue },
                        setBlockingData: {
                           editBlockGroupDialogData: {
                              activeGroupValue: "",
                              groupName: "",
                           },
                        },
                     })
                  }
               >
                  <div className="text-red-500 text-xs">Delete group</div>
                  <div className="text-red-500">
                     {icons.sidebar.category.delete}
                  </div>
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
                                 editBlockGroupDialogData: {
                                    activeGroupValue: "",
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
                              !state.seatBlockingData.editBlockGroupDialogData
                                 .groupName
                           ) {
                              setError("Add a valid group name");
                           } else {
                              setError("");
                              dispatch({
                                 updateBlockGroupByValue: {
                                    props: {
                                       title: state.seatBlockingData
                                          .editBlockGroupDialogData.groupName,
                                    },
                                    value: activeGroupValue,
                                 },
                                 setBlockingData: {
                                    editBlockGroupDialogData: {
                                       activeGroupValue: "",
                                       groupName: "",
                                    },
                                 },
                              });
                           }
                        }}
                     >
                        Save Changes
                     </button>
                  </div>
               </div>
            </div>
         </>
      );
   }
   return null;
};

export default EditBlockGroupDialog;
