import React from 'react';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t bg-background py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <p>&copy; {year} FeeYangu. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-foreground transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
