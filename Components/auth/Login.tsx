"use client"

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
const Login = ( )=>{
    return (
        <div>
            <h1>Login</h1>
            <Button onClick={()=> signIn("google")}>Sign In</Button>
        </div>
    )
}
export default Login;