"use client";

import { useState } from "react";

export default function Intake() {
  const [form, setForm] = useState({
    clientName: "",
    deviceType: "",
    issueDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    alert("Device intake submitted!");
    // TODO: connect to backend / database (Prisma)
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-10 shadow-lg dark:bg-neutral-900">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Device Intake Form
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-black dark:text-gray-300">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              placeholder="Enter client name"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-black dark:border-zinc-700 dark:bg-neutral-800 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black dark:text-gray-300">Device Type</label>
            <input
              type="text"
              name="deviceType"
              value={form.deviceType}
              onChange={handleChange}
              placeholder="Laptop, Phone, etc."
              className="rounded-lg border border-zinc-300 px-3 py-2 text-black dark:border-zinc-700 dark:bg-neutral-800 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black dark:text-gray-300">Issue Description</label>
            <textarea
              name="issueDescription"
              value={form.issueDescription}
              onChange={handleChange}
              placeholder="Describe the problem"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-black dark:border-zinc-700 dark:bg-neutral-800 dark:text-white"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-black py-2 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            Submit Intake
          </button>
        </form>
      </main>
    </div>
  );
}
