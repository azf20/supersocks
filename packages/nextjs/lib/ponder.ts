import * as schema from "./ponder.schema";
import { createClient } from "@ponder/client";

const client = createClient("http://localhost:42069/sql", { schema });

export { client, schema };
