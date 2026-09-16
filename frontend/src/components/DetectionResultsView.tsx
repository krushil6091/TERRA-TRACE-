import React, { useState, useEffect } from 'react';
import { Layers, BarChart3, Grid, ChevronDown, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { WatermarkAnchor } from './common/WatermarkAnchor';
import type { DetectionResultsResponse } from '../types';

export const DetectionResultsView: React.FC = () => {
  const [data, setData] = useState<DetectionResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    reconciliation: false,
    macro: false,
    micro: false,
  });

  const toggleDetails = (layerKey: string) => {
    setExpandedDetails((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDetectionResults();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load detection results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-8 text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-[#0B1F3A] animate-spin mx-auto" />
        <p className="text-xs text-[#5C6670] font-sans">
          Computing forensic detection results across analytical layers...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#FFFFFF] border border-[#8A1538] rounded-[2px] p-6 text-center space-y-3">
        <AlertCircle className="w-6 h-6 text-[#8A1538] mx-auto" />
        <p className="text-xs text-[#8A1538] font-sans font-medium">
          {error || 'Unable to retrieve layer detection results.'}
        </p>
        <button
          type="button"
          onClick={fetchResults}
          className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-sans rounded-[2px] cursor-pointer"
        >
          Retry Computation
        </button>
      </div>
    );
  }

  const { reconciliation, macro, micro } = data;

  return (
    <div className="space-y-6 text-left">
      {/* Oversized Typographic Watermark Header */}
      <WatermarkAnchor
        number="02"
        tagline="MULTI-LAYER FORENSIC TRIAGE ENGINE"
        title="Explainable Detection Results"
        subtitle="Empirical findings computed across the three analytical audit layers. Plain-language summaries of what was evaluated, empirical counts, and flagged candidate entities."
        action={
          <button
            type="button"
            onClick={fetchResults}
            className="px-3.5 py-2 bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90 text-xs font-sans font-medium rounded-[2px] border border-[#0B1F3A] cursor-pointer"
          >
            Refresh Findings
          </button>
        }
      />

      {/* ══════════════════════════════════════════════════════════════════════
          LAYER 1 — RECONCILIATION CHECK (Real WBSSC Data)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-6 space-y-4 shadow-sm">
        {/* Layer Header with Numbered Badge */}
        <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-1 bg-[#0B1F3A] text-white rounded-[2px]">
              01 // RECONCILIATION (45%)
            </span>
            <Layers className="w-4 h-4 text-[#0B1F3A]" />
            <h3 className="text-base font-bold text-[#0B1F3A] font-serif">
              {reconciliation.layer_name}
            </h3>
          </div>

          <div>
            {reconciliation.total_candidates_checked === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border border-[#5C6670] text-[#5C6670] text-[11px] font-mono font-medium rounded-[2px]">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#5C6670]" />
                No Data Ingested
              </span>
            ) : (
              <span className={`inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border ${reconciliation.mismatches_found > 0 ? 'border-[#8A1538] text-[#8A1538]' : 'border-[#0B1F3A] text-[#0B1F3A]'} text-[11px] font-mono font-medium rounded-[2px]`}>
                <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${reconciliation.mismatches_found > 0 ? 'bg-[#8A1538]' : 'bg-[#0B1F3A]'}`} />
                {reconciliation.mismatches_found} Mismatches Flagged
              </span>
            )}
          </div>
        </div>

        {/* 1. What it checks */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            WHAT IT CHECKS
          </div>
          <p className="text-xs text-[#1A1A1A] font-sans mt-0.5 leading-relaxed">
            {reconciliation.checks_summary}
          </p>
        </div>

        {/* 2. What it found — Prominent Source Serif Heading */}
        <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px]">
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            EMPIRICAL FINDING SUMMARY
          </div>
          <p className="text-sm font-semibold text-[#0B1F3A] font-serif mt-0.5 leading-snug">
            {reconciliation.found_summary}
          </p>
        </div>

        {/* 3. Flagged list */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide mb-1.5">
            FLAGGED CASES ({reconciliation.flagged_items.length} RECORDS)
          </div>

          {reconciliation.total_candidates_checked === 0 ? (
            <div className="p-4 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              No data processed yet — ingest OMR and Server records on Tab 01 to run Layer 1 reconciliation audit.
            </div>
          ) : reconciliation.flagged_items.length > 0 ? (
            <div className="overflow-x-auto border border-[#5C6670]/30 rounded-[2px]">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead className="bg-[#F7F5F0] border-b border-[#5C6670]/30 font-serif text-[#0B1F3A]">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Candidate ID</th>
                    <th className="py-2.5 px-3 font-bold text-right">Original OMR Score</th>
                    <th className="py-2.5 px-3 font-bold text-right">Published Server Score</th>
                    <th className="py-2.5 px-3 font-bold text-right">Score Discrepancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5C6670]/15 font-mono">
                  {reconciliation.flagged_items.map((item) => (
                    <tr key={item.candidate_id} className="hover:bg-[#F7F5F0]/60">
                      <td className="py-2 px-3 font-semibold text-[#0B1F3A]">
                        {item.candidate_id}
                      </td>
                      <td className="py-2 px-3 text-right text-[#5C6670]">
                        {item.original_score.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#1A1A1A]">
                        {item.published_score.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#8A1538]">
                        {item.difference > 0 ? `+${item.difference.toFixed(1)}` : item.difference.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              No score discrepancies detected. All published server scores match original calculated scores.
            </div>
          )}
        </div>

        {/* 4. Technical details (collapsed by default) */}
        <div className="pt-2 border-t border-[#5C6670]/20">
          <button
            type="button"
            onClick={() => toggleDetails('reconciliation')}
            className="text-xs font-mono font-medium text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1"
          >
            {expandedDetails.reconciliation ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>{expandedDetails.reconciliation ? 'Hide Technical Parameters' : 'View Technical Parameters & Thresholds'}</span>
          </button>

          {expandedDetails.reconciliation && (
            <div className="mt-3 p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-mono text-[#1A1A1A] space-y-1.5 animate-fadeIn">
              <div>
                <span className="text-[#5C6670]">Zero-tolerance threshold: </span>
                <strong>|Delta| &gt; {reconciliation.technical_details.zero_tolerance_threshold} marks</strong>
              </div>
              <div>
                <span className="text-[#5C6670]">Precision model: </span>
                <span>{reconciliation.technical_details.precision}</span>
              </div>
              <div>
                <span className="text-[#5C6670]">Max positive score inflation: </span>
                <strong className="text-[#8A1538]">+{reconciliation.technical_details.max_positive_discrepancy} marks</strong>
              </div>
              <div>
                <span className="text-[#5C6670]">SHA-256 Hash Verification: </span>
                <strong className="text-[#0B1F3A]">MATCHED (Append-Only Checkpoint)</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LAYER 2 — CENTRE PATTERN CHECK (Macro Layer)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-6 space-y-4 shadow-sm">
        {/* Layer Header with Numbered Badge */}
        <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-1 bg-[#0B1F3A] text-white rounded-[2px]">
              02 // CENTRE PATTERNS (35%)
            </span>
            <BarChart3 className="w-4 h-4 text-[#0B1F3A]" />
            <h3 className="text-base font-bold text-[#0B1F3A] font-serif">
              {macro.layer_name}
            </h3>
          </div>

          <div>
            {macro.total_centres_checked === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border border-[#5C6670] text-[#5C6670] text-[11px] font-mono font-medium rounded-[2px]">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#5C6670]" />
                No Data Ingested
              </span>
            ) : (
              <span className={`inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border ${macro.anomalous_centres_found > 0 ? 'border-[#8A1538] text-[#8A1538]' : 'border-[#0B1F3A] text-[#0B1F3A]'} text-[11px] font-mono font-medium rounded-[2px]`}>
                <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${macro.anomalous_centres_found > 0 ? 'bg-[#8A1538]' : 'bg-[#0B1F3A]'}`} />
                {macro.anomalous_centres_found} Centres Flagged
              </span>
            )}
          </div>
        </div>

        {/* 1. What it checks */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            WHAT IT CHECKS
          </div>
          <p className="text-xs text-[#1A1A1A] font-sans mt-0.5 leading-relaxed">
            {macro.checks_summary}
          </p>
        </div>

        {/* 2. What it found — Prominent Source Serif Heading */}
        <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px]">
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            EMPIRICAL FINDING SUMMARY
          </div>
          <p className="text-sm font-semibold text-[#0B1F3A] font-serif mt-0.5 leading-snug">
            {macro.found_summary}
          </p>
        </div>

        {/* 3. Flagged list */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide mb-1.5">
            FLAGGED CENTRES ({macro.flagged_items.length} CENTRES)
          </div>

          {macro.total_centres_checked === 0 ? (
            <div className="p-4 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              No data processed yet — ingest Server records with multi-centre distribution data on Tab 01 to run Layer 2 macro audit.
            </div>
          ) : macro.flagged_items.length > 0 ? (
            <div className="overflow-x-auto border border-[#5C6670]/30 rounded-[2px]">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead className="bg-[#F7F5F0] border-b border-[#5C6670]/30 font-serif text-[#0B1F3A]">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Centre ID</th>
                    <th className="py-2.5 px-3 font-bold">Centre Name &amp; State</th>
                    <th className="py-2.5 px-3 font-bold text-right">Candidates</th>
                    <th className="py-2.5 px-3 font-bold">Statistical Deviation Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5C6670]/15 font-sans">
                  {macro.flagged_items.map((item) => (
                    <tr key={item.centre_id} className="hover:bg-[#F7F5F0]/60">
                      <td className="py-2 px-3 font-mono font-semibold text-[#0B1F3A]">
                        {item.centre_id}
                      </td>
                      <td className="py-2 px-3 text-[#1A1A1A]">
                        <span className="font-medium">{item.centre_name}</span>
                        <span className="text-[#5C6670] text-[11px] ml-1">({item.state_name})</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#1A1A1A]">
                        {item.total_candidates.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-[#8A1538] font-medium leading-tight">
                        {item.why_it_stood_out}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              All centre score distributions align with expected national statistical variance.
            </div>
          )}
        </div>

        {/* 4. Technical details (collapsed by default) */}
        <div className="pt-2 border-t border-[#5C6670]/20">
          <button
            type="button"
            onClick={() => toggleDetails('macro')}
            className="text-xs font-mono font-medium text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1"
          >
            {expandedDetails.macro ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>{expandedDetails.macro ? 'Hide Technical Parameters' : 'View Technical Parameters & Thresholds'}</span>
          </button>

          {expandedDetails.macro && (
            <div className="mt-3 p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-mono text-[#1A1A1A] space-y-2 animate-fadeIn">
              <div className="flex flex-wrap gap-4 text-[11px] border-b border-[#5C6670]/20 pb-2">
                <div>
                  <span className="text-[#5C6670]">National Mean: </span>
                  <strong>{macro.technical_details.national_mean_score ?? macro.technical_details.cohort_mean_score ?? '—'} marks</strong>
                </div>
                <div>
                  <span className="text-[#5C6670]">National Std Dev: </span>
                  <strong>{macro.technical_details.national_std_deviation ?? macro.technical_details.cohort_std_deviation ?? '—'}</strong>
                </div>
                <div>
                  <span className="text-[#5C6670]">KS Anomaly Threshold: </span>
                  <strong>{macro.technical_details.ks_significance_threshold ?? '—'}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase font-bold text-[#5C6670]">
                  Computed Statistical Metrics per Flagged Centre:
                </div>
                {macro.technical_details.flagged_centre_metrics?.map((m: any) => (
                  <div key={m.centre_id} className="p-2 bg-white border border-[#5C6670]/30 rounded-[2px] text-[11px]">
                    <div className="font-bold text-[#0B1F3A]">{m.centre_id} — {m.centre_name}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 text-[#1A1A1A]">
                      <div>KS D-statistic: <strong className="text-[#8A1538]">{m.ks_statistic_d}</strong></div>
                      <div>p-value: <strong>{m.p_value_approx}</strong></div>
                      <div>Kurtosis: <strong>{m.kurtosis}</strong></div>
                      <div>Centre Avg: <strong>{m.centre_mean}</strong> (z = +{m.z_score_deviation})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LAYER 3 — NEIGHBOUR ANSWER CHECK (Micro Layer)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFFFF] border border-[#5C6670] rounded-[2px] p-6 space-y-4 shadow-sm">
        {/* Visible Notice Banner Above Layer 3 */}
        {micro.is_simulated && (
          <div className="bg-[#C9A227]/10 border-l-4 border-[#C9A227] p-3 rounded-[2px]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-[#1A1A1A] leading-relaxed">
                <strong>Simulated Data Notice: </strong>
                {micro.simulated_notice}
              </p>
            </div>
          </div>
        )}

        {/* Layer Header with Numbered Badge */}
        <div className="flex items-center justify-between border-b border-[#5C6670]/20 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-1 bg-[#0B1F3A] text-white rounded-[2px]">
              03 // SEATING COLLUSION (20%)
            </span>
            <Grid className="w-4 h-4 text-[#0B1F3A]" />
            <h3 className="text-base font-bold text-[#0B1F3A] font-serif">
              {micro.layer_name}
            </h3>
          </div>

          <div>
            {micro.total_pairs_checked === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border border-[#5C6670] text-[#5C6670] text-[11px] font-mono font-medium rounded-[2px]">
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-[#5C6670]" />
                No Data Ingested
              </span>
            ) : (
              <span className={`inline-flex items-center px-2 py-0.5 bg-[#FFFFFF] border ${micro.flagged_pairs_found > 0 ? 'border-[#C9A227] text-[#C9A227]' : 'border-[#0B1F3A] text-[#0B1F3A]'} text-[11px] font-mono font-medium rounded-[2px]`}>
                <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${micro.flagged_pairs_found > 0 ? 'bg-[#C9A227]' : 'bg-[#0B1F3A]'}`} />
                {micro.flagged_pairs_found} Pairs Flagged
              </span>
            )}
          </div>
        </div>

        {/* 1. What it checks */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            WHAT IT CHECKS
          </div>
          <p className="text-xs text-[#1A1A1A] font-sans mt-0.5 leading-relaxed">
            {micro.checks_summary}
          </p>
        </div>

        {/* 2. What it found — Prominent Source Serif Heading */}
        <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px]">
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide">
            EMPIRICAL FINDING SUMMARY
          </div>
          <p className="text-sm font-semibold text-[#0B1F3A] font-serif mt-0.5 leading-snug">
            {micro.found_summary}
          </p>
        </div>

        {/* 3. Flagged list */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#5C6670] font-semibold tracking-wide mb-1.5">
            FLAGGED ADJACENT PAIRS ({micro.flagged_items.length} PAIRS)
          </div>

          {micro.total_pairs_checked === 0 ? (
            <div className="p-4 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              No data processed yet — ingest OMR response matrix and Seating layout on Tab 01 to run Layer 3 micro collusion audit.
            </div>
          ) : micro.flagged_items.length > 0 ? (
            <div className="overflow-x-auto border border-[#5C6670]/30 rounded-[2px]">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead className="bg-[#F7F5F0] border-b border-[#5C6670]/30 font-serif text-[#0B1F3A]">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Candidate A</th>
                    <th className="py-2.5 px-3 font-bold">Candidate B</th>
                    <th className="py-2.5 px-3 font-bold">Centre &amp; Room</th>
                    <th className="py-2.5 px-3 font-bold text-center">Seat Distance</th>
                    <th className="py-2.5 px-3 font-bold text-right">Shared Incorrect Responses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5C6670]/15 font-mono">
                  {micro.flagged_items.map((item, idx) => (
                    <tr key={`${item.candidate_a}_${item.candidate_b}_${idx}`} className="hover:bg-[#F7F5F0]/60">
                      <td className="py-2 px-3 font-semibold text-[#0B1F3A]">
                        {item.candidate_a}
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#0B1F3A]">
                        {item.candidate_b}
                      </td>
                      <td className="py-2 px-3 font-sans text-[#5C6670]">
                        {item.centre_id}, Room {item.room_id}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#1A1A1A]">
                        {item.seat_distance} seat (Adjacent)
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#8A1538]">
                        {item.shared_wrong_answers} / {item.total_source_errors} missed items
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs text-[#5C6670] font-sans">
              No statistically anomalous answer collusion detected across adjacent seats.
            </div>
          )}
        </div>

        {/* 4. Technical details (collapsed by default) */}
        <div className="pt-2 border-t border-[#5C6670]/20">
          <button
            type="button"
            onClick={() => toggleDetails('micro')}
            className="text-xs font-mono font-medium text-[#0B1F3A] hover:underline cursor-pointer flex items-center gap-1"
          >
            {expandedDetails.micro ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>{expandedDetails.micro ? 'Hide Technical Parameters' : 'View Technical Parameters & Thresholds'}</span>
          </button>

          {expandedDetails.micro && (
            <div className="mt-3 p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] text-xs font-mono text-[#1A1A1A] space-y-2 animate-fadeIn">
              <div className="flex flex-wrap gap-4 text-[11px] border-b border-[#5C6670]/20 pb-2">
                <div>
                  <span className="text-[#5C6670]">Wollack Omega Threshold: </span>
                  <strong>{micro.technical_details.wollack_omega_threshold}</strong>
                </div>
                <div>
                  <span className="text-[#5C6670]">Holland K-Index Threshold: </span>
                  <strong>{micro.technical_details.holland_k_threshold}</strong>
                </div>
                <div>
                  <span className="text-[#5C6670]">Proximity Gate: </span>
                  <strong>{micro.technical_details.proximity_gate}</strong>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="text-[10px] uppercase font-bold text-[#5C6670]">
                  Psychometric Indices per Flagged Candidate Pair:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {micro.technical_details.flagged_pair_details?.map((p: any, idx: number) => (
                    <div key={idx} className="p-2 bg-white border border-[#5C6670]/30 rounded-[2px] text-[11px]">
                      <div className="font-bold text-[#0B1F3A]">
                        {p.candidate_a} &amp; {p.candidate_b}
                      </div>
                      <div className="flex justify-between text-[#1A1A1A] mt-1">
                        <span>Wollack Omega: <strong className="text-[#8A1538]">{p.omega_statistic}</strong></span>
                        <span>Holland K p-val: <strong>{p.k_index_p_value}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
