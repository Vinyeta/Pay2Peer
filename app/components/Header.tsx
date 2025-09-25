import { Chevron } from "../assets/Chevron";
import { Link } from "react-router";


export function Header() {
    
    return (
        <div className="flex justify-between items-center mx-[5%] mt-[10px]">
            <div className="flex gap-x-10 align-center">
                <Link to="/about">About</Link>
                <Link to="/Pricing">Pricing </Link>
                <Link to="/Contact"> Contact </Link>
            </div>
            <div className="w-[75px] lg:shrink-0  -translate-x-1/2">
                <img src="app/assets/unnamed.png" alt="Logo"
                    className="w-full"></img>
            </div>
            <div>Test3</div>
        </div>
    );
}