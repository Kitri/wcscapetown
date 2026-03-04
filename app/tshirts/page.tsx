import Header from "@/components/Header";
import Link from "next/link";

export default function TShirtsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-4">
            T-Shirt Poll Closed
          </h1>
          
          <p className="text-text-dark/70 mb-6">
            Thank you to everyone who participated! The t-shirt poll is now closed and we are processing the results.
          </p>

          <Link
            href="/"
            className="inline-block bg-yellow-accent text-text-dark px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
