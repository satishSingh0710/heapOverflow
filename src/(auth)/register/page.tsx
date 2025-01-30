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
        <div>
            {
                error && <p>{error}</p>
            }
            {
                !loading && <form onSubmit={handleSubmit}>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input type="text" id="firstName" name="firstName" />
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input type="text" id="lastName" name="lastName" />
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" />
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" name="password" />
                    <button type="submit" disabled={loading}>Register</button>
                </form>
            }
            
        </div>
    )
}

export default RegisterPage