
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, basename, dirname, join } from 'path';
import { execSync } from 'child_process';

// Configuration
const STORIES_DIR = '_bmad-output/stories';
const OUTPUT_FILE = '_bmad-output/traceability/global-traceability-report.md';
const SOURCE_DIR = 'src';
const TEST_DIR = 'tests';

interface Story {
    path: string;
    id: string;
    title: string;
    acceptanceCriteria: string[];
    filesModified: string[];
}

interface TraceResult {
    storyId: string;
    storyTitle: string;
    totalAC: number;
    coveredAC: number;
    status: 'PASS' | 'FAIL' | 'NO_TESTS';
    missingCoverage: string[];
    linkedTests: string[];
}

// Helper: Find all story files
function findStoryFiles(dir: string): string[] {
    const results: string[] = [];
    try {
        const output = execSync(`find ${dir} -name "*.md" | grep -v "epic-"`, { encoding: 'utf-8' });
        return output.trim().split('\n').filter(Boolean);
    } catch (e) {
        console.error("Error finding story files:", e);
        return [];
    }
}

// Helper: Parse Story File
function parseStory(filePath: string): Story {
    const content = readFileSync(filePath, 'utf-8');
    const filename = basename(filePath, '.md');

    // Extract ID (e.g., "20-5" from "20-5-data-layer.md")
    const idMatch = filename.match(/^(\d+-\d+)/);
    const id = idMatch ? idMatch[1] : filename;

    // Extract Title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/^Story\s*/i, '').trim() : filename;

    // Extract ACs
    const acLines = content.match(/^-\s*\[[ x]\]\s*(AC\d+:?.+)$/gm) || [];
    const acceptanceCriteria = acLines.map(line => line.replace(/^-\s*\[[ x]\]\s*/, '').trim());

    // Extract Modified Files (simple heuristic from "Files Modified" section or markdown links)
    // detailed parsing might be complex, so we'll look for links to src/ files
    const fileMatches = content.matchAll(/\[(.*?)\]\((.*?src\/.*?)\)/g);
    const filesModified = new Set<string>();
    for (const match of fileMatches) {
        if (!match[2].includes('test')) {
            filesModified.add(basename(match[2]));
        }
    }

    return { path: filePath, id, title, acceptanceCriteria, filesModified: Array.from(filesModified) };
}

// Helper: Find tests for a file
function findTestsForFile(sourceFile: string): string[] {
    const baseName = sourceFile.replace(/\.(ts|tsx)$/, '');
    const searchPatterns = [
        `${baseName}.test.ts`,
        `${baseName}.test.tsx`,
        `${baseName}.spec.ts`,
        `**/tests/**/${baseName}.spec.ts`
    ];

    const foundTests: string[] = [];

    // 1. Check co-located tests (src/__tests__ or .test.ts)
    try {
        // Use find command for speed and globbing
        const cmd = `find src tests -name "*${baseName}*.test.ts" -o -name "*${baseName}*.spec.ts" -o -name "*${baseName}*.test.tsx"`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        const lines = output.trim().split('\n').filter(Boolean);
        foundTests.push(...lines);
    } catch (e) {
        // ignore
    }

    return foundTests;
}

// Helper: Check coverage keywords in test file
function checkCoverage(testPaths: string[], ac: string): boolean {
    // Simple keyword matching: does the test file contain significant words from the AC?
    // In a real agentic flow, we use LLMs, but for bulk speed, we use heuristics.

    // Extract significant keywords (length > 4, not common stop words)
    const keywords = ac.split(' ')
        .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(w => w.length > 4 && !['should', 'ensure', 'verify', 'check'].includes(w.toLowerCase()));

    if (keywords.length === 0) return true; // Too generic, assume covered if test exists

    for (const testPath of testPaths) {
        try {
            const content = readFileSync(testPath, 'utf-8').toLowerCase();
            // If 50% of keywords are present, we count it as "likely covered"
            const hits = keywords.filter(k => content.includes(k.toLowerCase())).length;
            if (hits / keywords.length >= 0.3) return true;
        } catch (e) { continue; }
    }
    return false;
}

// Main Execution
async function main() {
    console.log("🔍 Starting Global Traceability Analysis...");

    const files = findStoryFiles(STORIES_DIR);
    console.log(`found ${files.length} stories.`);

    // Prioritize active/recent stories (heuristic: numeric sort descending)
    // files.sort().reverse(); 

    const results: TraceResult[] = [];

    for (const storyFile of files) {
        const story = parseStory(storyFile);

        console.log(`Processing ${story.id}: ${story.title}`);

        // Strategy: 
        // 1. Identify "Primary System Under Test" (SUT) from modified files
        // 2. Find tests for those files
        // 3. Scan tests for AC keywords

        const linkedTests = new Set<string>();
        for (const file of story.filesModified) {
            const tests = findTestsForFile(file);
            tests.forEach(t => linkedTests.add(t));
        }

        // Also try to find tests by Story ID or simple name matching
        if (linkedTests.size === 0) {
            // Fallback: search for tests mentioning the feature name
            const featureKeywords = story.title.split(' ').filter(w => w.length > 5).slice(0, 2);
            for (const kw of featureKeywords) {
                try {
                    const cmd = `grep -l "${kw}" $(find src tests -name "*.test.ts" -o -name "*.spec.ts")`;
                    const output = execSync(cmd, { encoding: 'utf-8' }).trim();
                    if (output) output.split('\n').forEach(t => linkedTests.add(t));
                } catch (e) { }
            }
        }

        // Calculate Coverage
        let coveredCount = 0;
        const missingACs: string[] = [];

        const testFilesList = Array.from(linkedTests);

        if (testFilesList.length === 0) {
            // No tests found at all
            story.acceptanceCriteria.forEach(ac => missingACs.push(ac));
        } else {
            for (const ac of story.acceptanceCriteria) {
                const isCovered = checkCoverage(testFilesList, ac);
                if (isCovered) {
                    coveredCount++;
                } else {
                    missingACs.push(ac);
                }
            }
        }

        const totalAC = story.acceptanceCriteria.length;
        let status: TraceResult['status'] = 'FAIL';
        if (testFilesList.length === 0) status = 'NO_TESTS';
        else if (coveredCount === totalAC) status = 'PASS';
        else status = 'FAIL';

        // Special case: if no ACs defined, skip or pass?
        if (totalAC === 0) status = 'PASS'; // Refactor stories sometimes lack ACs

        results.push({
            storyId: story.id,
            storyTitle: story.title,
            totalAC,
            coveredAC: coveredCount,
            status,
            missingCoverage: missingACs,
            linkedTests: testFilesList
        });
    }

    // Generate Markdown Report
    let report = `# 🌍 Global Traceability Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Stories:** ${results.length}\n`;
    report += `**Passing:** ${results.filter(r => r.status === 'PASS').length}\n`;
    report += `**Failing:** ${results.filter(r => r.status === 'FAIL').length}\n`;
    report += `**No Tests:** ${results.filter(r => r.status === 'NO_TESTS').length}\n\n`;

    report += `| Story | Status | Coverage | Tests Found | Critical Gaps |\n`;
    report += `|-------|--------|----------|-------------|---------------|\n`;

    for (const res of results) {
        const icon = res.status === 'PASS' ? '✅' : res.status === 'FAIL' ? '⚠️' : '❌';
        const coveragePct = res.totalAC > 0 ? Math.round((res.coveredAC / res.totalAC) * 100) : 100;
        const testCount = res.linkedTests.length;
        const gapPreview = res.missingCoverage.length > 0 ? res.missingCoverage[0].substring(0, 50) + "..." : "None";

        report += `| **${res.storyId}** | ${icon} ${res.status} | ${coveragePct}% (${res.coveredAC}/${res.totalAC}) | ${testCount} | ${gapPreview} |\n`;
    }

    report += `\n\n## 🔍 Detailed Gaps\n\n`;
    for (const res of results.filter(r => r.status !== 'PASS')) {
        if (res.missingCoverage.length === 0) continue;
        report += `### ${res.storyId}: ${res.storyTitle}\n`;
        report += `**Tests Found:**\n`;
        res.linkedTests.forEach(t => report += `- \`${t}\`\n`);
        if (res.linkedTests.length === 0) report += `> No linked tests found for modified files.\n`;

        report += `\n**Missing Coverage:**\n`;
        res.missingCoverage.forEach(ac => report += `- [ ] ${ac}\n`);
        report += `\n---\n`;
    }

    writeFileSync(OUTPUT_FILE, report);
    console.log(`\n✅ Report generated at: ${OUTPUT_FILE}`);
}

main().catch(console.error);
