import React from 'react';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t bg-background py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <p>&copy; {year} FeeYangu. All rights reserved.</p>
                <div className="flex gap-4">
                    <span className="hover:text-foreground transition-colors cursor-default">Privacy Policy</span>
                    <span className="hover:text-foreground transition-colors cursor-default">Terms of Service</span>
                    <span className="hover:text-foreground transition-colors cursor-default">Support</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
