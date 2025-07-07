import * as schema from "./ponder.schema";
import { createClient } from "@ponder/client";

const url = ["10", "11155111"].includes(process.env.NEXT_PUBLIC_CHAIN_ID || "31337")
  ? `https://supersocks-${process.env.NEXT_PUBLIC_CHAIN_ID}.up.railway.app/sql`
  : "http://localhost:42069/sql";

const client = createClient(url, { schema });

export { client, schema };