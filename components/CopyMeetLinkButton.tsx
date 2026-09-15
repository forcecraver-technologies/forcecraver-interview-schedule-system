'use client';

import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';

interface CopyMeetLinkButtonProps {
  meetingLink?: string | null;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  copiedLabel?: string;
}

export default function CopyMeetLinkButton({
  meetingLink,
  className = '',
  variant = 'primary',
  size = 'md',
  label = 'Copy Meet Link',
  copiedLabel = 'Meet Link Copied!',
}: CopyMeetLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!meetingLink || !meetingLink.trim()) {
    if (variant === 'icon') {
      return (
        <span
          className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed inline-flex items-center justify-center"
          title="Meeting link not available"
        >
          <Copy className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed">
        <LinkIcon className="w-3.5 h-3.5" />
        <span>No link available</span>
      </span>
    );
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(meetingLink.trim());
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = meetingLink.trim();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy meeting link:', err);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${
          copied
            ? 'bg-emerald-50 text-emerald-600'
            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
        } ${className}`}
        title={copied ? 'Meet link copied!' : 'Copy meeting link'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-50" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Base styling for full buttons
  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = copied
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-95';
  } else if (variant === 'secondary') {
    variantStyles = copied
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200';
  } else if (variant === 'compact') {
    variantStyles = copied
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
      : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300';
  } else if (variant === 'text') {
    variantStyles = copied
      ? 'text-emerald-600 font-semibold'
      : 'text-blue-600 hover:text-blue-800 hover:underline font-semibold';
  }

  // Size styling
  let sizeStyles = '';
  if (size === 'lg') {
    sizeStyles = 'px-6 py-3 rounded-2xl text-sm font-bold';
  } else if (size === 'md') {
    sizeStyles = 'px-4 py-2 rounded-xl text-xs font-semibold';
  } else if (size === 'sm') {
    sizeStyles = 'px-2.5 py-1 rounded-lg text-xs font-medium';
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `Click to copy: ${meetingLink}`}
      className={`inline-flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${variantStyles} ${sizeStyles} ${className}`}
    >
      {copied ? (
        <>
          <Check className={size === 'lg' ? 'w-4 h-4 text-white animate-in zoom-in-50' : 'w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50'} />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
