"use client"

import { userAuthStore } from '@/store/Auth'
import React from 'react'
import { Input, Label } from '@/components/ui/exporter'


function RegisterPage() {
    const { createAccount, login } = userAuthStore();
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const email = formData.get("email");
        const password = formData.get("password");

        if (!firstName || !lastName || !email || !password) {
            setError(() => "Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        const response = await createAccount(email as string, password as string, `${firstName} ${lastName}`);

        if (response.error) {
            setError(() => response.error!.message)
        } else {
            const loginResponse = await login(email as string, password as string);

            if (loginResponse.error) {
                setError(() => loginResponse.error!.message)
            }
        }

        setLoading(false);
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create a new account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </Label>
                                <Input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </Label>
                                <Input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Already have an account?{' '}
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage