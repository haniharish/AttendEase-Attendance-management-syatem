import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 sm:p-10 text-center space-y-6 bg-white border border-slate-100 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto shadow-sm">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-brand-blue uppercase tracking-widest">404 Error</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Page Not Found
            </h1>
            <p className="text-sm text-brand-muted leading-relaxed">
              The page you are looking for does not exist or may have been relocated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/" className="w-full">
              <Button variant="primary" fullWidth size="md" icon={Home}>
                Return Home
              </Button>
            </Link>
            <button onClick={() => window.history.back()} className="w-full">
              <Button variant="secondary" fullWidth size="md" icon={ArrowLeft}>
                Go Back
              </Button>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;
