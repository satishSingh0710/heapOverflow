"use client"

import { userAuthStore } from "@/store/Auth";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { session } = userAuthStore();
    const router = useRouter();
    // const [isMounted, setIsMounted] = React.useState(false);
    // useEffect(() => {
    //     setIsMounted(true);
    // }, []);

    useEffect(() => {
        if (session) {
            router.push("/"); // Redirect if session exists
        }
    }, [session]);

    if (session) {
        return null;
    }
    return (
        <div className="">
            {children}
        </div>
    )
}

export default Layout;