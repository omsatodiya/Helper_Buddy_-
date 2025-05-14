<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
  <main class="max-w-4xl mx-auto p-6">
    <header class="mb-10">
      <h1 class="text-4xl font-bold text-blue-600">Helper Buddy</h1>
      <p class="mt-2 text-lg text-gray-600">
        A Service Marketplace Web App built during GWOC Hackathon 2025
      </p>
    </header>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">🚀 Features</h2>
      <ul class="list-disc list-inside space-y-2">
        <li>Location-based service matching using device geolocation and PIN codes.</li>
        <li>Email and in-app notifications for service providers when a request is made in their area.</li>
        <li>Secure payments with Razorpay.</li>
        <li>E-commerce-like flow: service cart, address selection, and checkout.</li>
        <li>Email notifications powered by EmailJS.</li>
        <li>Framer Motion-based animations for a better user experience.</li>
        <li>Three user roles: User, Service Provider, Admin.</li>
        <li>Separate dashboards for each role with appropriate functionality.</li>
        <li>Service provider verification and area-based service setup.</li>
        <li>Coin-based credit system: 100 coins (₹100) on user registration usable for purchases.</li>
      </ul>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">🛠 Tech Stack</h2>
      <ul class="list-disc list-inside space-y-2">
        <li><strong>Next.js</strong> – Full-stack React framework</li>
        <li><strong>Firebase</strong> – Authentication and backend services</li>
        <li><strong>Cloudinary</strong> – Image hosting and optimization</li>
        <li><strong>Tailwind CSS</strong> – Modern utility-first styling</li>
        <li><strong>Framer Motion</strong> – Seamless UI animations</li>
        <li><strong>Razorpay</strong> – Flexible, secure payment gateway</li>
        <li><strong>EmailJS</strong> – Client-side email notifications</li>
      </ul>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">🧱 Architecture & Design</h2>
      <ul class="list-disc list-inside space-y-2">
        <li>Modular and scalable project structure</li>
        <li>Role-based access control for Users, Service Providers, and Admin</li>
        <li>Geolocation + Pincode targeting for localized services</li>
        <li>Cloudinary for efficient media handling</li>
        <li>Tailwind CSS for clean and responsive UI</li>
      </ul>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">📁 Project Setup</h2>
      <ol class="list-decimal list-inside space-y-2">
        <li>Clone the repository:
          <pre class="bg-gray-100 rounded p-2 mt-1"><code>git clone https://github.com/yourusername/helper-buddy.git
cd helper-buddy</code></pre>
        </li>
        <li>Install dependencies:
          <pre class="bg-gray-100 rounded p-2 mt-1"><code>npm install</code></pre>
        </li>
        <li>Create <code>.env.local</code> and add Firebase, Cloudinary, EmailJS, and Razorpay keys.</li>
        <li>Run the development server:
          <pre class="bg-gray-100 rounded p-2 mt-1"><code>npm run dev</code></pre>
        </li>
      </ol>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">✅ Future Improvements</h2>
      <ul class="list-disc list-inside space-y-2">
        <li>Real-time chat between users and providers</li>
      </ul>
    </section>
    <section class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">👥 Team</h2>
      <p>Add your team members and GitHub handles here.</p>
    </section>
    <footer class="mt-12 text-gray-500 text-sm text-center">
      © 2025 Helper Buddy. Built with ❤️ during GWOC Hackathon.
    </footer>
  </main>
</body>
</html>
