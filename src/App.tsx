import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { sample } from "lodash";
import { getRandomId } from "./utils/utils";
import {
   IVisualizerData,
   VisualizerContextProvider,
} from "./contexts/VisualizerContext";
import Visualizer, { VisualizerProps } from "./components/Visualizer";
export type Test = "abc";

const App: React.FC<VisualizerProps> = (props) => {
   return (
      <VisualizerContextProvider>
         <Visualizer {...props}></Visualizer>;
      </VisualizerContextProvider>
   );
};

export default App;
