"use client"

import { userAuthStore } from "@/store/Auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { session } = userAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/");
        }
    }, [session, router]);

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