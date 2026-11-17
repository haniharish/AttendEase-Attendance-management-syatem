import React from 'react';
import { Settings, CheckSquare, LineChart, ArrowRight } from 'lucide-react';
import Card from '../common/Card';

const steps = [
  {
    step: '01',
    title: 'Admin Configures Classes & Users',
    description:
      'Administrators establish courses, departments, academic batches, and link teachers and students with appropriate authorization.',
    icon: Settings,
    color: 'purple',
    badgeBg: 'bg-purple-100 text-purple-700',
    cardBorder: 'border-purple-100',
  },
  {
    step: '02',
    title: 'Faculty Marks Student Attendance',
    description:
      'Instructors open class rosters on any device, mark attendance in seconds, and make instant adjustments whenever needed.',
    icon: CheckSquare,
    color: 'orange',
    badgeBg: 'bg-orange-100 text-orange-700',
    cardBorder: 'border-orange-100',
  },
  {
    step: '03',
    title: 'Students Track Their Attendance',
    description:
      'Learners log into their self-service dashboard to monitor percentage thresholds, subject status, and avoid attendance shortfalls.',
    icon: LineChart,
    color: 'green',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    cardBorder: 'border-emerald-100',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-100">
            Frictionless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            How AttendEase Works
          </h2>
          <p className="text-base sm:text-lg text-brand-muted font-normal">
            A seamless three-step cycle that connects university administration, professors, and students in harmony.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="relative flex flex-col items-center text-center">
                <Card
                  hoverEffect
                  className={`w-full p-8 flex flex-col items-center text-center space-y-6 bg-brand-bg/50 border ${item.cardBorder}`}
                >
                  {/* Step Number & Icon */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-brand-text">
                      <Icon className="w-8 h-8 text-brand-blue" />
                    </div>
                    <span
                      className={`absolute -top-3 -right-3 text-xs font-black px-2.5 py-0.5 rounded-full ${item.badgeBg}`}
                    >
                      {item.step}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-brand-text leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
