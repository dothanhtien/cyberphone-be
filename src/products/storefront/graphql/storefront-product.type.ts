import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('StorefrontProduct')
export class StorefrontProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  shortDescription: string | null;

  @Field()
  isFeatured: boolean;

  @Field()
  isBestseller: boolean;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  salePrice: number | null;

  @Field()
  inStock: boolean;

  @Field(() => String, { nullable: true })
  mainImage: string | null;

  @Field(() => ID)
  variantId: string;
}
