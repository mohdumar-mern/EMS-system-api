import axios from "axios";
const SELF_URL = process.env.BACKEND_URL || "http://localhost:3000";

console.log(SELF_URL)

export const keepAlive = async () => {
setInterval(() => {
  axios(SELF_URL)
    .then((res) => console.log("Self-ping:", res.status))
    .catch((err) => console.error("Self-ping error:", err));
}, 1000 * 6);
}