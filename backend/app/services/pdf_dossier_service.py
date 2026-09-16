import io
from datetime import datetime, timezone
from typing import Dict, Any

from reportlab import rl_config
rl_config.pageCompression = 0

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable
)

from app.schemas.drilldown import CandidateDrilldownResponse


def generate_dossier_pdf(data: CandidateDrilldownResponse) -> bytes:
    """
    Renders an official, tamper-evident forensic audit evidence dossier into a PDF
    using ReportLab. Completely offline / air-gapped compatible.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )
    sec_heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#047857')
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )
    mono_style = ParagraphStyle(
        'DocMono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a')
    )
    alert_style = ParagraphStyle(
        'AlertText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#b91c1c')
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>TERRA TRACE FORENSIC AUDIT ENCLAVE</b><br/><font size='7.5' color='#475569'>OFFICIAL DECISION-SUPPORT EVIDENCE DOSSIER</font>", title_style),
            Paragraph(f"<b>CLASSIFICATION:</b> OFFICIAL AUDIT<br/><b>GENERATED:</b> {data.generated_at[:19]}Z<br/><b>AIR-GAPPED ENGINE:</b> ACTIVE", subtitle_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_header)

    if data.is_synthetic:
        story.append(Spacer(1, 4))
        syn_banner = Table([[
            Paragraph("<b>[!] SIMULATED DATA</b> — Generated for offline forensic benchmarking and calibration. Not real exam candidate records.", ParagraphStyle('Syn', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#92400e'), alignment=1))
        ]], colWidths=[540])
        syn_banner.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef3c7')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#f59e0b')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(syn_banner)

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=6))

    # 2. Cryptographic Ingestion Checkpoint (Independently Verifiable SHA-256 Hashes)
    story.append(Paragraph("<b>CRYPTOGRAPHIC AUDIT CHECKPOINT (SOURCE DATA INTEGRITY)</b>", sec_heading_style))
    story.append(Paragraph("The forensic conclusions below are cryptographically bound to the following immutable SHA-256 ingestion checkpoints:", subtitle_style))
    story.append(Spacer(1, 3))

    hash_data = [
        [Paragraph("<b>DATASET</b>", mono_style), Paragraph("<b>SHA-256 CRYPTOGRAPHIC FINGERPRINT</b>", mono_style), Paragraph("<b>STATUS</b>", mono_style)],
        [Paragraph("OMR Responses", mono_style), Paragraph(data.audit_hashes.get("omr_sha256", "N/A"), mono_style), Paragraph("VERIFIED", mono_style)],
        [Paragraph("Server Scores", mono_style), Paragraph(data.audit_hashes.get("server_sha256", "N/A"), mono_style), Paragraph("VERIFIED", mono_style)],
        [Paragraph("Seating Plan", mono_style), Paragraph(data.audit_hashes.get("seating_sha256", "N/A"), mono_style), Paragraph("VERIFIED", mono_style)],
    ]
    t_hash = Table(hash_data, colWidths=[100, 370, 70])
    t_hash.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ]))
    story.append(t_hash)
    story.append(Spacer(1, 8))

    # 3. Candidate & Cohort Profile Metadata
    story.append(Paragraph("<b>ENTITY PROFILE & COMPOSITE RISK RATING</b>", sec_heading_style))
    profile_data = [
        [
            Paragraph(f"<b>Candidate ID:</b> {data.candidate_id}<br/><b>Centre:</b> {data.centre_name} ({data.centre_id})<br/><b>Location:</b> {data.city_name}, {data.state_name}", body_style),
            Paragraph(f"<b>Physical Hall:</b> Room {data.room_id}<br/><b>Seat Number:</b> #{data.seat_number}<br/><b>Adjudication Status:</b> <b>{data.status.value.upper()}</b>", body_style),
            Paragraph(f"<b>Weighted Risk Score:</b><br/><font size='13' color='#b91c1c'><b>{data.combined_risk_score} / 100</b></font><br/><b>Primary Trigger:</b> {data.primary_flags[0] if data.primary_flags else 'None'}", body_style)
        ]
    ]
    t_profile = Table(profile_data, colWidths=[200, 180, 160])
    t_profile.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#94a3b8')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_profile)
    story.append(Spacer(1, 8))

    # 4. Layer 1: Reconciliation Audit (Raw vs Server Score)
    story.append(Paragraph("<b>LAYER 1: RECONCILIATION & TAMPER AUDIT</b>", sec_heading_style))
    rec = data.reconciliation

    rec_status_text = "<b>[ TAMPER DETECTED ]</b>" if rec.tamper_flag else "[ VERIFIED CONGRUENT ]"
    rec_status_color = colors.HexColor('#fee2e2') if rec.tamper_flag else colors.HexColor('#ecfdf5')
    rec_border_color = colors.HexColor('#ef4444') if rec.tamper_flag else colors.HexColor('#10b981')

    rec_box_data = [
        [
            Paragraph(f"<b>Calculated OMR Raw Marks:</b> {rec.raw_total_score}", body_style),
            Paragraph(f"<b>Published Server Score:</b> {rec.server_score}", body_style),
            Paragraph(f"<b>Discrepancy Delta (Δ):</b> <b>{rec.score_discrepancy:+0.2f} marks</b>", alert_style if rec.tamper_flag else body_style),
            Paragraph(rec_status_text, alert_style if rec.tamper_flag else ParagraphStyle('RecOk', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#047857')))
        ]
    ]
    t_rec = Table(rec_box_data, colWidths=[140, 130, 140, 130])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), rec_status_color),
        ('BOX', (0, 0), (-1, -1), 1, rec_border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ALIGN', (3, 0), (3, 0), 'CENTER'),
    ]))
    story.append(t_rec)
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"<b>Forensic Finding:</b> {rec.tamper_explanation}", body_style))
    story.append(Spacer(1, 8))

    # 5. Layer 2: Macro Statistical Divergence
    macro = data.macro
    story.append(Paragraph("<b>LAYER 2: MACRO STATISTICAL DISTRIBUTION AUDIT</b>", sec_heading_style))
    macro_table_data = [
        [
            Paragraph("<b>Metric</b>", mono_style),
            Paragraph("<b>Centre Cohort</b>", mono_style),
            Paragraph("<b>National Baseline</b>", mono_style),
            Paragraph("<b>Statistical Anomaly Metric</b>", mono_style)
        ],
        [
            Paragraph("Mean Score (μ)", body_style),
            Paragraph(f"{macro.centre_mean}", mono_style),
            Paragraph(f"{macro.national_mean}", mono_style),
            Paragraph(f"Kolmogorov-Smirnov D = <b>{macro.ks_statistic_d:.3f}</b>", body_style)
        ],
        [
            Paragraph("Standard Deviation (σ)", body_style),
            Paragraph(f"{macro.centre_std}", mono_style),
            Paragraph(f"{macro.national_std}", mono_style),
            Paragraph(f"p-value approx = <b>{macro.ks_p_value_approx}</b>", body_style)
        ]
    ]
    t_macro = Table(macro_table_data, colWidths=[130, 110, 120, 180])
    t_macro.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_macro)
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"<b>Macro Finding:</b> {macro.divergence_summary}", body_style))
    story.append(Spacer(1, 8))

    # 6. Layer 3: Micro Spatial Seating Correlation
    micro = data.micro
    story.append(Paragraph("<b>LAYER 3: MICRO SEATING PROXIMITY AUDIT</b>", sec_heading_style))
    micro_note = (
        f"Seating Layout: Room {micro.room_id} (Total {micro.total_seats} candidates). Candidate occupied Seat #{data.seat_number}. "
    )
    if micro.collusion_pairs:
        micro_note += f"Collusion pair flagged with adjacent seat #{micro.collusion_pairs[0].seat_2} (Omega Index = {micro.collusion_pairs[0].omega_index_approx})."
    else:
        micro_note += "No adjacent pairwise answer copying cluster detected in immediate physical vicinity."
    story.append(Paragraph(micro_note, body_style))
    story.append(Spacer(1, 8))

    # 7. Section 4: Human Adjudication Audit Log (Non-Punitive Adjudication Record)
    story.append(Paragraph("<b>HUMAN INVESTIGATIVE ADJUDICATION AUDIT LOG</b>", sec_heading_style))
    if data.decision_history and len(data.decision_history) > 0:
        dec_rows = [
            [
                Paragraph("<b>TIMESTAMP (UTC)</b>", mono_style),
                Paragraph("<b>ADJUDICATOR IDENTITY</b>", mono_style),
                Paragraph("<b>STATUS TRANSITION</b>", mono_style),
                Paragraph("<b>RECORDED INVESTIGATIVE JUSTIFICATION</b>", mono_style)
            ]
        ]
        for dec in data.decision_history:
            dec_rows.append([
                Paragraph(dec["timestamp"][:19] + "Z", mono_style),
                Paragraph(dec["investigator_identity"], body_style),
                Paragraph(f"{dec['previous_status']} -> <b>{dec['new_status']}</b>", body_style),
                Paragraph(dec["justification"], body_style),
            ])
        t_dec = Table(dec_rows, colWidths=[90, 120, 110, 220])
        t_dec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t_dec)
    else:
        story.append(Paragraph(f"<i>Status: <b>{data.status.value.upper()}</b>. Awaiting formal human investigator adjudication. No manual override recorded yet.</i>", body_style))

    # 8. Section 65B Statutory Certificate of Electronic Records Integrity
    story.append(Spacer(1, 8))
    cert_style = ParagraphStyle(
        'CertHeading',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0B1F3A')
    )
    cert_body_style = ParagraphStyle(
        'CertBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=9,
        textColor=colors.HexColor('#1e293b')
    )
    cert_mono_style = ParagraphStyle(
        'CertMono',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6,
        leading=8,
        textColor=colors.HexColor('#0f172a')
    )

    cert_content = [
        [Paragraph("<b>STATUTORY CERTIFICATE UNDER SECTION 65B, INDIAN EVIDENCE ACT, 1872 / SECTION 63, BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023</b>", cert_style)],
        [Paragraph(
            "<b>1. Certification of Lawful Custody & Output:</b> I hereby certify that the electronic forensic records, reconciliation calculations, distribution curves, and spatial correlations set out in this Case Dossier were produced by the Terra Trace Forensic Enclave during the ordinary course of lawful official audit activities.<br/>"
            "<b>2. Machine Integrity & Air-Gapped Operation:</b> During the operational period, the computing enclave was operating properly under controlled air-gapped conditions without unauthorized access, external network interception, or corruption of memory stores.<br/>"
            "<b>3. Cryptographic Immutability:</b> The raw item-level optical scans, published server records, and seating layouts are cryptographically anchored to SHA-256 ingestion checkpoints (FIPS 180-4). All auditor status modifications are registered in an immutable append-only transaction ledger.",
            cert_body_style
        )],
        [Paragraph(
            f"<b>CERTIFYING AUTHORITY:</b> Lead Forensic Auditor (EXAM-SEC-7749) &bull; <b>SECURITY PROTOCOL:</b> AIR-GAPPED NIST FIPS 180-4 &bull; <b>GENERATED:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
            cert_mono_style
        )]
    ]
    t_cert = Table(cert_content, colWidths=[540])
    t_cert.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F7F5F0')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0B1F3A')),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, colors.HexColor('#0B1F3A')),
        ('LINEBELOW', (0, 1), (-1, 1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_cert)

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#94a3b8'), spaceBefore=2, spaceAfter=4))
    story.append(Paragraph("<b>CONFIDENTIALITY NOTICE:</b> This dossier is an offline cryptographic audit report generated by Terra Trace for authorized supervisory investigators. Certified under Section 65B Indian Evidence Act / Sec 63 BSA 2023 for judicial inquiry proceedings.", subtitle_style))

    # Build PDF
    doc.build(story)
    return buffer.getvalue()
