import { Outlet } from "react-router-dom";
import FloatingNavbar from "./navbar";

const PublicLayout = () => {
    return (
        <div>
            <FloatingNavbar />
            <div className="pt-16">
                <Outlet />
            </div>
        </div>
    );
};

export default PublicLayout;
