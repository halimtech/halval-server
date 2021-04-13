import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field(() => String)
    @PrimaryKey()
    _id: string;

    @Field(() => String)
    @Property()
    createdAt = new Date()

    @Field(() => String)
    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date()

    @Field()
    @Property()
    title: string

    @SerializedPrimaryKey()
    id!: string;
}