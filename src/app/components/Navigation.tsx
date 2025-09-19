import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Navigation = () => {
    const location = useRouter();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "About", path: "#about" },
        { name: "Projects", path: "#projects" },
        { name: "Certificates", path: "#certificates" },
    ];

    const scrollToSection = (sectionId: string) => {
        if (sectionId === "/") {
            // Scroll to top for Home
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (sectionId.startsWith("#")) {
            const element = document.querySelector(sectionId);
            element?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                        Portfolio
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Button
                                key={item.name}
                                onClick={() => scrollToSection(item.path)}
                                className="text-foreground/80 hover:text-primary transition-smooth relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-smooth" />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;