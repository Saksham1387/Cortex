import SignupForm from "@/components/signup-form-demo";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Auth(){
    const session = await getServerSession();

    if(session){
        redirect("/")
    }
    return(
        <div className="flex items-center justify-center">
        <SignupForm/>
        </div>
    )
}