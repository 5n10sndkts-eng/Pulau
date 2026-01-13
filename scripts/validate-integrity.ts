import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'; // Assuming js-yaml is available, or we'll fallback to simple parsing

const SPRINT_STATUS_PATH = '_bmad-output/sprint-status.yaml';
const STORIES_DIR = '_bmad-output/stories';
const IMPLEMENTATION_DIR = '_bmad-output/implementation-artifacts';
const PLANNING_DIR = '_bmad-output/planning-artifacts';

function parseYamlManual(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const navigation = { current: result };
  const lines = content.split('\n');
  let inDevStatus = false;

  for (const line of lines) {
    if (line.trim().startsWith('development_status:')) {
      inDevStatus = true;
      result['development_status'] = {};
      continue;
    }

    if (inDevStatus && line.trim() && !line.trim().startsWith('#')) {
      const match = line.match(/^\s+([a-zA-Z0-9\-\/\._]+):\s+(.+)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        // Remove comments
        if (value.includes('#')) {
          value = value.split('#')[0].trim();
        }
        result['development_status'][key] = value;
      }
    }
  }
  return result;
}

async function validate() {
  console.log('🔍 Starting Integrity Validation...');

  if (!fs.existsSync(SPRINT_STATUS_PATH)) {
    console.error('❌ CRITICAL: sprint-status.yaml not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(SPRINT_STATUS_PATH, 'utf-8');
  const data = parseYamlManual(content);

  const statusMap = data.development_status;
  if (!statusMap) {
    console.error(
      '❌ CRITICAL: No development_status section found in sprint-status.yaml',
    );
    process.exit(1);
  }

  let missingCount = 0;
  let successCount = 0;
  let ignoredCount = 0;

  console.log(`📋 Checking ${Object.keys(statusMap).length} entries...`);

  for (const [key, status] of Object.entries(statusMap)) {
    if (status === 'backlog' || status === 'deferred') {
      ignoredCount++;
      continue;
    }

    // Determine expected file path
    let expectedPath = '';
    let type = '';

    if (key.includes('retrospective')) {
      type = 'RETRO';
      // format: epic-X-retrospective -> epic-X-retrospective.md OR epic-X-retro.md
      // We'll search for pattern
      const retroNum = key.match(/epic-(\d+)-retrospective/)?.[1];
      if (retroNum) {
        // Search in implementation dir
        const files = fs.readdirSync(IMPLEMENTATION_DIR);
        const match = files.find(
          (f) =>
            f.includes(`epic-${retroNum}-retro`) ||
            f.includes(`epic-${retroNum}-retrospective`),
        );
        if (match) {
          successCount++;
          continue;
        }
        // Also check root output?
        expectedPath = path.join(
          IMPLEMENTATION_DIR,
          `epic-${retroNum}-retrospective.md`,
        );
      }
    } else if (key.startsWith('epic-') && !key.includes('/')) {
      type = 'EPIC';
      // epic-1 -> epic-1.md in planning artifacts
      const epicNum = key.replace('epic-', '');
      // Try sharded first
      // _bmad-output/planning-artifacts/epics/epic-X.md
      const shardedPath = path.join(
        PLANNING_DIR,
        'epics',
        `epic-${epicNum}.md`,
      );
      if (fs.existsSync(shardedPath)) {
        successCount++;
        continue;
      }
      // Try whole
      expectedPath = shardedPath;
    } else {
      type = 'STORY';
      // epic-01/1-1-name -> 1-1-name.md in stories dir
      // or just check if file exists with the name part
      const parts = key.split('/');
      let storyName = parts.length > 1 ? parts[1] : key;
      // remove epic prefix if redundant? No, usually story filename matches key suffix
      // key: epic-01/1-1-initialize... -> file: 1-1-initialize...md

      expectedPath = path.join(STORIES_DIR, `${storyName}.md`);
    }

    if (!fs.existsSync(expectedPath)) {
      // Try fuzzy match for stories
      if (type === 'STORY') {
        const dir = fs.readdirSync(STORIES_DIR);
        // key might be "epic-05/5-1-design..." -> looking for "5-1-design..."
        const namePart = expectedPath.split('/').pop()?.replace('.md', '');
        const match = dir.find((f) => f.includes(namePart!));
        if (match) {
          successCount++;
          continue;
        }
      }

      console.error(
        `❌ MISSING [${type}]: ${key} (${status}) - Expected at: ${expectedPath}`,
      );
      missingCount++;
    } else {
      successCount++;
    }
  }

  console.log('\n📊 Validation Summary:');
  console.log(`✅ Verified: ${successCount}`);
  console.log(`❌ Missing: ${missingCount}`);
  console.log(`⚪ Ignored (Backlog/Deferred): ${ignoredCount}`);

  if (missingCount > 0) {
    console.log('\n🚨 INTEGRITY CHECK FAILED: Missing artifacts detected.');
    process.exit(1);
  } else {
    console.log('\n✨ INTEGRITY CHECK PASSED: All tracked items exist.');
  }
}

validate().catch(console.error);
