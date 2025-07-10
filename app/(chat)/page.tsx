"use client";

import OverviewScreen from "@/components/screen/overview-screen";

export default function Page() {
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="red" />
    </svg>
  `;

  return (
    <OverviewScreen svg={svg} />
  );
}
