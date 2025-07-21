'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to SwiftQuote</h1>
      <p className="text-lg text-center">Your all-in-one quote + proposal tool for freelancers and small businesses.</p>
      
      <a
        href="/quote"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Get Started
      </a>

      <div className="mt-4 flex space-x-4">
        <a href="/auth/login" className="text-blue-600 underline">Login</a>
        <a href="/auth/register" className="text-blue-600 underline">Register</a>
      </div>
    </main>
  );
}

