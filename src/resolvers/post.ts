import { Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts() {

        return "Hello world"
    }
}