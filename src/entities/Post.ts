import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // converts this class to a graphql type
@Entity()
export class Post {
    @Field()
    @PrimaryKey({type: 'number'})
    id!: number;
    
    @Field()
    @Property({type: 'date'})
    createdAt = new Date();

    @Field()
    @Property({type: 'date',onUpdate: ()=> new Date()})
    updatedAt = new Date();
    
    @Field()
    @Property({type: 'text'})
    title!: string;
    
}