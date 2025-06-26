import { Duffel } from "@duffel/api";
import { z } from "zod";
import "dotenv/config";

export const searchShape = {
  origin      : z.string().length(3),
  destination : z.string().length(3),
  date        : z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  return_date : z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  cabin       : z.enum(["economy", "premium_economy", "business", "first"]).default("economy"),
  adults      : z.number().int().min(1).default(1),
  children    : z.number().int().min(0).default(0),
  infants     : z.number().int().min(0).default(0)
};
const schema = z.object(searchShape);

const duffel = new Duffel({ token: process.env.DUFFEL_TOKEN! });

export async function searchHandler(raw: Record<string, unknown>) {
  try {
    const a = schema.parse(raw);

    const passengers = [
      ...Array(a.adults)   .fill({ type: "adult" } as any),
      ...Array(a.children) .fill({ age: 8 }       as any),
      ...Array(a.infants)  .fill({ age: 1 }       as any)
    ];

    const slices =
      a.return_date
        ? [
            { origin: a.origin, destination: a.destination, departure_date: a.date },
            { origin: a.destination, destination: a.origin, departure_date: a.return_date }
          ]
        : [{ origin: a.origin, destination: a.destination, departure_date: a.date }];

    const { data } = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class     : a.cabin,
      supplier_timeout: 8_000
    } as any);

    const offers: any[] = "offers" in data && Array.isArray((data as any).offers)
      ? (data as any).offers
      : [];

    if (!offers.length) {
      return {
        isError: true,
        content: [{ type: "text", text: `No offers for ${a.origin} to ${a.destination}.` }]
      } as any;
    }

    const cheapestFive = offers
      .sort((x: any, y: any) => +x.total_amount - +y.total_amount)
      .slice(0, 5);

    return {
      content: cheapestFive.map((o: any) => ({
        type: "text",
        text:
          `${o.id}\n` +
          `${o.total_currency} ${o.total_amount}\n` +
          `${o.owner.name}\n` +
          `${o.slices[0].segments[0].departing_at}`
      }))
    } as any;
  } catch (err: any) {
    console.error("Duffel search error:", JSON.stringify(err, null, 2));
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Search failed: ${err?.errors?.[0]?.title || err.message}`
        }
      ]
    } as any;
  }
}