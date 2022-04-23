import { Resolver, Mutation, Arg, InputType, Field, Ctx, Query, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    //@ts-ignore
    username: string;
    @Field(() => String)
    //@ts-ignore
    password: string;
}

@ObjectType()
class FieldError {
    @Field(() => String)
    field: string | undefined;
    @Field(() => String)
    message: string | undefined;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {

    @Query(() => [User], { nullable: true })
    async users(@Ctx() { em }: MyContext): Promise<User[]> {
        const users = await em.find(User, {});
        return users;
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: MyContext) {
        // you are not logged in
        if (!req.session?.userId) {
            return null;
        }

        //@ts-ignore
        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        if (options.username && options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        if (options.password && options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }
        //   if(typeof options.username == "undefined") throw new Error("Undefined username");

        const hashedPassword = await argon2.hash(options.password!);
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            //|| err.detail.includes("already exists")) {
            // duplicate username error
            //@ts-ignore
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        },
                    ],
                };
            }
        }
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {req, em }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "incorrect user or password",
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password or user",
                    },
                ],
            };
        }
        req.session.userId = user.id;
        return {
            user
        };
    }
}