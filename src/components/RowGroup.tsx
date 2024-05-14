import { useVisualizerContext } from "../contexts/VisualizerContext";
import { seatsLabelGenerator } from "../utils/data";
import { degToRadians, findLineRotation } from "../utils/utils";
import Row, { RowProps } from "./Row";

interface RowGroupProps {
   rowGroup: IRowGroup;
}

const RowGroup: React.FC<RowGroupProps> = ({ rowGroup }) => {
   const [state, dispatch] = useVisualizerContext();
   let myRows = state.data.rows.filter((x) => x.groupId === rowGroup.id);

   // const myLabelsWithoutReverse = seatsLabelGenerator[rowGroup.rowsLabelType](
   //    rowGroup.noOfRows,
   //    rowGroup.rowsLabelStartingAt
   // );
   // const myLabels = rowGroup.reverseRowsLabel
   //    ? myLabelsWithoutReverse.reverse()
   //    : myLabelsWithoutReverse;
   // myRows = myRows.map((row, i) => ({ ...row, label: myLabels[i] }));

   let myRowsWithProps: RowProps[] = myRows.map((row) => ({ row }));

   if (rowGroup.rowStyle === 1 && myRows.length) {
      myRowsWithProps = myRows.map((row, i) => {
         if (i % 2 === 1) {
            return { row, lessNoOfSeats: true, state };
         }
         return { row, lessNoOfSeats: false, state };
      });
   }

   // if (rowGroup.beingCreated && rowGroup.reverseRowsLabel) {
   //    myRowsWithProps = myRowsWithProps.map((props, i) => ({
   //       ...props,

   //       row: { ...props.row, label: myRows[myRows.length - 1 - i].label },
   //    }));
   // }
   return (
      <g id={rowGroup.id}>
         {myRowsWithProps.map((props, i) => (
            <Row {...props} index={i}></Row>
         ))}
      </g>
   );
};

export default RowGroup;
