import { User } from "../entities/User";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types"
import argon2 from "argon2"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmails";
import { v4 } from "uuid"


@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        // you are not logged in
        if (!req.session.userId) {
            return null
        }

        return User.findOne({ _id: req.session.userId })


    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length < 8) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Password must be atleast 8 chars"

                    }
                ]

            }
        }
        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"

                    }
                ]

            }
        }
        const parsedUserId = parseInt(userId)
        const user = await User.findOne(parsedUserId)
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"

                    }
                ]

            }
        }


        await User.update(
            { _id: parsedUserId },
            {
                password: await argon2.hash(newPassword),
            })
        await redis.del(key)

        //log in user after password change for better UX
        req.session.userId = user._id

        return { user }
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options)
        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password)

        let user = 5 as any
        try {
            user = User.create({ username: options.username, password: hashedPassword, email: options.email })
            console.log("user", user);
            await User.save(user)
        } catch (err) {
            if (err.code === "23505") {
                //duplicate username error
                return {
                    errors: [{
                        field: "username",
                        message: "The username is already used"
                    }]
                }
            }
        }

        //store user id session
        //keep the user logged in
        req.session.userId = user._id
        console.log(req.session.userId);

        return { user: user }
    }



    @Mutation(() => UserResponse)
    async Login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes("@") ?
                { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } })
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "that username or Email doesn't exist"
                    }
                ]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Wrong password"
                    }
                ]
            }
        }

        req.session.userId = user._id

        return {
            user
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        //res.clearCookie("qid")
        return new Promise(resolve => req.session.destroy((err) => {
            res.clearCookie(COOKIE_NAME)
            if (err) {
                console.log(err)
                resolve(false)
                return
            }
            resolve(true)
        }))

    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            //the email is not in the db
            return true
        }

        const token = v4(); //it creats a random unique string

        await redis.set(FORGET_PASSWORD_PREFIX + token,
            user._id,
            'ex',
            1000 * 60 * 60 * 24 * 3)//3 days

        await sendEmail(
            email,
            `<a href='http://127.0.0.1:3000/change-password/${token}'>reset password</a>`
        )

        return true
    }

}