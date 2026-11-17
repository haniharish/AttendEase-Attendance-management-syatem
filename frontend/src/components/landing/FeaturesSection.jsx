import React from 'react';
import {
  CalendarCheck,
  Users,
  GraduationCap,
  FileBarChart,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../common/Card';

const features = [
  {
    icon: CalendarCheck,
    title: 'Smart Attendance Tracking',
    description:
      'Effortlessly log and monitor attendance in seconds with real-time timestamps, bulk status toggles, and zero paper overhead.',
    color: 'blue',
    iconBg: 'bg-blue-50 text-brand-blue',
    badge: 'Core Feature',
  },
  {
    icon: Users,
    title: 'Student Management',
    description:
      'Comprehensive student directory with enrollment details, batch classifications, and individualized participation summaries.',
    color: 'orange',
    iconBg: 'bg-orange-50 text-brand-orange',
    badge: 'Administration',
  },
  {
    icon: GraduationCap,
    title: 'Faculty Management',
    description:
      'Assign professors to courses, manage subject allocations, and empower educators with dedicated class control centers.',
    color: 'purple',
    iconBg: 'bg-purple-50 text-brand-purple',
    badge: 'Classroom',
  },
  {
    icon: FileBarChart,
    title: 'Real-Time Attendance Reports',
    description:
      'Instantly generate institutional attendance summaries, downloadable data sheets, and daily breakdown logs with a single click.',
    color: 'green',
    iconBg: 'bg-emerald-50 text-brand-green',
    badge: 'Reporting',
  },
  {
    icon: TrendingUp,
    title: 'Subject-Wise Analytics',
    description:
      'Gain actionable visibility into student percentages, subject trends, and identify at-risk students before exams begin.',
    color: 'pink',
    iconBg: 'bg-pink-50 text-brand-pink',
    badge: 'Analytics',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description:
      'Strict separation of administrative, faculty, and student permissions powered by secure HTTP-only JWT authentication.',
    color: 'blue',
    iconBg: 'bg-blue-50 text-brand-blue',
    badge: 'Security',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            Engineered For Higher Education
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            Everything You Need To Master Attendance
          </h2>
          <p className="text-base sm:text-lg text-brand-muted font-normal leading-relaxed">
            Eliminate manual registers and disjointed spreadsheets. AttendEase delivers a unified suite of tools tailored for students, faculty, and administrators.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                className="group relative flex flex-col justify-between p-7 bg-white border border-slate-100"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${feature.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-blue transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-brand-blue group-hover:translate-x-1 transition-transform duration-200">
                  <span>Learn more</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
