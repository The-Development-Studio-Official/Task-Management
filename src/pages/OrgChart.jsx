import React from 'react';
import { RefreshCw } from 'lucide-react';

const NodeCard = ({ type, initials, name, subtitle, role }) => {
  let borderColor = 'border-emerald-500';
  let bgColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-500 border-emerald-200';

  if (type === 'superadmin') {
    borderColor = 'border-purple-600';
    bgColor = 'bg-purple-600';
    badgeColor = 'text-purple-600 border-purple-200';
  } else if (type === 'admin') {
    borderColor = 'border-blue-600';
    bgColor = 'bg-blue-600';
    badgeColor = 'text-blue-600 border-blue-200';
  }

  return (
    <div className={`w-48 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center p-4 relative border-t-4 ${borderColor}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${bgColor}`}>
        {initials}
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{name}</h3>
      <p className="text-gray-500 text-[10px] text-center mt-1 leading-tight mb-3">
        {subtitle}
      </p>
      <span className={`px-3 py-0.5 rounded-full text-[10px] font-medium border bg-white ${badgeColor}`}>
        {role}
      </span>
    </div>
  );
};

export default function OrgChart() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Organization Chart</h1>
          <p className="text-gray-500 text-sm">Team hierarchy and reporting structure</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div> Superadmin
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Admin
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Member
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_32px_rgba(100,110,140,0.05)] p-12 overflow-x-auto">
        <div className="org-tree">
          <ul>
            <li>
              <NodeCard 
                type="superadmin" 
                initials="SA" 
                name="Super Admin" 
                subtitle="Superadmin" 
                role="Superadmin" 
              />
              <ul>
                <li>
                  <NodeCard 
                    type="member" 
                    initials="S" 
                    name="somaskandhan" 
                    subtitle="Founder & Head of Operations" 
                    role="User" 
                  />
                  <ul>
                    <li>
                      <NodeCard 
                        type="admin" 
                        initials="R" 
                        name="Raghul" 
                        subtitle="Co-Founder & Director of Strategy and Growth" 
                        role="Admin" 
                      />
                      <ul>
                        <li>
                          <NodeCard 
                            type="member" 
                            initials="A" 
                            name="Aaffeef" 
                            subtitle="Operations Associate" 
                            role="User" 
                          />
                        </li>
                        <li>
                          <NodeCard 
                            type="member" 
                            initials="Y" 
                            name="Yaga" 
                            subtitle="Sales Associate" 
                            role="User" 
                          />
                        </li>
                        <li>
                          <NodeCard 
                            type="member" 
                            initials="M" 
                            name="mahesh" 
                            subtitle="QA Engineer" 
                            role="User" 
                          />
                        </li>
                      </ul>
                    </li>
                    <li>
                      <NodeCard 
                        type="member" 
                        initials="P" 
                        name="Priyanga" 
                        subtitle="NonStoprev - Co-founder, Growth & Revenue" 
                        role="User" 
                      />
                    </li>
                    <li>
                      <NodeCard 
                        type="member" 
                        initials="A" 
                        name="Avinash" 
                        subtitle="NonStoprev - Co-founder, Product & Tech" 
                        role="User" 
                      />
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
