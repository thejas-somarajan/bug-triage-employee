"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { register } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "employee" as "employee" | "admin",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { toast } = useToast()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Passwords do not match.",
            })
            return
        }
        if (form.password.length < 6) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Password must be at least 6 characters.",
            })
            return
        }

        setIsLoading(true)
        try {
            await register(form.username, form.email, form.password, form.role)
            setSuccess(true)
            toast({
                title: "Account Created",
                description: "Redirecting to login...",
            })
            setTimeout(() => router.push("/login"), 2000)
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: err instanceof Error ? err.message : "Registration failed. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Register as a new employee on DevTracker Portal.</p>
                </div>

                {/* Success banner */}
                {success && (
                    <div className="rounded-lg bg-green-900/30 border border-green-700/50 px-4 py-3 text-green-400 text-sm text-center mb-4">
                        ✅ Account created! Redirecting to login…
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Username</label>
                        <Input
                            type="text"
                            name="username"
                            placeholder="your_username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            disabled={success}
                            className="bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={success}
                            className="bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Password</label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            disabled={success}
                            className="bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={success}
                            className="bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            disabled={success}
                            className="w-full px-3 py-2 rounded-md bg-[#1f2937] border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="employee">Employee</option>
                            <option value="admin">Administrator (admin)</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 cursor-pointer mt-2"
                    >
                        {isLoading ? "Creating account…" : "Create Account"}
                    </Button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                        Sign In
                    </Link>
                </p>

                <p className="text-center text-gray-600 text-xs mt-8">© 2025 DevTracker Inc. All rights reserved.</p>
            </div >
        </div >
    )
}
