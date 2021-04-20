import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
export class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("_id") _id: string
    ): Promise<Post | undefined> {
        return Post.findOne(_id)
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            authorId: req.session.userId,
        }).save()
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("_id") _id: number,
        @Arg("title") title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne({ _id })
        if (!post) {
            return null
        }
        if (typeof title !== "undefined") {
            post.title = title
            await Post.update({ _id }, { title })
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("_id") _id: number,
    ): Promise<boolean> {
        const post = await Post.findOne({ _id })
        if (!post) {
            return false
        } else {
            await Post.delete(post)
            return true
        }

    }

}