import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function QuotaChart({ quotas }) {
  const data = [
    {
      name: 'Rice',
      quota: quotas.rice.quota,
      consumed: quotas.rice.consumed,
      remaining: quotas.rice.quota - quotas.rice.consumed,
      unit: 'kg'
    },
    {
      name: 'Wheat',
      quota: quotas.wheat.quota,
      consumed: quotas.wheat.consumed,
      remaining: quotas.wheat.quota - quotas.wheat.consumed,
      unit: 'kg'
    },
    {
      name: 'Sugar',
      quota: quotas.sugar.quota,
      consumed: quotas.sugar.consumed,
      remaining: quotas.sugar.quota - quotas.sugar.consumed,
      unit: 'kg'
    },
    {
      name: 'Kerosene',
      quota: quotas.kerosene.quota,
      consumed: quotas.kerosene.consumed,
      remaining: quotas.kerosene.quota - quotas.kerosene.consumed,
      unit: 'L'
    }
  ];

  const colors = {
    consumed: '#f59e0b', // Amber-500
    remaining: '#fed7aa'  // Amber-200
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-amber-200 rounded-lg shadow-lg">
          <p className="font-bold text-amber-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-amber-500 mr-2 rounded"></span>
              <span className="font-medium text-amber-700">Consumed:</span> {data.consumed} {data.unit}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-amber-200 mr-2 rounded"></span>
              <span className="font-medium text-amber-700">Remaining:</span> {data.remaining} {data.unit}
            </p>
            <p className="text-sm pt-1 border-t border-amber-100">
              <span className="font-medium text-amber-900">Total Quota:</span> {data.quota} {data.unit}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f3f4f6" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#78350f' }}
            axisLine={{ stroke: '#d6d3d1' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#78350f' }}
            axisLine={{ stroke: '#d6d3d1' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="consumed" 
            name="Consumed"
            stackId="a" 
            fill={colors.consumed} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="remaining" 
            name="Remaining"
            stackId="a" 
            fill={colors.remaining} 
            radius={[0, 0, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center mt-0 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 mr-2 rounded"></div>
          <span className="text-sm text-amber-700 font-medium">Consumed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-200 mr-2 rounded"></div>
          <span className="text-sm text-amber-700 font-medium">Remaining</span>
        </div>
      </div>
    </div>
  );
}

export default QuotaChart;