import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { BarChart3 } from 'lucide-react';
import type { MacroDistributionData } from '../../types';

interface MacroBellCurveChartProps {
  macro: MacroDistributionData;
  candidateScore: number;
}

export const MacroBellCurveChart: React.FC<MacroBellCurveChartProps> = ({ macro, candidateScore }) => {
  const chartOption = useMemo(() => {
    const scores = macro.points.map((p) => p.score);
    const centreDensities = macro.points.map((p) => p.centre_density);
    const nationalDensities = macro.points.map((p) => p.national_density);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#5C6670',
        borderWidth: 1,
        textStyle: { color: '#1A1A1A', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 12 },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const score = params[0].axisValue;
          let html = `<div style="font-weight: bold; margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace;">Score Coordinate: ${score}</div>`;
          params.forEach((p: any) => {
            html += `<div style="color: ${p.color}; font-size: 11px;">
              ${p.seriesName}: <strong>${(p.value * 100).toFixed(3)}%</strong>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        data: ['Centre Cohort Distribution', 'National Baseline Distribution'],
        textStyle: { color: '#5C6670', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '16%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: scores,
        boundaryGap: false,
        name: 'Score',
        nameTextStyle: { color: '#5C6670', fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif' },
        axisLabel: { color: '#5C6670', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' },
        axisLine: { lineStyle: { color: '#5C6670' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: 'Density',
        nameTextStyle: { color: '#5C6670', fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif' },
        axisLabel: { color: '#5C6670', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' },
        axisLine: { lineStyle: { color: '#5C6670' } },
        splitLine: { lineStyle: { color: '#5C6670', opacity: 0.15 } },
      },
      series: [
        {
          name: 'Centre Cohort Distribution',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: centreDensities,
          lineStyle: { color: '#8A1538', width: 2.5 },
          areaStyle: {
            color: 'rgba(138, 21, 56, 0.12)',
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                xAxis: `${candidateScore.toFixed(1)}`,
                name: 'Candidate Score',
                lineStyle: { color: '#0B1F3A', type: 'solid', width: 2 },
                label: {
                  formatter: `Candidate: ${candidateScore}`,
                  position: 'insideEndTop',
                  color: '#0B1F3A',
                  fontSize: 10,
                  fontFamily: '"IBM Plex Mono", monospace',
                },
              },
            ],
          },
        },
        {
          name: 'National Baseline Distribution',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: nationalDensities,
          lineStyle: { color: '#0B1F3A', width: 2, type: 'dashed' },
          areaStyle: {
            color: 'rgba(11, 31, 58, 0.06)',
          },
        },
      ],
    };
  }, [macro, candidateScore]);

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#5C6670]/30">
        <div className="flex items-center gap-2">
          {/* Functional Layer 2 Pipeline Icon */}
          <BarChart3 className="w-4 h-4 text-[#0B1F3A]" />
          <h4 className="text-sm font-bold text-[#0B1F3A] font-serif">
            Layer 2: Macro Statistical Audit (Overlapping Bell Curves & KS Test)
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#F7F5F0] border border-[#5C6670]/40 text-[#1A1A1A]">
            KS-Statistic D: <strong className="text-[#0B1F3A]">{macro.ks_statistic_d.toFixed(3)}</strong>
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] ${
            macro.ks_statistic_d >= 0.3
              ? 'bg-[#8A1538] text-white font-bold'
              : 'bg-[#5C6670] text-white'
          }`}>
            p-val: {macro.ks_p_value_approx < 0.001 ? '< 0.001' : macro.ks_p_value_approx}
          </span>
        </div>
      </div>

      {/* Cohort vs National Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">Centre Mean (&mu;)</div>
          <div className="text-base font-bold font-mono text-[#0B1F3A] mt-0.5">{macro.centre_mean}</div>
        </div>
        <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">Centre Std Dev (&sigma;)</div>
          <div className="text-base font-bold font-mono text-[#0B1F3A] mt-0.5">{macro.centre_std}</div>
        </div>
        <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">National Mean (&mu;)</div>
          <div className="text-base font-bold font-mono text-[#0B1F3A] mt-0.5">{macro.national_mean}</div>
        </div>
        <div className="p-2.5 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <div className="text-[10px] text-[#5C6670] uppercase font-sans">National Std Dev (&sigma;)</div>
          <div className="text-base font-bold font-mono text-[#0B1F3A] mt-0.5">{macro.national_std}</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full bg-[#FFFFFF] border border-[#5C6670]/40 rounded-[2px] p-2">
        <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Statistical Summary Statement */}
      <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-sans text-[#1A1A1A] leading-relaxed">
        <strong className="text-[#0B1F3A]">Macro Statistical Evaluation: </strong>
        {macro.divergence_summary}
      </div>
    </div>
  );
};
