import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Heart,
  ArrowRight,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100/90 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-100">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-brand-text tracking-tight">
                Attend<span className="text-brand-blue">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-brand-muted max-w-sm leading-relaxed">
              AttendEase is a modern, full-stack student attendance management platform designed for universities, colleges, and schools to streamline tracking, reporting, and academic engagement.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational v1.0
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-brand-muted hover:text-brand-blue transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Key Benefits
                </a>
              </li>
              <li>
                <Link to="/signup" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Faculty Workspace
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Administrator Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-brand-muted hover:text-brand-blue transition-colors">
                  Single Sign-On
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact placeholder */}
          <div id="contact" className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Institutional Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-muted">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                <span>support@attendease.edu</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                <span>+1 (800) 555-EASE</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>Academic Avenue, Campus Complex 101</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-medium">
          <p>© {new Date().getFullYear()} AttendEase Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-brand-text transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-brand-text transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-brand-text transition-colors cursor-pointer">
              Security Overview
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
