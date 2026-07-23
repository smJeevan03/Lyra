const fs = require("fs/promises");
const { PDFParse } = require("pdf-parse");

async function extractTextFromPDF(filePath) {
  let parser;

  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Create parser instance
    parser = new PDFParse({
      data: new Uint8Array(dataBuffer),
    });

    // Extract text
    const result = await parser.getText();

    return {
      text: result.text,
      numPages: result.total ?? result.numPages,
      info: result.info,
    };
  } catch (err) {
    console.error("PDF parsing error:", err);
    throw new Error("Failed to extract text from PDF");
  } finally {
    // Clean up parser resources
    if (parser) {
      await parser.destroy();
    }
  }
}

module.exports = {
  extractTextFromPDF,
};