import { Skeleton } from "@/(components)/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className="h-full flex flex-col items-center">
      <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24"></svg>
      Loading...
    </main>
  );
}
