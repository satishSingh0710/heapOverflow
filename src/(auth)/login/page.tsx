"use client"

import React from 'react'
import { Input, Label } from '@/components/ui/exporter'
import { userAuthStore } from '@/store/Auth'
import { useState, useEffect } from 'react'

function LoginPage() {
    const { login } = userAuthStore();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        if (!email || !password) {
            setError(() => "Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");
        let response = await login(email as string, password as string);
        if (response.error) {
            setError(() => response.error!.message)
        }
        setLoading(false);
    }

    return (
        <>
            {
                error && <p>{error}</p>
            }
            {
                !loading && <form onSubmit={handleSubmit}>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" />
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" name="password" />
                    <button type="submit" disabled={loading}>Login</button>
                </form>
            }
        </>
    )
}

export default LoginPage