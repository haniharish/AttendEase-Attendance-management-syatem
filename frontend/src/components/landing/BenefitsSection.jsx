import React from 'react';
import {
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Smartphone,
  ShieldAlert,
  Award,
} from 'lucide-react';
import Card from '../common/Card';

const benefits = [
  {
    icon: Clock,
    title: 'Reduced Manual Work',
    description:
      'Save over 15 hours every month for each faculty member by replacing manual attendance sheets and repetitive paperwork with instant digital recording.',
    stat: '85% Faster',
    color: 'blue',
    iconBg: 'bg-blue-50 text-brand-blue',
  },
  {
    icon: CheckCircle,
    title: 'Accurate Attendance Records',
    description:
      'Eliminate proxy attendance, transcription errors, and lost registers with tamper-resistant audit trails and timestamped entries.',
    stat: '100% Audit Ready',
    color: 'green',
    iconBg: 'bg-emerald-50 text-brand-green',
  },
  {
    icon: FileSpreadsheet,
    title: 'Transparent Attendance Reporting',
    description:
      'Keep students, mentors, and parents on the same page with clear subject-by-subject attendance percentages and warning notices.',
    stat: 'Zero Disputes',
    color: 'purple',
    iconBg: 'bg-purple-50 text-brand-purple',
  },
  {
    icon: Smartphone,
    title: 'Easy Access for Students & Faculty',
    description:
      'Accessible anywhere from any smartphone, laptop, or tablet without needing complex app installations or VPN configurations.',
    stat: 'Any Device',
    color: 'orange',
    iconBg: 'bg-orange-50 text-brand-orange',
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24 bg-brand-bg/60 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <span className="text-xs font-bold text-brand-green uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Institutional Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight leading-tight">
              Why Modern Campuses Choose AttendEase
            </h2>
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed font-normal">
              Traditional paper roll calls waste valuable lecture minutes and produce unreliable records. AttendEase transforms attendance into an effortless, transparent routine.
            </p>

            <div className="pt-4 space-y-3 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-sm font-semibold text-brand-text">Compliant with university audit policies</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-sm font-semibold text-brand-text">Instant notification thresholds below 75%</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
                <span className="text-sm font-semibold text-brand-text">Seamless migration for department rosters</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Benefit Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <Card
                  key={idx}
                  hoverEffect
                  className="p-6 bg-white border border-slate-100 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${b.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        {b.stat}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-brand-text">
                      {b.title}
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed font-normal">
                      {b.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
