
import os
import re
import glob

# Paths
BASE_DIR = os.getcwd()
STORIES_DIR = os.path.join(BASE_DIR, '_bmad-output/stories')
SRC_DIR = os.path.join(BASE_DIR, 'src')

def get_all_stories():
    return glob.glob(os.path.join(STORIES_DIR, '*.md'))

def parse_story_requirements(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract file references - looking for file paths or backticked filenames in code sections
    # Heuristic: look for lines starting with "- " containing .ts, .tsx, .css, etc.
    # Or strict "Files Created" sections if standard BMad format used.
    
    files_referenced = set()
    
    # 1. Look for explicit file mentions in blocks
    # e.g. `src/components/MyComponent.tsx`
    explicit_paths = re.findall(r'`(src/[^`]+\.[a-z]+)`', content)
    files_referenced.update(explicit_paths)
    
    # 2. Look for "Target File" lines often used in tool calls or specs
    # Target: src/foo/bar.ts
    target_matches = re.findall(r'Target: (src/[^\s]+)', content)
    files_referenced.update(target_matches)
    
    # 3. Look for file basename mentions if unique? Too noisy.
    
    return files_referenced

def check_file_existence(relative_path):
    return os.path.exists(os.path.join(BASE_DIR, relative_path))

def audit():
    print("🕵️ Starting Traceability Audit...")
    stories = get_all_stories()
    print(f"📚 Analyzing {len(stories)} stories.")
    
    no_code_stories = []
    missing_files_map = {}
    
    for story_path in stories:
        story_name = os.path.basename(story_path)
        refs = parse_story_requirements(story_path)
        
        if not refs:
            # Maybe it didn't require code? Or format is different.
            # We'll flag it as "No Code References Found"
            no_code_stories.append(story_name)
            continue
            
        missing_for_story = []
        for ref in refs:
            if not check_file_existence(ref):
                missing_for_story.append(ref)
                
        if missing_for_story:
            missing_files_map[story_name] = missing_for_story

    print("\n🚩 STORIES WITH MISSING FILES:")
    if not missing_files_map:
        print("  (None - All referenced files exist)")
    else:
        for story, files in missing_files_map.items():
            print(f"  ❌ {story}")
            for f in files:
                print(f"     - {f}")

    print(f"\n⚠️ STORIES WITH NO DETECTED CODE REFERENCES ({len(no_code_stories)}):")
    # Limit output
    for s in no_code_stories[:10]:
        print(f"  - {s}")
    if len(no_code_stories) > 10: print(f"  ...and {len(no_code_stories)-10} more")

if __name__ == "__main__":
    audit()
