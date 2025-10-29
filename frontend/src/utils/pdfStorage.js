// PDF export/import functionality using jsPDF and pdf-parse
import jsPDF from 'jspdf';

// Export resume as PDF
export function exportResumeAsPDF(resumeData, templateStyle = 'modern') {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, maxWidth, fontSize = 12, style = 'normal') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', style);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.5);
    };

    // Helper function to add section header
    const addSectionHeader = (title, y) => {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 102, 204); // Blue color
      pdf.text(title.toUpperCase(), margin, y);
      
      // Add underline
      const textWidth = pdf.getTextWidth(title.toUpperCase());
      pdf.setDrawColor(0, 102, 204);
      pdf.line(margin, y + 2, margin + textWidth, y + 2);
      
      pdf.setTextColor(0, 0, 0); // Reset to black
      return y + 15;
    };

    // Title/Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text(resumeData.name || 'Resume', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Contact Information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const contactInfo = `${resumeData.email || ''} | ${resumeData.phone || ''}`;
    pdf.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Objective (if available)
    if (resumeData.summary) {
      yPosition = addSectionHeader('Objective', yPosition);
      yPosition = addText(resumeData.summary, margin, yPosition, pageWidth - 2 * margin) + 10;
    }

    // Education Section
    if (resumeData.education_10th || resumeData.education_12th || resumeData.education_grad) {
      yPosition = addSectionHeader('Education', yPosition);
      
      if (resumeData.education_grad) {
        yPosition = addText(`Graduation: ${resumeData.education_grad}`, margin, yPosition, pageWidth - 2 * margin, 11) + 5;
      }
      if (resumeData.education_pg && resumeData.education_pg !== 'NA') {
        yPosition = addText(`Post-Graduation: ${resumeData.education_pg}`, margin, yPosition, pageWidth - 2 * margin, 11) + 5;
      }
      if (resumeData.education_12th) {
        yPosition = addText(`12th: ${resumeData.education_12th}`, margin, yPosition, pageWidth - 2 * margin, 11) + 5;
      }
      if (resumeData.education_10th) {
        yPosition = addText(`10th: ${resumeData.education_10th}`, margin, yPosition, pageWidth - 2 * margin, 11) + 5;
      }
      yPosition += 10;
    }

    // Skills Section
    if (resumeData.technical_skills || resumeData.soft_skills) {
      yPosition = addSectionHeader('Skills', yPosition);
      
      if (resumeData.technical_skills) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Technical Skills:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition = addText(resumeData.technical_skills, margin + 40, yPosition, pageWidth - 2 * margin - 40, 11) + 5;
      }
      
      if (resumeData.soft_skills) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Soft Skills:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition = addText(resumeData.soft_skills, margin + 40, yPosition, pageWidth - 2 * margin - 40, 11) + 5;
      }
      yPosition += 10;
    }

    // Experience Section
    if (resumeData.experience && resumeData.fresher_status === 'no') {
      yPosition = addSectionHeader('Work Experience', yPosition);
      
      // Split experiences by '---' separator
      const experiences = resumeData.experience.split('---').map(exp => exp.trim());
      experiences.forEach((exp, index) => {
        if (exp) {
          yPosition = addText(`• ${exp}`, margin, yPosition, pageWidth - 2 * margin, 11) + 8;
        }
      });
      yPosition += 10;
    }

    // Projects Section
    if (resumeData.projects && resumeData.fresher_status === 'yes') {
      yPosition = addSectionHeader('Projects', yPosition);
      
      // Split projects by '---' separator
      const projects = resumeData.projects.split('---').map(proj => proj.trim());
      projects.forEach((proj, index) => {
        if (proj) {
          yPosition = addText(`• ${proj}`, margin, yPosition, pageWidth - 2 * margin, 11) + 8;
        }
      });
      yPosition += 10;
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generate filename
    const filename = `${resumeData.name?.replace(/\s+/g, '_') || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    return {
      success: true,
      message: 'Resume exported as PDF successfully!',
      filename: filename
    };
  } catch (error) {
    console.error('PDF export error:', error);
    return {
      success: false,
      message: 'Failed to export PDF: ' + error.message
    };
  }
}

// Enhanced PDF export with multiple templates
export function exportResumeAsPDFWithTemplate(resumeData, template = 'professional') {
  try {
    const pdf = new jsPDF();
    
    switch (template) {
      case 'modern':
        return exportModernTemplate(pdf, resumeData);
      case 'creative':
        return exportCreativeTemplate(pdf, resumeData);
      default:
        return exportProfessionalTemplate(pdf, resumeData);
    }
  } catch (error) {
    console.error('PDF template export error:', error);
    return {
      success: false,
      message: 'Failed to export PDF with template: ' + error.message
    };
  }
}

// Professional template
function exportProfessionalTemplate(pdf, resumeData) {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Header with name
  pdf.setFillColor(0, 51, 102);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(resumeData.name || 'Professional Resume', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`${resumeData.email || ''} | ${resumeData.phone || ''}`, pageWidth / 2, 35, { align: 'center' });
  
  yPosition = 60;
  pdf.setTextColor(0, 0, 0);

  // Add sections with professional styling
  const sections = [
    { title: 'Education', content: formatEducation(resumeData) },
    { title: 'Technical Skills', content: resumeData.technical_skills },
    { title: 'Soft Skills', content: resumeData.soft_skills },
    { title: resumeData.fresher_status === 'yes' ? 'Projects' : 'Experience', 
      content: resumeData.fresher_status === 'yes' ? resumeData.projects : resumeData.experience }
  ];

  sections.forEach(section => {
    if (section.content) {
      yPosition = addProfessionalSection(pdf, section.title, section.content, yPosition, pageWidth, margin);
    }
  });

  const filename = `${resumeData.name?.replace(/\s+/g, '_') || 'resume'}_professional.pdf`;
  pdf.save(filename);
  
  return { success: true, message: 'Professional PDF exported!', filename };
}

// Modern template with colors and styling
function exportModernTemplate(pdf, resumeData) {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Modern header with gradient effect (simulated)
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(resumeData.name || 'Modern Resume', margin, 30);
  
  pdf.setFontSize(11);
  pdf.text(`${resumeData.email || ''} | ${resumeData.phone || ''}`, margin, 42);
  
  yPosition = 70;
  pdf.setTextColor(0, 0, 0);

  // Add modern styled sections
  const sections = [
    { title: 'Education', content: formatEducation(resumeData), color: [52, 152, 219] },
    { title: 'Technical Skills', content: resumeData.technical_skills, color: [46, 204, 113] },
    { title: 'Soft Skills', content: resumeData.soft_skills, color: [155, 89, 182] },
    { title: resumeData.fresher_status === 'yes' ? 'Projects' : 'Experience', 
      content: resumeData.fresher_status === 'yes' ? resumeData.projects : resumeData.experience,
      color: [230, 126, 34] }
  ];

  sections.forEach(section => {
    if (section.content) {
      yPosition = addModernSection(pdf, section.title, section.content, section.color, yPosition, pageWidth, margin);
    }
  });

  const filename = `${resumeData.name?.replace(/\s+/g, '_') || 'resume'}_modern.pdf`;
  pdf.save(filename);
  
  return { success: true, message: 'Modern PDF exported!', filename };
}

// Helper functions for templates
function formatEducation(resumeData) {
  const education = [];
  if (resumeData.education_grad) education.push(`Graduation: ${resumeData.education_grad}`);
  if (resumeData.education_pg && resumeData.education_pg !== 'NA') education.push(`Post-Graduation: ${resumeData.education_pg}`);
  if (resumeData.education_12th) education.push(`12th: ${resumeData.education_12th}`);
  if (resumeData.education_10th) education.push(`10th: ${resumeData.education_10th}`);
  return education.join('\n');
}

function addProfessionalSection(pdf, title, content, yPosition, pageWidth, margin) {
  // Section header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text(title, margin + 5, yPosition + 5);
  
  yPosition += 20;
  
  // Content
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin - 10);
  pdf.text(lines, margin + 5, yPosition);
  
  return yPosition + (lines.length * 6) + 15;
}

function addModernSection(pdf, title, content, color, yPosition, pageWidth, margin) {
  // Colored section header
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 18, 'F');
  
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, margin + 8, yPosition + 7);
  
  yPosition += 25;
  
  // Content with modern styling
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  
  const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin - 15);
  pdf.text(lines, margin + 8, yPosition);
  
  return yPosition + (lines.length * 5) + 20;
}

// Creative template
function exportCreativeTemplate(pdf, resumeData) {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Creative header with artistic elements
  pdf.setFillColor(142, 68, 173); // Purple
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Add some decorative elements
  pdf.setFillColor(155, 89, 182);
  pdf.circle(pageWidth - 30, 22, 15, 'F');
  pdf.setFillColor(52, 73, 94);
  pdf.circle(30, 22, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(resumeData.name || 'Creative Resume', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.text(`✉ ${resumeData.email || ''} | ☎ ${resumeData.phone || ''}`, pageWidth / 2, 38, { align: 'center' });
  
  yPosition = 65;
  pdf.setTextColor(0, 0, 0);

  // Add creative sections with artistic styling
  const sections = [
    { title: '🎨 Education', content: formatEducation(resumeData), color: [231, 76, 60] },
    { title: '⚡ Technical Skills', content: resumeData.technical_skills, color: [46, 204, 113] },
    { title: '💫 Soft Skills', content: resumeData.soft_skills, color: [52, 152, 219] },
    { title: resumeData.fresher_status === 'yes' ? '🌟 Projects' : '🏆 Experience', 
      content: resumeData.fresher_status === 'yes' ? resumeData.projects : resumeData.experience,
      color: [241, 196, 15] }
  ];

  sections.forEach(section => {
    if (section.content) {
      yPosition = addCreativeSection(pdf, section.title, section.content, section.color, yPosition, pageWidth, margin);
    }
  });

  const filename = `${resumeData.name?.replace(/\s+/g, '_') || 'resume'}_creative.pdf`;
  pdf.save(filename);
  
  return { success: true, message: 'Creative PDF exported!', filename };
}


// Helper function for creative sections
function addCreativeSection(pdf, title, content, color, yPosition, pageWidth, margin) {
  // Creative section header with rounded corners effect
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.roundedRect(margin, yPosition - 8, pageWidth - 2 * margin, 20, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, margin + 10, yPosition + 5);
  
  yPosition += 25;
  
  // Content with creative styling
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(50, 50, 50);
  
  const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin - 20);
  pdf.text(lines, margin + 10, yPosition);
  
  return yPosition + (lines.length * 5) + 25;
}


// Bulk export multiple resumes
export function exportMultipleResumesAsPDF(resumesArray, template = 'professional') {
  try {
    const results = [];
    
    resumesArray.forEach((resume, index) => {
      const result = exportResumeAsPDFWithTemplate(resume, template);
      results.push({
        index,
        name: resume.name,
        success: result.success,
        filename: result.filename,
        message: result.message
      });
    });
    
    return {
      success: true,
      message: `Exported ${results.filter(r => r.success).length}/${results.length} resumes as PDF`,
      results
    };
  } catch (error) {
    console.error('Bulk PDF export error:', error);
    return {
      success: false,
      message: 'Failed to export multiple PDFs: ' + error.message
    };
  }
}

// PDF import functionality removed - focus on export only
// Users can manually enter data through the chat interface
