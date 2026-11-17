import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

const CtaBanner = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-brand-blue to-blue-700 rounded-section p-10 sm:p-14 lg:p-16 text-white overflow-hidden shadow-2xl shadow-blue-500/20">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/4 -top-10 w-56 h-56 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to modernize attendance at your institution?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed">
              Join students and faculty experiencing effortless attendance tracking, accurate academic metrics, and real-time peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto text-brand-blue font-bold px-8 py-3.5 hover:bg-blue-50"
                >
                  Create Student Account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/50 hover:bg-white/10 px-8 py-3.5"
                >
                  Sign In to Portal
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-blue-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free Student Signup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Fast Role-Based Portals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Secure JWT Session
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
