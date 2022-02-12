import { Ctx, Query, Resolver, Int, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() {em}: MyContext): Promise<Post[]> {
        return em.find(Post, {})
    }

    @Query(() => Post, {nullable: true})
    post(
        @Arg("id", () => Int) id: number,
        @Ctx() {em}: MyContext
        ): Promise<Post | null> {
        return em.findOne(Post, {id})
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title", () => String) title: string,
        @Ctx() {em}: MyContext
        ): Promise<Post> {
            const post = em.create(Post, {title, createdAt: new Date(), updatedAt: new Date()})
            await em.persistAndFlush(post)
        return post;
    }
}
