#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Configuration
const CONFIG = {
  srcDir: "./src",
  messagesDir: "./messages",
  supportedLocales: ["en", "es", "zh"],
};

// Check for JSON output flag
const isJsonOutput = process.argv.includes("--json");

// Files/patterns that typically don't need i18n
const EXCLUDE_FROM_COVERAGE = {
  // UI primitive components that are just wrappers
  paths: [
    "src/components/ui/",
    "src/lib/",
    "src/server/",
    "src/trpc/",
    "src/types/",
    "src/config/",
    "src/hooks/api/",
    "src/providers/",
    "src/stores/",
  ],

  // File patterns that are typically infrastructure
  patterns: [
    /\.config\./,
    /\.types\./,
    /\.constants\./,
    /\.utils\./,
    /\.schema\./,
    /\.validator\./,
    /columns\.tsx?$/, // Data table column definitions
    /middleware\.tsx?$/,
    /layout\.tsx?$/, // Layout files often just structure
    /-columns\.tsx?$/,
    /-schema\.tsx?$/,
    /-types\.tsx?$/,
    // invoice-pdf.tsx
    /invoice-pdf\.tsx$/,
  ],

  // Files that are clearly infrastructure based on content
  contentPatterns: [
    // Files that are mostly type definitions
    /^import.*type.*from/m,
    // Files that are mostly exports
    /^export \{[^}]*\}$/m,
    // Files with mostly interfaces/types
    /interface\s+\w+|type\s+\w+\s*=/,
    // Files with Next.js metadata exports
    /export\s+const\s+metadata:\s*Metadata\s*=/,
  ],

  // Metadata-related patterns to exclude from hardcoded string detection
  metadataPatterns: [
    // Next.js metadata object properties
    /metadata:\s*Metadata\s*=\s*\{[^}]*\}/g,
    // Title and description in metadata
    /(?:title|description):\s*['"`]([^'"`]+)['"`]/g,
    // Template metadata
    /template:\s*['"`]([^'"`]+)['"`]/g,
    // Component metadata property (for comboboxes, etc.)
    /metadata:\s*['"`]([^'"`]+)['"`]/g,
    /metadata\?\s*:\s*['"`]([^'"`]+)['"`]/g,
  ],
};

// Patterns to identify i18n usage
const I18N_PATTERNS = {
  useTranslations: /useTranslations\(['"`]([^'"`]+)['"`]\)/g,
  tFunction: /\bt\(['"`]([^'"`]+)['"`]\)/g,
  hardcodedStrings: {
    toastMessages: /toast\.[a-z]+\(['"`]([^'"`]+)['"`]\)/g,
    buttonText: /<[Bb]utton[^>]*>([A-Za-z][^<]{2,})</g,
    titles: /title\s*[:=]\s*['"`]([A-Za-z][^'"`]{2,})['"`]/g,
    placeholders: /placeholder\s*[:=]\s*['"`]([A-Za-z][^'"`]{2,})['"`]/g,
    errorMessages:
      /(?:throw new Error|error:\s*|Error\()\s*['"`]([A-Za-z][^'"`]{5,})['"`]/g,
    headings: /<h[1-6][^>]*>([A-Za-z][^<]{3,})</g,
    labels: /(?:aria-label|label)\s*[:=]\s*['"`]([A-Za-z][^'"`]{3,})['"`]/g,
    jsxText: />([A-Z][A-Za-z\s]{4,})</g,
  },
};

// Page mapping based on file paths
const PAGE_MAPPING = {
  auth: "Authentication",
  dashboard: "Dashboard",
  contacts: "Contacts",
  invoicing: "Invoicing",
  send: "Send Money",
  account: "Account",
  settings: "Settings",
  onboarding: "Onboarding",
  transfer: "Transfers",
  help: "Help",
  components: "Components",
};

class I18nCoverageAnalyzer {
  constructor() {
    this.results = {
      totalFiles: 0,
      filesWithI18n: 0,
      excludedFiles: 0,
      pages: {},
      files: [],
      excludedFiles: [],
    };
  }

  analyze() {
    if (!isJsonOutput) {
      console.log("🌐 i18n Coverage Analysis\n");
    }

    const allFiles = this.getAllSourceFiles(CONFIG.srcDir);

    for (const filePath of allFiles) {
      const analysis = this.analyzeFile(filePath);

      if (analysis.excluded) {
        this.results.excludedFiles.push(analysis);
        continue;
      }

      this.results.files.push(analysis);

      const page = this.getPageFromPath(filePath);
      if (!this.results.pages[page]) {
        this.results.pages[page] = {
          name: PAGE_MAPPING[page] || page,
          total: 0,
          withI18n: 0,
          files: [],
        };
      }

      this.results.pages[page].total++;
      this.results.pages[page].files.push(analysis);

      if (analysis.hasI18n) {
        this.results.pages[page].withI18n++;
      }
    }

    this.results.totalFiles = this.results.files.length;
    this.results.filesWithI18n = this.results.files.filter(
      (f) => f.hasI18n,
    ).length;
    this.results.excludedFilesCount = this.results.excludedFiles.length;

    this.printReport();
  }

  shouldExcludeFile(filePath, content) {
    const relativePath = filePath.replace(/\\/g, "/");

    // Check path-based exclusions
    if (
      EXCLUDE_FROM_COVERAGE.paths.some((path) => relativePath.includes(path))
    ) {
      return { excluded: true, reason: "UI/Infrastructure component" };
    }

    // Check pattern-based exclusions
    if (
      EXCLUDE_FROM_COVERAGE.patterns.some((pattern) =>
        pattern.test(relativePath),
      )
    ) {
      return { excluded: true, reason: "Infrastructure file pattern" };
    }

    // Check for metadata exports
    if (
      EXCLUDE_FROM_COVERAGE.contentPatterns.some((pattern) =>
        pattern.test(content),
      )
    ) {
      return {
        excluded: true,
        reason: "Contains metadata exports or type definitions",
      };
    }

    // Check content-based exclusions
    const lines = content.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

    // Skip very small files
    if (nonEmptyLines.length < 10) {
      return { excluded: true, reason: "Too small to need i18n" };
    }

    // Check if file is mostly types/interfaces
    const typeLines = lines.filter((line) =>
      /^\s*(interface|type|export\s+type|export\s+interface)/.test(line),
    );
    if (typeLines.length > nonEmptyLines.length * 0.5) {
      return { excluded: true, reason: "Mostly type definitions" };
    }

    // Check if file has no user-facing content
    const hasUserFacingContent = this.hasUserFacingContent(content);
    if (!hasUserFacingContent) {
      return { excluded: true, reason: "No user-facing content detected" };
    }

    return { excluded: false };
  }

  hasUserFacingContent(content) {
    // Look for patterns that suggest user-facing content
    const userFacingPatterns = [
      /return\s*\(/, // JSX return statements
      /<[A-Z]/, // React components
      /className/, // Styled components
      /toast\./, // Toast messages
      /placeholder/, // Form inputs
      /title\s*[:=]/, // Titles
      /label\s*[:=]/, // Labels
      /button/i, // Buttons
      /heading/i, // Headings
      /text/i, // Text content
    ];

    return userFacingPatterns.some((pattern) => pattern.test(content));
  }

  isMetadataString(text, fullContent) {
    // Check if the text appears within a metadata context
    const metadataContexts = [
      // Next.js metadata object
      /export\s+const\s+metadata:\s*Metadata\s*=\s*\{[^}]*\}/s,
      // Within metadata property assignment
      /metadata\s*[:=]\s*['"`][^'"`]*['"`]/g,
      // Title/description in metadata
      /(?:title|description|template):\s*['"`][^'"`]*['"`]/g,
    ];

    return metadataContexts.some((pattern) => {
      const matches = fullContent.match(pattern);
      return matches && matches.some((match) => match.includes(text));
    });
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(process.cwd(), filePath);

    // Check if file should be excluded
    const exclusionCheck = this.shouldExcludeFile(relativePath, content);

    const analysis = {
      path: relativePath,
      hasI18n: false,
      translationKeys: [],
      hardcodedStrings: [],
      page: this.getPageFromPath(relativePath),
      excluded: exclusionCheck.excluded,
      exclusionReason: exclusionCheck.reason,
    };

    if (exclusionCheck.excluded) {
      return analysis;
    }

    // Find translation usage
    const translationMatches = [
      ...content.matchAll(I18N_PATTERNS.useTranslations),
      ...content.matchAll(I18N_PATTERNS.tFunction),
    ];

    if (translationMatches.length > 0) {
      analysis.hasI18n = true;
      analysis.translationKeys = [
        ...new Set(translationMatches.map((match) => match[1])),
      ];
    }

    // Find hardcoded strings, excluding metadata
    Object.entries(I18N_PATTERNS.hardcodedStrings).forEach(
      ([type, pattern]) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match) => {
          const text = match[1]?.trim();
          if (
            text &&
            text.length > 2 &&
            !this.isLikelyNotUserFacing(text) &&
            !this.isMetadataString(text, content)
          ) {
            analysis.hardcodedStrings.push({ type, text });
          }
        });
      },
    );

    return analysis;
  }

  getAllSourceFiles(dir) {
    const files = [];
    const extensions = [".tsx", ".ts"];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.startsWith(".") && item !== "node_modules") {
            traverse(fullPath);
          }
        } else if (extensions.some((ext) => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  getPageFromPath(filePath) {
    const normalized = filePath.replace(/\\/g, "/");

    if (normalized.includes("/auth/")) return "auth";
    if (normalized.includes("/dashboard/")) return "dashboard";
    if (normalized.includes("/contacts/")) return "contacts";
    if (normalized.includes("/invoicing/")) return "invoicing";
    if (normalized.includes("/send/")) return "send";
    if (normalized.includes("/settings/")) return "settings";
    if (normalized.includes("/account/")) return "account";
    if (normalized.includes("/onboarding/")) return "onboarding";
    if (normalized.includes("/transfer/")) return "transfer";
    if (normalized.includes("/help/")) return "help";
    if (normalized.includes("/components/")) return "components";

    return "other";
  }

  isLikelyNotUserFacing(text) {
    const technicalPatterns = [
      /^[a-z]+$/i, // Single words
      /^\d+$/, // Numbers only
      /^[A-Z_]+$/, // Constants
      /^[a-z]+[A-Z]/, // camelCase
      /^(div|span|button|input|form|className|onClick|true|false)$/i, // HTML/React terms
      /^https?:\/\//, // URLs
      /^\{.*\}$/, // Object literals
      /^[a-z-]+\s+[a-z-]+/, // CSS classes (space-separated)
      /^[a-z-]+:[a-z-]/, // CSS with pseudo-classes or Tailwind responsive
      /^[a-z]+-[0-9]/, // CSS with numbers (padding, margin, etc.)
      /^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|rounded|border|shadow|opacity|cursor|pointer|select|transform|transition|animate|text|bg|space|gap|size)/, // Common CSS prefixes
    ];

    return technicalPatterns.some((pattern) => pattern.test(text));
  }

  printReport() {
    const coverage = Math.round(
      (this.results.filesWithI18n / this.results.totalFiles) * 100,
    );

    if (isJsonOutput) {
      // Output JSON for CI consumption
      const jsonOutput = {
        coverage: coverage,
        totalFiles: this.results.totalFiles,
        filesWithI18n: this.results.filesWithI18n,
        filesWithoutI18n: this.results.totalFiles - this.results.filesWithI18n,
        excludedFiles: this.results.excludedFilesCount,
        pages: Object.entries(this.results.pages).map(([key, page]) => ({
          name: page.name,
          key,
          coverage: Math.round((page.withI18n / page.total) * 100),
          totalFiles: page.total,
          filesWithI18n: page.withI18n,
        })),
        topIssues: this.results.files
          .filter((f) => !f.hasI18n && f.hardcodedStrings.length > 0)
          .sort((a, b) => b.hardcodedStrings.length - a.hardcodedStrings.length)
          .slice(0, 5)
          .map((f) => ({
            path: f.path,
            page: f.page,
            hardcodedStrings: f.hardcodedStrings.length,
          })),
      };

      console.log(JSON.stringify(jsonOutput, null, 2));
      return;
    }

    console.log(
      `📊 Overall Coverage: ${coverage}% (${this.results.filesWithI18n}/${this.results.totalFiles} files)`,
    );
    console.log(
      `🚫 Excluded: ${this.results.excludedFilesCount} files (UI components, utils, types, metadata, etc.)\n`,
    );

    // Page breakdown
    console.log("📄 Coverage by Page:");
    console.log("─".repeat(60));

    Object.entries(this.results.pages)
      .sort(([, a], [, b]) => b.withI18n / b.total - a.withI18n / a.total)
      .forEach(([, page]) => {
        const pageCoverage = Math.round((page.withI18n / page.total) * 100);
        const bar = this.createProgressBar(pageCoverage);
        console.log(
          `${page.name.padEnd(20)} ${bar} ${pageCoverage}% (${page.withI18n}/${page.total})`,
        );
      });

    console.log("\n🔍 Files needing i18n:");
    console.log("─".repeat(60));

    const filesNeedingI18n = this.results.files
      .filter((f) => !f.hasI18n && f.hardcodedStrings.length > 0)
      .sort((a, b) => b.hardcodedStrings.length - a.hardcodedStrings.length)
      .slice(0, 10);

    if (filesNeedingI18n.length === 0) {
      console.log("✅ No files with obvious hardcoded strings found!");
    } else {
      filesNeedingI18n.forEach((file) => {
        console.log(`📁 ${file.path}`);
        console.log(`   Page: ${PAGE_MAPPING[file.page] || file.page}`);
        console.log(`   Hardcoded strings: ${file.hardcodedStrings.length}`);
        if (file.hardcodedStrings.length > 0) {
          file.hardcodedStrings.slice(0, 3).forEach((str) => {
            console.log(`   • "${str.text}" (${str.type})`);
          });
          if (file.hardcodedStrings.length > 3) {
            console.log(`   ... and ${file.hardcodedStrings.length - 3} more`);
          }
        }
        console.log("");
      });
    }

    console.log("🎯 Files with good i18n coverage:");
    console.log("─".repeat(60));

    const goodFiles = this.results.files
      .filter((f) => f.hasI18n && f.translationKeys.length > 0)
      .sort((a, b) => b.translationKeys.length - a.translationKeys.length)
      .slice(0, 5);

    goodFiles.forEach((file) => {
      console.log(`✅ ${file.path}`);
      console.log(`   Translation keys: ${file.translationKeys.length}`);
      console.log("");
    });

    if (!isJsonOutput && this.results.excludedFilesCount > 0) {
      console.log("ℹ️  Excluded files (sample):");
      console.log("─".repeat(60));
      this.results.excludedFiles.slice(0, 5).forEach((file) => {
        console.log(`🚫 ${file.path}`);
        console.log(`   Reason: ${file.exclusionReason}`);
      });
      if (this.results.excludedFilesCount > 5) {
        console.log(
          `   ... and ${this.results.excludedFilesCount - 5} more excluded files`,
        );
      }
    }
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${"█".repeat(filled)}${" ".repeat(empty)}]`;
  }
}

// Run the analyzer
try {
  const analyzer = new I18nCoverageAnalyzer();
  analyzer.analyze();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

export default I18nCoverageAnalyzer;
