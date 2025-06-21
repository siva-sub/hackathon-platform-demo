
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Icons } from '../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-10rem)]">
      <Icons.XCircle />
      <h1 className="text-6xl font-extrabold text-primary-700 dark:text-primary-400 mt-4">404</h1>
      <p className="text-2xl font-semibold text-neutral-700 dark:text-neutral-100 mt-2">Page Not Found</p>
      <p className="text-neutral-500 dark:text-neutral-300 mt-4 mb-8">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="primary" size="lg">
        <Link to="/" className="flex items-center">
            <Icons.Home /> <span className="ml-2">Go Back Home</span>
        </Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;