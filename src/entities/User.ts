import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn()
    _id: number;

    @Field()
    @Column({ unique: true })
    username!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string

    @OneToMany(() => Post, post => post.author)
    posts: Post[]

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date
}