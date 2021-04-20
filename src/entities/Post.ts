import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn()
    _id: number;

    @Field()
    @Column()
    title!: string

    @Field()
    @Column()
    text!: string

    @Field()
    @Column({ type: "int", default: 0 })
    likes!: number

    @Field()
    @Column()
    authorId: number;

    @Field()
    @ManyToOne(() => User, user => user.posts)
    author: User

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date
}