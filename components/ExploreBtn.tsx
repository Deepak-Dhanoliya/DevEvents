"use client";

import Link from "next/link";

const ExploreBtn = () => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => {
        console.log("clicked");
      }}
    >
      <Link href={"#events"}>
        Explore{" "}
        <img
          src={"/icons/arrow-down.svg"}
          alt="arrow-down"
          width={24}
          height={24}
        />
      </Link>
    </button>
  );
};

export default ExploreBtn;
