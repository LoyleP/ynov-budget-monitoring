import { neon } from "@neondatabase/serverless";

// Local dev uses the mock database; production and previews use the real one.
const url = process.env.NODE_ENV === "development" ? process.env.MOCK_DATABASE_URL : process.env.DATABASE_URL;

export const sql = neon(url!);
