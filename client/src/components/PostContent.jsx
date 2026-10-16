import React from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}"'])/gi;

export function linkifyText(text) {
  return String(text || '').split(URL_PATTERN).map((part, index) => {
    if (/^https?:\/\//i.test(part)) {
      const trailing = part.match(/[.,;:!?)\]}"']+$/)?.[0] || '';
      const url = trailing ? part.slice(0, -trailing.length) : part;
      return <React.Fragment key={`${index}-${url}`}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a>{trailing}</React.Fragment>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function PostContent({ content }) {
  return <>{String(content || '').split('\n').map((line, index, lines) => (
    <React.Fragment key={index}>{linkifyText(line)}{index < lines.length - 1 ? <br /> : null}</React.Fragment>
  ))}</>;
}
