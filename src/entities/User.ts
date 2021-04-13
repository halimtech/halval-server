import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
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
    @Property({ type: String, unique: true })
    username!: string

    @Field()
    @Property({ type: String, unique: true })
    email!: string


    @Property({ type: String })
    password!: string
}