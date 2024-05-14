import App from "./App";
export const VisualizerComponent = App;
import ReactDOM from "react-dom/client";
import "./App.css";
import "./index.css";
import dummyData from "./dummyData.json";
import { IVisualizerData } from "./contexts/VisualizerContext";
console.log("dummy data", dummyData);

console.log(window.location.href, "href");
const url_string = window.location.href;
const url = new URL(url_string);
const userId = url.searchParams.get("userid");

ReactDOM.createRoot(document.getElementById("root")!).render(
   <div className="flex h-full w-full">
      <App
         customData={dummyData.data as any as IVisualizerData}
         blocking={true}
         ablyKey="CzGc1g.LeHb7Q:bf99NKEDv_KJvMJpqt2120di9oc_VwBybbHGtPVevA4"
         // backendHost=
         backendHost={"http://192.168.1.10:5000"}
         onRendered={(planData, selectionsData) => {
            console.log("plan loaded", planData, selectionsData);
         }}
         tickets={[
            { id: "1", name: "Adult", price: 50 },
            { id: "2", name: "Kid", price: 25 },
            { id: "3", name: "Student", price: 10 },
         ]}
         categoryTicketMapping={{
            cat1: ["1", "2", "3"],
            cat2: ["2"],
            cat3: ["2", "3"],
         }}
         planId="41q8gyvm6o88eiwyt9p3"
         userId={userId || "userid1"}
         showLabels
      />
   </div>
);
