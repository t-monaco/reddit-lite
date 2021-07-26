import { Field } from 'type-graphql';
import { ObjectType } from 'type-graphql';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@ObjectType()
@Entity()
export class Post {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field()
    @Property()
    createdAt: Date = new Date();

    @Field()
    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Field()
    @Property()
    title!: string;
}
