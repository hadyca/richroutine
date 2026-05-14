import type { Route } from "./+types/news-redirection";

import { DateTime } from "luxon";
import { data, redirect } from "react-router";

export function loader({ params }: Route.LoaderArgs) {
  const { category } = params;
  if (!category) {
    return data(null, { status: 400 });
  }

  const today = DateTime.now().setZone("Asia/Seoul");
  const url = `/dashboard/news/${category}/${today.year}/${today.month}/${today.day}`;

  return redirect(url);
}
