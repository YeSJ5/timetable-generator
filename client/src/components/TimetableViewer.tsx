import { useRef, useState } from 'react';
import { getBreakLabel, isBreakSlot } from '../utils/timetableUtils';
import TimetableCell from './TimetableCell';
import PDFExporter from './PDFExporter';

interface TimetableCell {
  type: 'theory' | 'lab' | 'break' | 'empty';
  subjectCode?: string;
  subjectName?: string;
  teacherInitials?: string;
  teacherId?: string;
  roomName?: string;
  roomId?: string;
  labName?: string;
  durationSlots?: number;
  colSpan?: number;
}

interface TimetableData {
  [day: string]: (TimetableCell | null)[];
}

interface TimetableViewerProps {
  timetable: TimetableData;
  sectionName: string;
  slots?: string[];
  departmentName?: string;
  academicYear?: string;
}

const DEFAULT_SLOTS = [
  '8:30-9:30',
  '9:30-10:30',
  '10:30-10:45',
  '10:45-11:45',
  '11:45-12:45',
  '12:45-1:30',
  '1:30-2:30',
  '2:30-3:30',
  '3:30-4:30',
  '4:30-5:30',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function TimetableViewer({
  timetable,
  sectionName,
  slots = DEFAULT_SLOTS,
  departmentName = 'ISE Department',
  academicYear = new Date().getFullYear().toString(),
}: TimetableViewerProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<TimetableCell | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 print:p-0 print:shadow-none">
      {/* Header */}
      <div className="mb-6 print:mb-4">
        <div className="flex justify-between items-center mb-4 print:mb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 print:text-2xl">
              {departmentName}
            </h2>
            <p className="text-lg text-gray-600 print:text-sm">
              Academic Year: {academicYear} | Section: {sectionName}
            </p>
            <p className="text-sm text-gray-500 print:text-xs">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <PDFExporter
              tableRef={tableRef}
              sectionName={sectionName}
              departmentName={departmentName}
              academicYear={academicYear}
            />
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Print
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm print:text-xs print:mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>Theory Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-200 border-2 border-orange-400 rounded"></div>
            <span>Lab Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
            <span>Break</span>
          </div>
        </div>
      </div>

      {/* Timetable Table */}
      <div ref={tableRef} className="overflow-x-auto print:overflow-visible">
        <table className="min-w-full border-collapse border-2 border-gray-400 print:border-gray-600">
          <thead>
            <tr>
              <th className="border-2 border-gray-400 bg-gray-100 px-4 py-3 font-bold text-center print:bg-gray-200 print:border-gray-600">
                Day/Time
              </th>
              {slots.map((slot, idx) => {
                const isBreak = isBreakSlot(slot);
                return (
                  <th
                    key={idx}
                    className={`border-2 border-gray-400 px-3 py-2 font-semibold text-xs text-center print:border-gray-600 ${
                      isBreak
                        ? 'bg-gray-300 text-gray-700 print:bg-gray-300'
                        : 'bg-gray-100 print:bg-gray-200'
                    }`}
                  >
                    {isBreak ? getBreakLabel(slot) : slot}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const dayData = timetable[day] || [];
              return (
                <tr key={day}>
                  <td className="border-2 border-gray-400 bg-gray-100 px-4 py-3 font-bold text-center print:bg-gray-200 print:border-gray-600">
                    {day}
                  </td>
                  {slots.map((slot, slotIdx) => {
                    const cell = dayData[slotIdx];
                    const isBreak = isBreakSlot(slot);

                    // Skip rendered cells (colspan handling)
                    if (cell && cell.colSpan === 0) {
                      return null;
                    }

                    return (
                      <TimetableCell
                        key={slotIdx}
                        cell={cell}
                        isBreak={isBreak}
                        breakLabel={isBreak ? getBreakLabel(slot) : undefined}
                        onHover={setHoveredCell}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer for print */}
      <div className="mt-8 print:mt-4 print:border-t print:pt-4">
        <div className="grid grid-cols-2 gap-8 print:text-xs">
          <div>
            <p className="font-semibold">HOD Signature</p>
            <div className="mt-12 border-t border-gray-400"></div>
          </div>
          <div>
            <p className="font-semibold">Principal Signature</p>
            <div className="mt-12 border-t border-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
