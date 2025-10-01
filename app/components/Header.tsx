import { Chevron } from "../assets/Chevron";
import { Button } from "./Button";
import { Link } from "react-router";


export function Header() {
    
    return (
        <div className="flex justify-between items-center mx-[5%] mt-[10px]">
            <div className="flex flex-col md:flex-row gap-y-2 md:gap-x-10 align-center">
                <Link to="/about">About</Link>
                <Link to="/Pricing">Pricing </Link>
                <Link to="/Contact"> Contact </Link>
            </div>
            <div className="w-[75px] md:w-[150px] lg:shrink-0 ">
                <img src="app/assets/unnamed.png" alt="Logo"
                    className="w-full"></img>
            </div>
            <div className="flex flex-col gap-y-4 md:flex-row  md:gap-x-4 align-center">
                <Link to="/Login">
                    <Button text="Login" onClick={() => { }} />
                </Link>
                <Link to="/SignUp">
                    <Button text="Sign Up" onClick={() => { }} opaque />
                </Link>
            </div>
        </div>
    );
}