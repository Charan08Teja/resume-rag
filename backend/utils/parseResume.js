const fs = require('fs');
const pdfParse = require('pdf-parse');
const { Document } = require('docx');

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function parseDOCX(filePath) {
  try {
    const doc = await Document.load(fs.readFileSync(filePath));
    let text = '';
    
    // Extract text from paragraphs
    doc.paragraphs.forEach(paragraph => {
      paragraph.children.forEach(child => {
        if (child.text) {
          text += child.text + ' ';
        }
      });
      text += '\n';
    });
    
    return text.trim();
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return 'Error parsing DOCX file';
  }
}

async function parseResume(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  if (ext === 'pdf') return parsePDF(filePath);
  if (ext === 'docx') return parseDOCX(filePath);
  throw new Error('Unsupported file type');
}

module.exports = parseResume;
