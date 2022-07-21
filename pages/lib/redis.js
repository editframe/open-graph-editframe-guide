import { createClient } from "redis";

const redisClient = createClient();

(async () => {
    await redisClient.connect();
})();
redisClient.on("error", (error) => {
    if (error) {
        console.error("ERROR***", error);
    } else {
        console.log("Redis connect.");
    }
});
export default redisClient;
