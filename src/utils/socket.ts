import { io } from "socket.io-client";
import * as Ably from "ably";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://localhost:5000";

export const socket = io(URL);
