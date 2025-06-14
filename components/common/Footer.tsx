
import React from 'react';
import { APP_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-center p-4 mt-auto">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
