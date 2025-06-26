import { Duffel } from "@duffel/api";
import { z } from "zod";
import "dotenv/config";

export const bookShape = {
  offer_id        : z.string(),
  passenger_name  : z.string(),
  passenger_phone : z.string().default("+442080160508"),
  passenger_email : z.string().email().default("no.reply@example.com"),
  born_on         : z.string()
                     .regex(/^\d{4}-\d{2}-\d{2}$/)
                     .default("1990-01-01"),
  gender          : z.enum(["m", "f", "u"]).default("m"),
  title           : z.enum(["mr", "mrs", "ms", "dr"]).default("mr")
};
const schema = z.object(bookShape);
const duffel = new Duffel({ token: process.env.DUFFEL_TOKEN! });

export async function bookHandler(raw: Record<string, unknown>) {
  const {
    offer_id,
    passenger_name,
    passenger_phone,
    passenger_email,
    born_on,
    gender,
    title
  } = schema.parse(raw);

  const offer = await duffel.offers.get(offer_id);
  const paxId = offer.data.passengers?.[0]?.id
            ?? (() => { throw new Error("Passenger ID missing from offer"); })();

  const [given, family = "(none)"] = passenger_name.trim().split(" ");

  const pax = {
    id          : paxId,
    type        : "adult",
    title,
    gender,
    born_on,
    phone_number: passenger_phone,
    email       : passenger_email,
    given_name  : given,
    family_name : family
  };

  try {
    const order = await duffel.orders.create({
      selected_offers: [offer_id],
      passengers     : [pax] as any,
      payments       : [{
        type    : "balance",
        amount  : offer.data.total_amount,
        currency: offer.data.total_currency
      }] as any
    } as any);

    return {
      content: [{
        type: "text",
        text: `Booked order ${order.data.id} — `
            + `${offer.data.total_currency} ${offer.data.total_amount}`
      }]
    } as any;
  } catch (err: any) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Booking failed: ${err?.errors?.[0]?.title ?? err.message} `
            + `(field: ${err?.errors?.[0]?.source?.pointer ?? "?"})`
      }]
    } as any;
  }
}