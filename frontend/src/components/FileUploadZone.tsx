import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import type { RecordType } from '../types';
import { useIngestionStore } from '../stores/ingestionStore';
import { useAuth } from '../context/AuthContext';
import { CryptographicShield } from './CryptographicShield';

interface FileUploadZoneProps {
  recordType: RecordType;
  title: string;
  description: string;
  requiredColumns: string[];
  sampleFormat: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  recordType,
  title,
  description,
  requiredColumns,
  sampleFormat,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSynthetic, setIsSynthetic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { uploadStatus, datasets, uploadErrors, lastResponses, uploadFile } = useIngestionStore();

  const currentStatus = uploadStatus[recordType];
  const datasetInfo = datasets[recordType];
  const lastResponse = lastResponses[recordType];
  const error = uploadErrors[recordType];

  const schemaIndex = recordType === 'omr' ? '01' : recordType === 'server' ? '02' : '03';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    const uploader = user ? `${user.full_name} (${user.badge_id})` : 'Lead Forensic Auditor (EXAM-SEC-7749)';
    await uploadFile(file, recordType, isSynthetic, uploader);
  };

  return (
    <div className={`bg-[#FFFFFF] border-2 rounded-[2px] p-5 flex flex-col justify-between space-y-4 text-left shadow-sm ${
      recordType === 'omr' ? 'border-[#0B1F3A] ring-1 ring-[#0B1F3A]/20' : 'border-[#5C6670]'
    }`}>
      <div className="space-y-3">
        {/* Schema Number and Title */}
        <div className="border-b border-[#5C6670]/20 pb-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold">
            <span className={recordType === 'omr' ? 'text-[#0B1F3A]' : 'text-[#5C6670]'}>
              SCHEMA [{schemaIndex}] // {recordType.toUpperCase()} {recordType === 'omr' && '• PRIMARY RECORD'}
            </span>
            <span className="text-[#5C6670]">FORMAT: CSV / PARQUET</span>
          </div>
          <h4 className="text-base font-bold text-[#0B1F3A] font-serif mt-1">
            {title}
          </h4>
          <p className="text-xs text-[#5C6670] font-sans mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Required Schema Specification */}
        <div className="p-3 bg-[#F7F5F0] border border-[#5C6670]/40 rounded-[2px] space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-[#0B1F3A] uppercase">
            MANDATORY SCHEMA COLUMNS:
          </div>
          <div className="flex flex-wrap gap-1">
            {requiredColumns.map((col) => (
              <span
                key={col}
                className="px-1.5 py-0.5 rounded-[2px] bg-[#FFFFFF] border border-[#5C6670]/50 text-[#1A1A1A] font-mono text-[10px]"
              >
                {col}
              </span>
            ))}
          </div>
          <div className="text-[10px] font-mono text-[#5C6670] truncate pt-1 border-t border-[#5C6670]/20">
            REF: {sampleFormat}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[2px] p-4 text-center cursor-pointer transition-none ${
            isDragOver
              ? 'border-[#0B1F3A] bg-[#0B1F3A]/5'
              : 'border-[#5C6670] bg-[#FFFFFF] hover:bg-[#F7F5F0]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.parquet"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="w-4 h-4 text-[#0B1F3A]" />
            <div className="text-xs font-semibold text-[#0B1F3A] font-sans">
              Click or drag {recordType.toUpperCase()} file to ingest
            </div>
            <div className="text-[10px] font-mono text-[#5C6670]">
              AUTOMATIC SHA-256 HASH &amp; SCHEMA CHECK
            </div>
          </div>
        </div>

        {/* Synthetic Tagging Checkbox */}
        <label className="flex items-center gap-2 p-1.5 bg-[#F7F5F0] border border-[#5C6670]/30 rounded-[2px] text-xs font-sans cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSynthetic}
            onChange={(e) => setIsSynthetic(e.target.checked)}
            className="rounded-[2px] border-[#5C6670] text-[#0B1F3A] focus:ring-0 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-[#1A1A1A]">
            TAG AS SIMULATED BENCHMARK DATA
          </span>
        </label>

        {/* Cryptographic Shield State */}
        <CryptographicShield
          status={currentStatus}
          datasetInfo={datasetInfo}
          lastResponse={lastResponse}
          error={error}
          recordTypeName={title}
        />
      </div>
    </div>
  );
};
