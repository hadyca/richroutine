import type { Route } from "./+types/news-redirection";

import { DateTime } from "luxon";
import { data, redirect } from "react-router";

export function loader({ params }: Route.LoaderArgs) {
  const { period } = params;
  let url: string;
  const today = DateTime.now().setZone("Asia/Seoul");
  if (period === "daily") {
    url = `/dashboard/news/daily/${today.year}/${today.month}/${today.day}`;
  } else {
    return data(null, { status: 400 });
  }
  return redirect(url);
}
