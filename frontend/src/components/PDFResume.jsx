import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatEducation, formatSkills, generateSummary, getTemplateStyles } from '../templates/resumeTemplates';

// Create styles for PDF
const createStyles = (persona = 'professional') => {
  const templateStyles = getTemplateStyles(persona);
  
  return StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 20,
      borderBottom: `2 solid ${templateStyles.primaryColor}`,
      paddingBottom: 10,
    },
    name: {
      fontSize: templateStyles.headerSize,
      fontWeight: 'bold',
      color: templateStyles.primaryColor,
      marginBottom: 5,
    },
    contactInfo: {
      fontSize: 10,
      color: '#555555',
      marginBottom: 3,
    },
    section: {
      marginTop: templateStyles.sectionSpacing,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: templateStyles.primaryColor,
      marginBottom: 8,
      textTransform: 'uppercase',
      borderBottom: `1 solid ${templateStyles.accentColor}`,
      paddingBottom: 3,
    },
    text: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#333333',
      marginBottom: 5,
    },
    bulletPoint: {
      fontSize: 11,
      marginBottom: 4,
      marginLeft: 10,
      color: '#333333',
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
    },
    skillTag: {
      backgroundColor: '#f0f0f0',
      padding: '4 8',
      marginRight: 6,
      marginBottom: 6,
      borderRadius: 3,
      fontSize: 10,
    },
    educationItem: {
      marginBottom: 8,
    },
    educationLevel: {
      fontSize: 11,
      fontWeight: 'bold',
      color: templateStyles.accentColor,
      marginBottom: 2,
    },
    educationDetails: {
      fontSize: 10,
      color: '#555555',
      marginLeft: 10,
    },
    summary: {
      fontSize: 11,
      lineHeight: 1.6,
      color: '#444444',
      textAlign: 'justify',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 8,
      color: '#999999',
    }
  });
};

// PDF Document Component
export const PDFResume = ({ data, persona = 'professional', includeFooter = true }) => {
  const styles = createStyles(persona);
  const education = formatEducation(data);
  
  // Combine technical and soft skills
  const allSkills = [];
  if (data.technical_skills) {
    const techSkills = formatSkills(data.technical_skills || '');
    allSkills.push(...techSkills);
  }
  if (data.soft_skills) {
    const softSkills = formatSkills(data.soft_skills || '');
    allSkills.push(...softSkills);
  }
  // Fallback to data.skills if the above fields don't exist
  if (allSkills.length === 0 && data.skills) {
    allSkills.push(...formatSkills(data.skills || ''));
  }
  
  const skills = allSkills;
  const summary = generateSummary({ ...data, skills: allSkills }, persona);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || 'Your Name'}</Text>
          <Text style={styles.contactInfo}>
            {data.email || 'email@example.com'} | {data.phone || '1234567890'}
          </Text>
        </View>

        {/* Objective */}
        {(
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objective</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.educationLevel}>{edu.level}</Text>
              <Text style={styles.educationDetails}>{edu.details}</Text>
            </View>
          ))}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          
          {/* Technical Skills */}
          {data.technical_skills && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 4 }]}>Technical Skills:</Text>
              <View style={styles.skillsContainer}>
                {formatSkills(data.technical_skills || '').map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Soft Skills */}
          {data.soft_skills && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 4 }]}>Soft Skills:</Text>
              <View style={styles.skillsContainer}>
                {formatSkills(data.soft_skills || '').map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Fallback for combined skills */}
          {!data.technical_skills && !data.soft_skills && skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Internships Section */}
        {data.internship_details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Internship Experience</Text>
            <View>
              {data.internship_details
                .split('---')
                .map((internship, index) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {internship.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* Professional Experience Section */}
        {data.experience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            <View>
              {data.experience
                .split('---')
                .map((exp, index) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {exp.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* Projects Section */}
        {data.projects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <View>
              {data.projects
                .split('---')
                .map((project, index) => (
                  <Text key={index} style={styles.bulletPoint}>
                    • {project.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* Fallback if no experience/projects/internships */}
        {!data.experience && !data.projects && !data.internship_details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience & Projects</Text>
            <Text style={styles.text}>No experience, internships, or projects provided</Text>
          </View>
        )}

        {/* Footer */}
        {includeFooter && (
          <View style={styles.footer}>
            <Text>Generated by Smart Conversational Resume Builder</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PDFResume;
