#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires, import/no-commonjs */
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  baseLocale: "en",
  targetLocales: ["es", "zh"],
  messagesDir: path.join(__dirname, "..", "messages"),
  openRouterModel: "google/gemini-2.5-flash-preview-05-20",

  batchSize: 100, // Number of keys to translate in one API call
};

// Language context for better translations
const LANGUAGE_CONTEXT = {
  es: {
    name: "Spanish",
    instructions:
      'Translate to natural, modern Spanish. Use formal "usted" form for UI text. Keep technical terms in English where appropriate (e.g., "email", "login"). Maintain placeholder variables like {name}, {amount}, etc. exactly as they appear.',
  },
  zh: {
    name: "Chinese (Simplified)",
    instructions:
      "Translate to simplified Chinese. Use concise, modern Chinese suitable for software interfaces. Keep placeholder variables like {name}, {amount}, etc. exactly as they appear. Use appropriate measure words and formal language for business contexts.",
  },
};

class I18nAutoSync {
  constructor(options = {}) {
    this.checkOnly = options.checkOnly || false;
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.OPENROUTER_MODEL || CONFIG.openRouterModel;

    if (!this.apiKey && !this.checkOnly) {
      console.error(
        "❌ Error: OPENROUTER_API_KEY environment variable is required",
      );
      process.exit(1);
    }
  }

  async loadTranslationFile(locale) {
    const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Error loading ${locale}.json:`, error.message);
      return {};
    }
  }

  async saveTranslationFile(locale, data) {
    const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
      console.log(`✅ Saved ${locale}.json`);
    } catch (error) {
      console.error(`❌ Error saving ${locale}.json:`, error.message);
      throw error;
    }
  }

  flattenObject(obj, prefix = "") {
    const flattened = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    return flattened;
  }

  unflattenObject(flattened, originalStructure = null) {
    if (!originalStructure) {
      // Fallback to basic unflatten if no original structure
      const unflattened = {};
      const sortedKeys = Object.keys(flattened).sort();

      for (const key of sortedKeys) {
        const keys = key.split(".");
        let current = unflattened;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = flattened[key];
      }
      return unflattened;
    }

    // Use the original structure as template and overlay the flattened data
    return this.rebuildWithOriginalOrder(originalStructure, flattened);
  }

  rebuildWithOriginalOrder(original, flattened, prefix = "") {
    if (
      typeof original !== "object" ||
      original === null ||
      Array.isArray(original)
    ) {
      // If it's a leaf value, return the flattened value if it exists
      return flattened[prefix] !== undefined ? flattened[prefix] : original;
    }

    const result = {};

    // Process all keys from original in their original order
    for (const [key, value] of Object.entries(original)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Recursively rebuild nested objects
        result[key] = this.rebuildWithOriginalOrder(value, flattened, fullKey);
      } else {
        // Use flattened value if available, otherwise keep original
        result[key] =
          flattened[fullKey] !== undefined ? flattened[fullKey] : value;
      }
    }

    // Add any new keys that weren't in the original structure
    for (const flatKey of Object.keys(flattened)) {
      if (flatKey.startsWith(prefix)) {
        const relativePath = prefix
          ? flatKey.slice(prefix.length + 1)
          : flatKey;
        const firstKey = relativePath.split(".")[0];

        // If this is a top-level key that doesn't exist in original, add it
        if (!relativePath.includes(".") && !result.hasOwnProperty(firstKey)) {
          result[firstKey] = flattened[flatKey];
        }
      }
    }

    return result;
  }

  analyzeDeltas(baseFlat, targetFlat) {
    const missing = {};
    const extra = {};

    // Find missing keys (in base but not in target)
    for (const key in baseFlat) {
      if (!targetFlat.hasOwnProperty(key)) {
        missing[key] = baseFlat[key];
      }
    }

    // Find extra keys (in target but not in base)
    for (const key in targetFlat) {
      if (!baseFlat.hasOwnProperty(key)) {
        extra[key] = targetFlat[key];
      }
    }

    return { missing, extra };
  }

  async translateWithOpenRouter(texts, targetLocale, context = "") {
    const languageContext = LANGUAGE_CONTEXT[targetLocale];
    if (!languageContext) {
      throw new Error(`Unsupported target locale: ${targetLocale}`);
    }

    const prompt = `You are a professional translator specializing in software localization. 

TASK: Translate the following English UI text to ${languageContext.name}.

INSTRUCTIONS:
${languageContext.instructions}

CONTEXT: ${context}

INPUT (JSON object with key-value pairs to translate):
${JSON.stringify(texts, null, 2)}

REQUIREMENTS:
1. Return ONLY a valid JSON object with the same keys but translated values
2. Preserve all placeholder variables (e.g., {name}, {amount}, {currency}) exactly as they appear
3. Maintain the same structure and formatting
4. Keep HTML entities like &apos; intact
5. Preserve capitalization patterns (Title Case, sentence case, etc.) from the English text
6. For error messages, maintain the professional but user-friendly tone
7. For UI labels, use concise and clear language appropriate for software interfaces

RESPOND WITH ONLY THE JSON OBJECT:`;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/your-repo", // Optional
            "X-Title": "I18n Auto Sync", // Optional
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData}`,
        );
      }

      const data = await response.json();
      const translatedText = data.choices[0].message.content.trim();

      // Try to parse the JSON response
      try {
        // Remove markdown code blocks if present
        let jsonText = translatedText.trim();
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const translated = JSON.parse(jsonText);
        return translated;
      } catch (_parseError) {
        console.error(
          "❌ Failed to parse translation response:",
          translatedText,
        );
        throw new Error("Invalid JSON response from translation API");
      }
    } catch (error) {
      console.error("❌ Translation API error:", error.message);
      throw error;
    }
  }

  async translateMissingKeys(missingKeys, targetLocale) {
    if (Object.keys(missingKeys).length === 0) {
      return {};
    }

    const translations = {};
    const keyBatches = this.createBatches(missingKeys, CONFIG.batchSize);

    for (let i = 0; i < keyBatches.length; i++) {
      const batch = keyBatches[i];
      console.log(
        `🔄 Translating batch ${i + 1}/${keyBatches.length} for ${targetLocale} (${Object.keys(batch).length} keys)`,
      );

      // Add context based on key patterns
      let context = "";
      const firstKey = Object.keys(batch)[0];
      if (firstKey.includes("auth")) {
        context = "Authentication and login related text";
      } else if (firstKey.includes("error")) {
        context = "Error messages for user feedback";
      } else if (firstKey.includes("form")) {
        context = "Form labels and validation messages";
      } else if (firstKey.includes("button") || firstKey.includes("action")) {
        context = "Button labels and action text";
      }

      try {
        const batchTranslations = await this.translateWithOpenRouter(
          batch,
          targetLocale,
          context,
        );
        Object.assign(translations, batchTranslations);
      } catch (error) {
        console.error(
          `❌ Translation failed for batch ${i + 1}:`,
          error.message,
        );
        console.error(
          `⚠️  Skipping ${Object.keys(batch).length} keys. Manual translation required.`,
        );
        // Don't add untranslated English keys - this is an antipattern
      }
    }

    return translations;
  }

  createBatches(obj, batchSize) {
    const batches = [];
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = {};
      const batchKeys = keys.slice(i, i + batchSize);
      batchKeys.forEach((key) => {
        batch[key] = obj[key];
      });
      batches.push(batch);
    }

    return batches;
  }

  async syncLocale(locale) {
    console.log(`\n🔄 Syncing ${locale}...`);

    const baseData = await this.loadTranslationFile(CONFIG.baseLocale);
    const targetData = await this.loadTranslationFile(locale);

    const baseFlat = this.flattenObject(baseData);
    const targetFlat = this.flattenObject(targetData);

    const { missing, extra } = this.analyzeDeltas(baseFlat, targetFlat);

    const missingCount = Object.keys(missing).length;
    const extraCount = Object.keys(extra).length;

    console.log(`📊 ${locale} analysis:`);
    console.log(`   Missing keys: ${missingCount}`);
    console.log(`   Extra keys: ${extraCount}`);

    if (missingCount === 0 && extraCount === 0) {
      console.log(`✅ ${locale} is already synchronized`);
      return { updated: false, changes: { added: 0, removed: 0 } };
    }

    // Remove extra keys
    for (const key of Object.keys(extra)) {
      delete targetFlat[key];
      console.log(`🗑️  Removed extra key: ${key}`);
    }

    // Translate and add missing keys
    let addedCount = 0;
    if (missingCount > 0) {
      if (this.checkOnly) {
        console.log(
          `🔍 Would translate ${missingCount} missing keys for ${locale}:`,
        );
        for (const key of Object.keys(missing)) {
          console.log(`   📝 ${key}: "${missing[key]}"`);
        }
        addedCount = missingCount;
      } else {
        console.log(
          `🌐 Translating ${missingCount} missing keys for ${locale}...`,
        );
        const translations = await this.translateMissingKeys(missing, locale);

        for (const [key, translation] of Object.entries(translations)) {
          targetFlat[key] = translation;
          addedCount++;
          console.log(`✅ Added: ${key}`);
        }
      }
    }

    // Save updated file
    if (!this.checkOnly) {
      const updatedData = this.unflattenObject(targetFlat, targetData);
      await this.saveTranslationFile(locale, updatedData);
    }

    return {
      updated: true,
      changes: {
        added: addedCount,
        removed: extraCount,
      },
    };
  }

  async run() {
    if (this.checkOnly) {
      console.log("🔍 I18n Auto Sync - Check Only Mode");
      console.log("This is a dry run. No files will be modified.");
    } else {
      console.log("🚀 Starting I18n Auto Sync...");
    }
    console.log(`📍 Base locale: ${CONFIG.baseLocale}`);
    console.log(`🎯 Target locales: ${CONFIG.targetLocales.join(", ")}`);
    if (!this.checkOnly) {
      console.log(`🤖 Using model: ${this.model}`);
    }

    const results = {};

    for (const locale of CONFIG.targetLocales) {
      try {
        results[locale] = await this.syncLocale(locale);
      } catch (error) {
        console.error(`❌ Failed to sync ${locale}:`, error.message);
        results[locale] = { updated: false, error: error.message };
      }
    }

    // Summary
    console.log("\n📋 Summary:");
    let totalUpdated = 0;
    let totalAdded = 0;
    let totalRemoved = 0;

    for (const [locale, result] of Object.entries(results)) {
      if (result.error) {
        console.log(`❌ ${locale}: Error - ${result.error}`);
      } else if (result.updated) {
        console.log(
          `✅ ${locale}: Updated (+${result.changes.added} keys, -${result.changes.removed} keys)`,
        );
        totalUpdated++;
        totalAdded += result.changes.added;
        totalRemoved += result.changes.removed;
      } else {
        console.log(`✅ ${locale}: Already synchronized`);
      }
    }

    if (totalUpdated > 0) {
      console.log(
        `\n🎉 Sync complete! Updated ${totalUpdated} locale(s) with ${totalAdded} additions and ${totalRemoved} removals.`,
      );
    } else {
      console.log("\n✨ All locales are already synchronized!");
    }

    return results;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check-only") || args.includes("--dry-run");

  const sync = new I18nAutoSync({ checkOnly });
  sync.run().catch((error) => {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  });
}

module.exports = I18nAutoSync;
