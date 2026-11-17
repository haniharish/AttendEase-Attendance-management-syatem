import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const HeroSection = () => {
  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background soft circular blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-blue text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen MERN Attendance System</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-text tracking-tight leading-[1.15]">
              Smart Attendance Management,{' '}
              <span className="text-brand-blue relative inline-block">
                Made Simple.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-blue-200 -z-10"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-brand-muted leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Manage student attendance, monitor academic engagement, and simplify classroom administration with one intelligent platform.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto text-base px-8 py-3.5"
                >
                  Get Started
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 py-3.5"
                >
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-extrabold text-brand-text">99.8%</p>
                <p className="text-xs font-medium text-brand-muted mt-0.5">Uptime & Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-text">3-Roles</p>
                <p className="text-xs font-medium text-brand-muted mt-0.5">Unified Access</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-text">&lt; 30s</p>
                <p className="text-xs font-medium text-brand-muted mt-0.5">Daily Marking</p>
              </div>
            </div>
          </div>

          {/* Right Column: Educational Dashboard Preview */}
          <div className="lg:col-span-5 relative">
            {/* Interactive Preview Card Container */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-section opacity-20 blur-xl"></div>

              {/* Main Card */}
              <div className="relative bg-white rounded-card border border-slate-100 shadow-xl p-6 sm:p-7 space-y-6">
                {/* Header Mock */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text">CS 401: Computer Networks</h4>
                      <p className="text-xs text-brand-muted">Section A • Morning Session</p>
                    </div>
                  </div>
                  <Badge variant="green" size="sm">
                    In Progress
                  </Badge>
                </div>

                {/* Quick stats grid inside preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-xs font-semibold text-brand-muted">Present Students</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold text-brand-text">46</span>
                      <span className="text-xs text-brand-muted font-medium">/ 48 enrolled</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-brand-green h-full rounded-full" style={{ width: '95.8%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-xs font-semibold text-brand-muted">Overall Average</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold text-brand-blue">94.2%</span>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center">
                        +2.4%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-brand-blue h-full rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Mini student list preview */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Roster Status
                  </p>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs">
                        AJ
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text">Alex Johnson</p>
                        <p className="text-[10px] text-brand-muted">Roll #2026-001</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Present
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center font-bold text-xs">
                        EW
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text">Emma Watson</p>
                        <p className="text-[10px] text-brand-muted">Roll #2026-002</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Present
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-brand-warning flex items-center justify-center font-bold text-xs">
                        MK
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text">Michael Kane</p>
                        <p className="text-[10px] text-brand-muted">Roll #2026-003</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      Late (Excused)
                    </span>
                  </div>
                </div>

                {/* Floating highlight bubble */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Cryptographically Signed Records</span>
                  </div>
                  <span className="text-xs font-bold text-brand-blue hover:underline cursor-pointer">
                    Export PDF
                  </span>
                </div>
              </div>

              {/* Floating Badge Behind Right */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text">+18% Efficiency</p>
                  <p className="text-[10px] text-brand-muted">Compared to paper rosters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
