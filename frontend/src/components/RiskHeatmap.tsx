import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTriageStore } from '../stores/triageStore';

export const RiskHeatmap: React.FC = () => {
  const { hierarchyCentres, isLoadingHierarchy, selectedCentreId, setSelectedCentreId } = useTriageStore();

  const chartOption = useMemo(() => {
    if (!hierarchyCentres || hierarchyCentres.length === 0) {
      return {};
    }

    // Format data for ECharts Treemap using official register palette
    const treeData = hierarchyCentres.map((c) => {
      let color = '#0B1F3A'; // Baseline cohort: Navy
      if (c.risk_level === 'Critical' || c.avg_risk_score >= 8.0 || c.max_risk_score >= 50.0) {
        color = '#8A1538'; // Elevated / High risk: Solid Red
      } else if (c.risk_level === 'Elevated' || c.avg_risk_score >= 3.0 || c.max_risk_score >= 20.0 || c.flagged_candidates >= 1) {
        color = '#C9A227'; // Moderate risk: Solid Brass
      }

      return {
        name: `${c.city_name}\n${c.centre_id}`,
        value: c.total_candidates,
        centre_id: c.centre_id,
        centre_name: c.centre_name,
        state_name: c.state_name,
        city_name: c.city_name,
        avg_risk_score: c.avg_risk_score,
        max_risk_score: c.max_risk_score,
        flagged_candidates: c.flagged_candidates,
        risk_level: c.risk_level,
        itemStyle: {
          color,
          borderColor: selectedCentreId === c.centre_id ? '#FFFFFF' : '#5C6670',
          borderWidth: selectedCentreId === c.centre_id ? 3 : 1,
          gapWidth: 1,
        },
      };
    });

    return {
      tooltip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#5C6670',
        borderWidth: 1,
        textStyle: {
          color: '#1A1A1A',
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const data = params.data;
          if (!data || data.avg_risk_score === undefined) return '';
          const avgScore = typeof data.avg_risk_score === 'number' ? data.avg_risk_score.toFixed(1) : '0.0';
          return `
            <div style="font-weight: 700; margin-bottom: 4px; color: #0B1F3A; font-family: 'Source Serif 4', Georgia, serif;">${data.centre_name || ''}</div>
            <div style="font-size: 11px; color: #5C6670; margin-bottom: 6px; font-family: 'IBM Plex Sans', sans-serif;">${data.city_name || ''}, ${data.state_name || ''} (${data.centre_id || ''})</div>
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
              <span>Total Candidates:</span>
              <strong style="font-family: 'IBM Plex Mono', monospace;">${data.value || 0}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
              <span>Flagged Candidates:</span>
              <strong style="font-family: 'IBM Plex Mono', monospace; color: ${(data.flagged_candidates || 0) > 0 ? '#8A1538' : '#1A1A1A'};">${data.flagged_candidates || 0}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
              <span>Average Risk Score:</span>
              <strong style="font-family: 'IBM Plex Mono', monospace;">${avgScore} / 100</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Risk Classification:</span>
              <strong style="font-family: 'IBM Plex Sans', sans-serif;">${data.risk_level || 'Normal'}</strong>
            </div>
          `;
        },
      },
      series: [
        {
          type: 'treemap',
          data: treeData,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: '{b}',
            color: '#FFFFFF',
            fontSize: 11,
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontWeight: 600,
          },
          upperLabel: { show: false },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#5C6670',
          },
        },
      ],
    };
  }, [hierarchyCentres, selectedCentreId]);

  const onEvents = {
    click: (params: any) => {
      if (params.data && params.data.centre_id) {
        if (selectedCentreId === params.data.centre_id) {
          setSelectedCentreId(null);
        } else {
          setSelectedCentreId(params.data.centre_id);
        }
      }
    },
  };

  const activeCentre = useMemo(() => {
    if (!hierarchyCentres || hierarchyCentres.length === 0) return null;
    if (selectedCentreId) {
      return hierarchyCentres.find((c) => c.centre_id === selectedCentreId) || hierarchyCentres[0];
    }
    const sorted = [...hierarchyCentres].sort((a, b) => b.max_risk_score - a.max_risk_score);
    return sorted[0];
  }, [hierarchyCentres, selectedCentreId]);

  return (
    <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-5 space-y-4 text-left shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#5C6670]/30">
        <div>
          <div className="text-[10px] font-mono text-[#5C6670] uppercase font-bold tracking-wider">
            MACRO GEOGRAPHICAL DISPERSION & COHORT ANOMALY TREEMAP
          </div>
          <h3 className="text-base font-bold text-[#0B1F3A] font-serif mt-0.5">
            Geographical Risk Concentration & Centre Intelligence
          </h3>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5">
            Area sizing reflects total candidate registration volume; tile color represents composite forensic anomaly risk index. Click any centre tile to isolate that examination venue in the adjudication table below.
          </p>
        </div>

        {/* Technical Legend with Status Dots */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs font-sans">
          <div className="flex items-center text-xs text-[#1A1A1A]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#8A1538] shrink-0" />
            <span>Statutory Alert <span className="font-mono text-[11px] text-[#5C6670]">(&ge;35.0)</span></span>
          </div>
          <div className="flex items-center text-xs text-[#1A1A1A]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#C9A227] shrink-0" />
            <span>Elevated Variance <span className="font-mono text-[11px] text-[#5C6670]">(&ge;20.0)</span></span>
          </div>
          <div className="flex items-center text-xs text-[#1A1A1A]">
            <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#0B1F3A] shrink-0" />
            <span>Congruent Baseline Cohort</span>
          </div>
        </div>
      </div>

      {isLoadingHierarchy ? (
        <div className="h-64 flex items-center justify-center bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px]">
          <span className="text-xs text-[#5C6670] font-sans font-mono">
            Compiling geographical hierarchical risk matrices from database...
          </span>
        </div>
      ) : !hierarchyCentres || hierarchyCentres.length === 0 ? (
        <div className="h-64 flex items-center justify-center bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-6 text-center">
          <p className="text-xs text-[#5C6670] font-sans">
            No geographical risk telemetry available — ingest examination dataset on Tab 01 to generate hierarchical Treemap.
          </p>
        </div>
      ) : (
        /* Asymmetric 65 / 35 Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 65% (8 Cols): Interactive Treemap */}
          <div className="lg:col-span-8 h-72 w-full bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] overflow-hidden">
            <ReactECharts
              option={chartOption}
              style={{ height: '100%', width: '100%' }}
              onEvents={onEvents}
            />
          </div>

          {/* Right 35% (4 Cols): Centre Risk Intelligence Panel */}
          <div className="lg:col-span-4 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] p-4 flex flex-col justify-between space-y-3">
            {activeCentre ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#5C6670]/30 pb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#5C6670]">
                      {selectedCentreId ? '// SELECTED CENTRE' : '// PEAK ANOMALY CENTRE'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold ${
                      activeCentre.risk_level === 'Critical' || activeCentre.max_risk_score >= 50
                        ? 'bg-[#8A1538] text-white'
                        : activeCentre.risk_level === 'Elevated' || activeCentre.max_risk_score >= 20
                        ? 'bg-[#C9A227] text-white'
                        : 'bg-[#0B1F3A] text-white'
                    }`}>
                      {activeCentre.risk_level}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#0B1F3A] font-serif leading-tight">
                      {activeCentre.centre_name}
                    </h4>
                    <div className="text-xs font-mono text-[#5C6670] mt-0.5">
                      {activeCentre.centre_id} &bull; {activeCentre.city_name}, {activeCentre.state_name}
                    </div>
                  </div>

                  {/* Key Stats Matrix */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2 rounded-[2px]">
                      <div className="text-[9px] font-mono text-[#5C6670] uppercase">Total Candidates</div>
                      <div className="font-mono font-bold text-sm text-[#0B1F3A]">
                        {activeCentre.total_candidates.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2 rounded-[2px]">
                      <div className="text-[9px] font-mono text-[#5C6670] uppercase">Flagged Cases</div>
                      <div className={`font-mono font-bold text-sm ${activeCentre.flagged_candidates > 0 ? 'text-[#8A1538]' : 'text-[#0B1F3A]'}`}>
                        {activeCentre.flagged_candidates}
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2 rounded-[2px]">
                      <div className="text-[9px] font-mono text-[#5C6670] uppercase">Max Risk Score</div>
                      <div className="font-mono font-bold text-sm text-[#8A1538]">
                        {activeCentre.max_risk_score.toFixed(1)} <span className="text-[10px] text-[#5C6670]">/ 100</span>
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#5C6670]/30 p-2 rounded-[2px]">
                      <div className="text-[9px] font-mono text-[#5C6670] uppercase">Avg Centre Score</div>
                      <div className="font-mono font-bold text-sm text-[#0B1F3A]">
                        {activeCentre.avg_risk_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Action Control */}
                <div className="pt-2 border-t border-[#5C6670]/30 flex items-center justify-between gap-2">
                  {selectedCentreId === activeCentre.centre_id ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCentreId(null)}
                      className="w-full py-1.5 bg-transparent border border-[#8A1538] text-[#8A1538] hover:bg-[#8A1538]/5 text-xs font-mono font-medium rounded-[2px] cursor-pointer"
                    >
                      Clear Centre Filter [x]
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedCentreId(activeCentre.centre_id)}
                      className="w-full py-1.5 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white text-xs font-sans font-medium rounded-[2px] cursor-pointer"
                    >
                      Filter Table for {activeCentre.centre_id} &rarr;
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#5C6670] text-center my-auto">
                Select a centre block in the Treemap to inspect forensic parameters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
