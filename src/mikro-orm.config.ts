import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core"
import { User } from "./entities/User";
//import path from "path"

console.log("dirname :" + __dirname);

export default {
    /*migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },*/
    entities: [Post, User],
    dbName: "Halval",
    clientUrl: process.env.MONGO_URI,
    type: "mongo",
    debug: !__prod__,
    ensureIndexes: true,
} as Parameters<typeof MikroORM.init>[0];