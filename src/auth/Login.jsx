import { useState } from "react";
import { Eye, EyeOff, Church } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      // Role isn't fetched here — AuthContext already fetches it in the
      // background the moment auth succeeds, and ProtectedRoute waits on
      // that before rendering the right screen.
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl border-2 border-amber-400">
        <CardContent className="p-8">

          <div className="flex flex-col items-center mb-8">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <Church className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Ambassadors
            </h1>
            <p className="text-amber-600 mt-2">
              Member &amp; Visitor Registration
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-2 h-11 border-2 border-slate-200 focus-visible:ring-amber-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 pr-10 border-2 border-slate-200 focus-visible:ring-amber-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Access is by invitation only. Contact your administrator if you
            need an account.
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Ambassadors
          </div>

        </CardContent>
      </Card>
    </div>
  );
}