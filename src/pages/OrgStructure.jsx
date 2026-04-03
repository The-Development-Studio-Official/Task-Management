import React from 'react';
import { RefreshCw } from 'lucide-react';

const NodeCard = ({ type, initials, name, subtitle, role, department }) => {
  let accent = 'from-emerald-500 to-teal-500';
  let ring = 'ring-emerald-100';
  let badgeTone = 'status-completed';

  if (type === 'superadmin') {
    accent = 'from-indigo-600 via-purple-600 to-pink-600';
    ring = 'ring-indigo-100';
    badgeTone = 'status-progress';
  } else if (type === 'admin') {
    accent = 'from-blue-600 to-cyan-600';
    ring = 'ring-blue-100';
    badgeTone = 'status-pending';
  }

  return (
    <div className={`group relative w-56 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-4 ${ring}`}>
      {department && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-800 px-3 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase transition-transform group-hover:scale-110">
          {department}
        </div>
      )}
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-lg font-black text-white shadow-lg ring-4 ring-white`}>
        {initials}
      </div>
      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{name}</h3>
      <p className="mt-1 mb-4 text-[11px] font-medium leading-tight text-slate-500 uppercase tracking-tight">{subtitle}</p>
      <div className="flex items-center justify-center gap-2">
        <span className={`task-status-badge ${badgeTone} px-3 py-1 text-[10px]`}>{role}</span>
      </div>
    </div>
  );
};

export default function OrgStructure() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Organization Structure</h1>
          <p className="section-subtitle">A high-level view of the team hierarchy and reporting lines.</p>
        </div>
        <div className="header-buttons">
          <button type="button" className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Members</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">8</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">6</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">12</div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
            <span className="text-xs font-medium text-slate-600">Executive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
            <span className="text-xs font-medium text-slate-600">Leadership</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-600"></div>
            <span className="text-xs font-medium text-slate-600">Staff</span>
          </div>
        </div>

        <div className="org-tree">
          <ul>
            <li>
              <NodeCard type="superadmin" initials="SA" name="Super Admin" subtitle="Workspace Owner" role="Superadmin" department="Exectutive" />
              <ul>
                <li>
                  <NodeCard type="member" initials="S" name="Somaskandhan" subtitle="Founder & Operations" role="User" department="Leadership" />
                  <ul>
                    <li>
                      <NodeCard type="admin" initials="R" name="Raghul" subtitle="Co-Founder, Strategy & Growth" role="Admin" department="Strategy" />
                      <ul>
                        <li>
                          <NodeCard type="member" initials="A" name="Aaffeef" subtitle="Operations Associate" role="User" department="Operations" />
                        </li>
                        <li>
                          <NodeCard type="member" initials="Y" name="Yaga" subtitle="Sales Associate" role="User" department="Revenue" />
                        </li>
                        <li>
                          <NodeCard type="member" initials="M" name="Mahesh" subtitle="QA Engineer" role="User" department="Engineering" />
                        </li>
                      </ul>
                    </li>
                    <li>
                      <NodeCard type="member" initials="P" name="Priyanga" subtitle="Growth & Revenue" role="User" department="Marketing" />
                    </li>
                    <li>
                      <NodeCard type="member" initials="A" name="Avinash" subtitle="Product & Tech" role="User" department="Technology" />
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
