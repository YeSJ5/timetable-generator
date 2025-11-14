import { useState } from 'react';

interface TimetableCellProps {
  cell: any;
  isBreak?: boolean;
  breakLabel?: string;
  onHover?: (cell: any) => void;
}

export default function TimetableCell({ cell, isBreak, breakLabel, onHover }: TimetableCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isBreak) {
    return (
      <td className="bg-gray-300 border border-gray-400 px-2 py-3 text-center font-semibold text-xs text-gray-700 print:bg-gray-300">
        {breakLabel}
      </td>
    );
  }

  if (!cell || cell.type === 'empty' || cell.colSpan === 0) {
    return (
      <td className="border border-gray-200 px-2 py-3 min-h-[80px] min-w-[100px] bg-white print:border-gray-300"></td>
    );
  }

  if (cell.type === 'lab') {
    return (
      <td
        colSpan={cell.colSpan || 1}
        className="bg-orange-200 border-2 border-orange-400 px-2 py-3 text-center align-middle print:bg-orange-100 print:border-orange-300"
        onMouseEnter={() => {
          setIsHovered(true);
          onHover?.(cell);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="font-semibold text-sm text-orange-900">{cell.labName}</div>
        <div className="text-xs text-orange-700 mt-1">
          ({cell.teacherInitials})
        </div>
        <div className="text-xs text-orange-600 mt-1">{cell.roomName}</div>
        {isHovered && cell.subjectName && (
          <div className="absolute z-10 bg-gray-800 text-white p-2 rounded shadow-lg text-xs mt-1">
            {cell.subjectName}
          </div>
        )}
      </td>
    );
  }

  if (cell.type === 'theory') {
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-purple-100 border-purple-300',
      'bg-pink-100 border-pink-300',
      'bg-yellow-100 border-yellow-300',
      'bg-indigo-100 border-indigo-300',
    ];
    const colorIndex = (cell.subjectCode?.charCodeAt(0) || 0) % colors.length;
    const colorClass = colors[colorIndex];

    return (
      <td
        className={`${colorClass} border-2 px-2 py-3 text-center align-middle rounded-sm shadow-sm hover:shadow-md transition-shadow print:border-gray-400`}
        onMouseEnter={() => {
          setIsHovered(true);
          onHover?.(cell);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="font-bold text-sm">{cell.subjectCode}</div>
        <div className="text-xs text-gray-600 mt-1">({cell.teacherInitials})</div>
        <div className="text-xs text-gray-500 mt-1">{cell.roomName}</div>
        {isHovered && cell.subjectName && (
          <div className="absolute z-10 bg-gray-800 text-white p-2 rounded shadow-lg text-xs mt-1">
            {cell.subjectName}
          </div>
        )}
      </td>
    );
  }

  return (
    <td className="border border-gray-200 px-2 py-3 min-h-[80px] bg-white"></td>
  );
}

