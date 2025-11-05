import { GoogleLogin } from "@react-oauth/google";

function App() {
  const handleSuccess = (credentialResponse) => {
    console.log("Google login success:", credentialResponse);

    // credentialResponse.credential is a JWT token
    // You can send it to your backend for verification:
    fetch("http://localhost:4000/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Backend verified:", data))
      .catch((err) => console.error("Error verifying token:", err));
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Login with Google</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default App;
