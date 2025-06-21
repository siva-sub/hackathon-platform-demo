
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-200 py-8 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Hackathon Platform. All rights reserved.</p>
        <p className="text-sm mt-1">Powered by Innovation & Coffee</p>
      </div>
    </footer>
  );
};

export default Footer;