import { useAuth } from "../context/AuthContext"
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function GoogleSuccess() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Use a ref to ensure the logic only runs once in Strict Mode
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React.StrictMode (Development)
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const msg = searchParams.get("msg");
    const isNewUser = searchParams.get("new");

    // 1. Handle Error Case
    if (error) {
      console.error("Google Login Error:", msg);
      toast.error(msg || "Login failed. Please try again.");

      // Redirect back to login after a short delay so user sees the toast
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return;
    }

    // 2. Handle Success Case
    if (token) {
      loginWithToken(token)
      // localStorage.setItem("token", token);

      if (isNewUser === "true") {
        toast.success("Account created! Welcome to the platform.");
        // Optional: Redirect to an onboarding page if you have one
        // navigate("/onboarding", { replace: true });
        navigate("/home", { replace: true });
      } else {
        toast.success("Successfully logged in.");
        navigate("/home", { replace: true });
      }
    } else {
      // 3. Handle Edge Case (No token, no error - e.g. user typed url manually)
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing Login...</h2>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}





// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";

// export default function GoogleSuccess() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get("token");
//     const error = params.get('error')
//     const msg = params.get("msg")
//     // console.log("Token Recieved :", token)
//     if (error) {
//       console.log(token, error, msg)
//       alert(msg)
//       toast.error(msg);
//       // navigate("/login ")
//       return;
//     }

//     if (token) {
//       localStorage.setItem("token", token);
//       navigate("/home ");
//     }
//   }, [navigate]);

//   return <div>Logging you in with Google...</div>;
// }
