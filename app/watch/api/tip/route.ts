import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response: any[] = [];

  if (process.env.FEATURE_ENABLE_GASLESS_TRANSACTIONS) {
    const { signedTransaction } = await request.json();

    if (signedTransaction) {
      try {
        const apiResponse = await fetch(process.env.FEATURE_ENABLE_BICONOMY_PAYMASTER_URL as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.FEATURE_ENABLE_BICONOMY_API_KEY as string,
          },
          body: JSON.stringify({
            transaction: signedTransaction,
          }),
        });

        // Add the Biconomy response to your existing response
        const apiData = await apiResponse.json();
        console.log(apiData);
        response.push({
          biconomyResponse: apiData.data,
        });
      } catch (error) {
        console.error("Error sponsoring transaction:", error);
        response.push({
          error: "Failed to sponsor transaction",
        });
      }
    } else {
      response.push({
        error: "Signed transaction is not provided",
      });
    }
  }

  return NextResponse.json({ response });
}
