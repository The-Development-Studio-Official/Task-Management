import React from 'react';
import { RefreshCw } from 'lucide-react';

const NodeCard = ({ type, initials, name, subtitle, role }) => {
  let accent = 'from-emerald-500 to-teal-500';
  let ring = 'ring-emerald-100';
  let badgeTone = 'status-completed';

  if (type === 'superadmin') {
    accent = 'from-fuchsia-600 to-violet-600';
    ring = 'ring-fuchsia-100';
    badgeTone = 'status-progress';
  } else if (type === 'admin') {
    accent = 'from-blue-600 to-cyan-600';
    ring = 'ring-blue-100';
    badgeTone = 'status-pending';
  }

  return (
    <div className={`w-48 rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm ring-4 ${ring}`}>
      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-base font-bold text-white`}>
        {initials}
      </div>
      <h3 className="text-sm font-bold text-slate-900">{name}</h3>
      <p className="mt-1 mb-3 text-[10px] leading-tight text-slate-500">{subtitle}</p>
      <span className={`task-status-badge ${badgeTone}`}>{role}</span>
    </div>
  );
};

export default function OrgChart() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Organization Chart</h1>
          <p className="section-subtitle">Team hierarchy and reporting structure.</p>
        </div>
        <div className="header-buttons">
          <button type="button" className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="task-status-badge status-progress">Superadmin</span>
          <span className="task-status-badge status-pending">Admin</span>
          <span className="task-status-badge status-completed">Member</span>
        </div>

        <div className="org-tree">
          <ul>
            <li>
              <NodeCard type="superadmin" initials="SA" name="Super Admin" subtitle="Workspace Owner" role="Superadmin" />
              <ul>
                <li>
                  <NodeCard type="member" initials="S" name="Somaskandhan" subtitle="Founder & Operations" role="User" />
                  <ul>
                    <li>
                      <NodeCard type="admin" initials="R" name="Raghul" subtitle="Co-Founder, Strategy & Growth" role="Admin" />
                      <ul>
                        <li>
                          <NodeCard type="member" initials="A" name="Aaffeef" subtitle="Operations Associate" role="User" />
                        </li>
                        <li>
                          <NodeCard type="member" initials="Y" name="Yaga" subtitle="Sales Associate" role="User" />
                        </li>
                        <li>
                          <NodeCard type="member" initials="M" name="Mahesh" subtitle="QA Engineer" role="User" />
                        </li>
                      </ul>
                    </li>
                    <li>
                      <NodeCard type="member" initials="P" name="Priyanga" subtitle="Growth & Revenue" role="User" />
                    </li>
                    <li>
                      <NodeCard type="member" initials="A" name="Avinash" subtitle="Product & Tech" role="User" />
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
