import React from "react";
import MainHeader from "../components/MainHeader";

const SellPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    // Handle form submission logic
  };

  return (
    <div>
      <MainHeader />
      <main className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold">Sell Your Item</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              className="mt-1 block w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 block w-full border p-2 rounded"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Image</label>
            <input
              type="file"
              className="mt-1 block w-full"
              accept="image/*"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default SellPage;
