import { data } from "react-router";

import makeServerClient from "~/core/lib/supa-client.server";

import { searchTickers } from "../queries";

export const loader = async ({ request }: { request: Request }) => {
  const [client] = makeServerClient(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (query.length < 2) {
    return data([]);
  }

  try {
    const results = await searchTickers(client, query);
    return data(results);
  } catch (error) {
    return data({ error: "Search failed" }, { status: 500 });
  }
};
