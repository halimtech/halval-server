import "reflect-metadata"
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolver/hello";
import { PostResolver } from "./resolver/post";
import { UserResolver } from "./resolver/user";
import { User } from "./entities/User";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from "connect-redis"
//import { MyContext } from "./types";
import cors from "cors"
import { sendEmail } from "./utils/sendEmails";
import { createConnection } from "typeorm"
import 'dotenv/config'
import { Post } from "./entities/Post";






const main = async () => {
    sendEmail("bob@bob.com", "hello there!")

    const conn = await createConnection({
        type: "postgres",
        database: "halval",
        username: "postgres",
        password: process.env.DB_PASS,
        logging: true,
        synchronize: true,
        entities: [Post, User],
    })

    /*const posting = orm.em.create(Post, { title: "my first post" })
    await orm.em.persistAndFlush(posting)
    const posts = await orm.em.find(Post, {})
    console.log(posts);*/
    /*const firstUser = orm.em.create(User, { username: "halimtech", password: "Overwatch2014" })
    await orm.em.persistAndFlush(firstUser)*/

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.set("trust proxy", 1);

    app.use(
        cors({
            origin: 'http://127.0.0.1:3000',
            credentials: true,
        })
    )

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10years
                httpOnly: true,
                sameSite: "lax", //csrf

                //secure: __prod__,
                domain: "127.0.0.1",
            },
            saveUninitialized: false,
            secret: 'lkjnghlkjnkljghnkjlgnh',
            resave: false,
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis })
    })

    apolloServer.applyMiddleware({
        app, cors: false,
    })

    app.listen(4000, () => {
        console.log("🚀 server running @port 4000");

    })
}

main()
