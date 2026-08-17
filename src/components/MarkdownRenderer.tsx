'use client';

import { useState, useEffect } from 'react';

export function MarkdownRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    setHtml(parseMarkdown(content));
  }, [content]);

  return <div className="prose prose-sm max-w-none text-navy-900" dangerouslySetInnerHTML={{ __html: html }} />;
}

function parseMarkdown(text: string): string {
  let result = text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');

  result = result
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  result = result.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-navy-900 mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-navy-900 mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-navy-900 mt-4 mb-2">$1</h1>');

  result = result.replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>');
  result = result.replace(/(<li class="ml-4 mb-1">[\s\S]*?<\/li>)/g, '<ul class="list-disc space-y-1 mb-3">$1</ul>');

  result = result.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>');
  result = result.replace(/(<li class="ml-4 mb-1">[\s\S]*?<\/li>)/g, '<ol class="list-decimal space-y-1 mb-3">$1</ol>');

  result = result.replace(/\|(.+)\|/g, (match: string, cells: string) => {
    const cellArray = cells.split('|').map((c: string) => c.trim()).filter(Boolean);
    if (cellArray.length === 0) return match;
    const isHeader = match.includes('---');
    if (isHeader) return '';
    return `<tr>${cellArray.map((c: string) => `<td class="border border-slate-200 px-3 py-2 text-sm">${c}</td>`).join('')}</tr>`;
  });

  result = result.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table class="w-full border-collapse mb-3"><thead class="bg-slate-100">$1</thead></table>');

  result = result.replace(/\n\n/g, '</p><p class="mb-3">');
  result = result.replace(/\n/g, '<br />');
  result = `<p class="mb-3">${result}</p>`;

  result = result.replace(/<p class="mb-3"><\/p>/g, '');
  result = result.replace(/<p class="mb-3"><br \/><\/p>/g, '');
  result = result.replace(/<p class="mb-3">(<h[1-3] class=)/g, '$1');
  result = result.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  result = result.replace(/<p class="mb-3">(<ul class=)/g, '$1');
  result = result.replace(/(<\/ul>)<\/p>/g, '$1');
  result = result.replace(/<p class="mb-3">(<ol class=)/g, '$1');
  result = result.replace(/(<\/ol>)<\/p>/g, '$1');
  result = result.replace(/<p class="mb-3">(<table class=)/g, '$1');
  result = result.replace(/(<\/table>)<\/p>/g, '$1');

  return result;
}