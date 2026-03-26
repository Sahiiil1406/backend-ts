import { readFile } from "fs/promises";
import path from "path";
import * as pdfParser from "pdf-parse";
import mammoth from "mammoth";
import { Parse as unzipParse } from "unzipper";
import { recognize } from "tesseract.js";
import { ApiError } from "./ApiError";
import { Readable } from "stream";

export type SupportedFileType = "pdf" | "docx" | "pptx" | "txt" | "md" | "csv";

export interface ParsedFileContent {
  text: string;
  fileType: SupportedFileType;
  fileName: string;
  size: number;
}

export interface OCRContent {
  text: string;
  confidence: number;
  language: string;
  source: string;
}

const supportedOcrExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
]);

/**
 * Detect file type from extension
 */
const detectFileType = (filePath: string): SupportedFileType => {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");

  const typeMap: Record<string, SupportedFileType> = {
    pdf: "pdf",
    docx: "docx",
    doc: "docx",
    pptx: "pptx",
    ppt: "pptx",
    txt: "txt",
    md: "md",
    markdown: "md",
    csv: "csv",
  };

  const fileType = typeMap[ext];
  if (!fileType) {
    throw new ApiError(
      400,
      `Unsupported file type: .${ext}. Supported types: PDF, DOCX, PPTX, TXT, MD, CSV`,
    );
  }

  return fileType;
};

/**
 * Parse PDF file and extract text
 */
const parsePDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await (pdfParser as any)(buffer);
    return data.text || "";
  } catch (error: any) {
    throw new ApiError(500, `Failed to parse PDF: ${error?.message}`);
  }
};

/**
 * Parse DOCX file and extract text
 */
const parseDOCX = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error: any) {
    throw new ApiError(500, `Failed to parse DOCX: ${error?.message}`);
  }
};

/**
 * Parse PPTX file and extract text from all slides
 */
const parsePPTX = async (buffer: Buffer): Promise<string> => {
  try {
    const textContent: string[] = [];

    // PPTX is a ZIP file containing XML files
    const readable = Readable.from([buffer]);
    const directory = await (unzipParse() as any)(readable);

    // Process each slide
    for (const file of Object.values(directory.files || {})) {
      const fileObj = file as any;
      // Only process slide XML files
      if (
        fileObj.path?.includes("ppt/slides/slide") &&
        fileObj.path?.endsWith(".xml")
      ) {
        const content = (await fileObj.buffer()) as Buffer;
        const xmlText = content.toString("utf-8");

        // Extract text from XML tags (simple regex approach)
        const textMatches = xmlText.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        textMatches.forEach((match: string) => {
          const text = match.replace(/<a:t>|<\/a:t>/g, "").trim();
          if (text) {
            textContent.push(text);
          }
        });
      }
    }

    return textContent.join("\n");
  } catch (error: any) {
    throw new ApiError(500, `Failed to parse PPTX: ${error?.message}`);
  }
};

/**
 * Parse plain text files (TXT, MD, CSV)
 */
const parseTextFile = async (buffer: Buffer): Promise<string> => {
  try {
    return buffer.toString("utf-8");
  } catch (error: any) {
    throw new ApiError(500, `Failed to parse text file: ${error?.message}`);
  }
};

/**
 * Main file parser function
 *
 * @param filePath - Path to the file to parse
 * @param buffer - Optional buffer if file is already loaded. If provided, filePath should still be passed for type detection.
 * @returns ParsedFileContent with extracted text
 *
 * @example
 * const parsed = await parseFile("./document.pdf");
 * console.log(parsed.text);
 */
export const parseFile = async (
  filePath: string,
  buffer?: Buffer,
): Promise<ParsedFileContent> => {
  try {
    // Read file if buffer not provided
    const fileBuffer = buffer || (await readFile(filePath));

    // Detect file type
    const fileType = detectFileType(filePath);

    // Parse based on file type
    let text: string;
    switch (fileType) {
      case "pdf":
        text = await parsePDF(fileBuffer);
        break;
      case "docx":
        text = await parseDOCX(fileBuffer);
        break;
      case "pptx":
        text = await parsePPTX(fileBuffer);
        break;
      case "txt":
      case "md":
      case "csv":
        text = await parseTextFile(fileBuffer);
        break;
      default:
        throw new ApiError(400, `Unsupported file type: ${fileType}`);
    }

    if (!text || text.trim().length === 0) {
      throw new ApiError(400, "No text content extracted from file");
    }

    return {
      text: text.trim(),
      fileType,
      fileName: path.basename(filePath),
      size: fileBuffer.length,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `File parsing error: ${(error as Error)?.message}`);
  }
};

/**
 * Parse multiple files and combine their text
 */
export const parseMultipleFiles = async (
  filePaths: string[],
): Promise<Record<string, ParsedFileContent>> => {
  const results: Record<string, ParsedFileContent> = {};

  for (const filePath of filePaths) {
    try {
      results[filePath] = await parseFile(filePath);
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to parse file ${filePath}: ${(error as Error)?.message}`,
      );
    }
  }

  return results;
};

/**
 * Extract text from an image using OCR.
 * Supports in-memory buffers and local file paths.
 */
export const extractTextWithOCR = async (params: {
  filePath?: string;
  buffer?: Buffer;
  language?: string;
}): Promise<OCRContent> => {
  const { filePath, buffer, language = "eng" } = params;

  if (!buffer && !filePath) {
    throw new ApiError(400, "Provide either filePath or buffer for OCR");
  }

  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedOcrExtensions.has(ext)) {
      throw new ApiError(
        400,
        `OCR supports image files only (${Array.from(supportedOcrExtensions).join(", ")})`,
      );
    }
  }

  try {
    const imageBuffer = buffer ?? (await readFile(filePath!));
    const result = await recognize(imageBuffer, language);
    const extractedText = result.data.text?.trim() || "";

    if (!extractedText) {
      throw new ApiError(400, "No text detected in image by OCR");
    }

    return {
      text: extractedText,
      confidence: result.data.confidence ?? 0,
      language,
      source: filePath ? path.basename(filePath) : "buffer",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      `OCR processing failed: ${(error as Error)?.message || "Unknown error"}`,
    );
  }
};
