"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "@/lib/auth-client"

// ── Logo ────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
      <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L9.5 9.5H2l6 4.5-2.3 7L12 17l6.3 4 -2.3-7 6-4.5h-7.5L12 2z" />
      </svg>
    </div>
    <span className="font-semibold text-foreground">investment-tracker</span>
  </div>
)

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

const inputCls =
  "w-full h-11 px-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 text-sm"

// ── Right-side info card ─────────────────────────────────────────────────────
const InfoCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-lg w-full">
    <p className="font-semibold text-gray-900 text-base mb-1">
      Please enter your login details
    </p>
    <p className="text-sm text-gray-500 mb-4">
      Stay connected with investment-tracker. Subscribe now for the latest updates and news.
    </p>
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {["bg-violet-400", "bg-purple-500", "bg-indigo-400"].map((c, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-full border-2 border-white ${c} flex items-center justify-center`}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600">+3695</span>
    </div>
  </div>
)

// ── Main component ───────────────────────────────────────────────────────────
const LoginForm = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsLoading(true)

    const { error } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    })

    if (error) {
      setServerError(error.message ?? "Invalid email or password")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* ── Left: form ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Logo />

          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Welcome back! Select method to login:
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field id="email" label="Email address" required>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </Field>

            <Field id="password" label="Password" required>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-muted-foreground">Remember Me</span>
              </label>
              <a href="#" className="text-primary hover:opacity-80 font-medium transition-opacity">
                Forgot Password?
              </a>
            </div>

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-medium shadow hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Signing in…" : "Sign in to Investment Tracker"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New on our platform?{" "}
            <a href="#" className="text-primary hover:opacity-80 font-medium transition-opacity">
              Create an account
            </a>
          </p>
        </div>
      </div>

      {/* ── Right: purple hero ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 items-center justify-center p-12">
        {/* Large decorative number */}
        <span className="absolute right-8 bottom-0 text-[20rem] font-black text-white/10 leading-none select-none pointer-events-none">
          2
        </span>

        <div className="relative z-10 flex flex-col gap-8 max-w-sm">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Welcome back! Please sign in to your Investment Tracker account
            </h2>
            <p className="text-white/75 text-sm leading-relaxed">
              Thank you for registering! Please check your inbox and click the
              verification link to activate your account.
            </p>
          </div>

          <InfoCard />
        </div>
      </div>
    </div>
  )
}

export default LoginForm
