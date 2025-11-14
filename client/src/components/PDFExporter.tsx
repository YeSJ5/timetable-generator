import { RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExporterProps {
  tableRef: RefObject<HTMLDivElement>;
  sectionName: string;
  departmentName?: string;
  academicYear?: string;
}

export default function PDFExporter({
  tableRef,
  sectionName,
  departmentName = 'ISE Department',
  academicYear = new Date().getFullYear().toString(),
}: PDFExporterProps) {
  const handleExportPDF = async () => {
    if (!tableRef.current) {
      alert('Timetable not ready for export');
      return;
    }

    try {
      // Show loading
      const button = document.activeElement as HTMLButtonElement;
      const originalText = button?.textContent;
      if (button) {
        button.disabled = true;
        button.textContent = 'Generating PDF...';
      }

      // Capture with high quality
      const canvas = await html2canvas(tableRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: tableRef.current.scrollWidth,
        windowHeight: tableRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create PDF in landscape A4
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      // Center on page
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      // Add header
      pdf.setFontSize(16);
      pdf.text(departmentName, pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(
        `Academic Year: ${academicYear} | Section: ${sectionName}`,
        pdfWidth / 2,
        22,
        { align: 'center' }
      );
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        pdfWidth / 2,
        28,
        { align: 'center' }
      );

      // Add timetable image
      pdf.addImage(imgData, 'PNG', x, y + 5, width, height - 10);

      // Add footer with signature lines
      const footerY = pdfHeight - 20;
      pdf.setFontSize(10);
      pdf.text('HOD Signature', 30, footerY);
      pdf.text('Principal Signature', pdfWidth - 50, footerY);
      pdf.line(30, footerY + 5, 80, footerY + 5);
      pdf.line(pdfWidth - 50, footerY + 5, pdfWidth - 10, footerY + 5);

      // Save
      pdf.save(`timetable-${sectionName}-${academicYear}.pdf`);

      // Restore button
      if (button) {
        button.disabled = false;
        if (originalText) button.textContent = originalText;
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
    >
      Download High-Quality PDF
    </button>
  );
}

