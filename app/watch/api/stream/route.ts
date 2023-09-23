import { LIVE_URL } from "@/(lib)/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let response: any[] = [];

  const getUrls = await fetch(`${LIVE_URL}`, {
    method: "GET",
    headers: {},
  });
  response = JSON.parse(await getUrls.json());
  return NextResponse.json({ response });
}

export async function POST(request: NextRequest) {
  let response: any[] = [];
  const token = request.nextUrl.searchParams.get("token") as string;

  const getUrls = await fetch(`${LIVE_URL}`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  });
  response = JSON.parse(await getUrls.json());

  return NextResponse.json({ response });
}
