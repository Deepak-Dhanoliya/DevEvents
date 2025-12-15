"use client";
import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTimeout(()=>{
        setSubmitted(true)
    },1000)
  };

  return (
    <div className="flex flex-col gap-6">
      {submitted ? (
        <p className="text-sm">Thankyou for signing up!</p>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 w-full cursor-pointer items-center justify-center rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
