
import os
import re

# Paths
BASE_DIR = os.getcwd()
BACKUP_FILES = [
    os.path.join(BASE_DIR, '_bmad-output/planning-artifacts/epics.md.bak'),
    os.path.join(BASE_DIR, '_bmad-output/planning-artifacts/phase-2-epics.md'),
    os.path.join(BASE_DIR, '_bmad-output/planning-artifacts/phase-2b-epics.md')
]
STORIES_DIR = os.path.join(BASE_DIR, '_bmad-output/stories')
EPICS_DIR = os.path.join(BASE_DIR, '_bmad-output/planning-artifacts/epics')

# Ensure directories exist
os.makedirs(STORIES_DIR, exist_ok=True)
os.makedirs(EPICS_DIR, exist_ok=True)

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_and_restore(filepath):
    print(f"📂 Processing {filepath}...")
    if not os.path.exists(filepath):
        print(f"⚠️ File not found: {filepath}")
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # Split by lines to process statefully
    lines = content.split('\n')
    
    current_epic_num = None
    current_epic_title = None
    current_epic_content = []
    
    current_story_num = None
    current_story_title = None
    current_story_content = []
    
    in_epic = False
    in_story = False
    
    for line in lines:
        # Detect Epic Header: "## Epic X: Title"
        epic_match = re.match(r'^##\s+Epic\s+(\d+):\s+(.+)$', line)
        if epic_match:
            # Save previous epic/story if valid
            if current_epic_num:
                save_epic(current_epic_num, current_epic_title, current_epic_content)
            if current_story_num:
                save_story(current_story_num, current_story_title, current_story_content)
                current_story_num = None
                current_story_content = []

            # Start new epic
            current_epic_num = epic_match.group(1)
            current_epic_title = epic_match.group(2)
            current_epic_content = [line]
            in_epic = True
            in_story = False
            continue

        # Detect Story Header: "### Story X.Y: Title" or "### X.Y: Title"
        # Adjusted regex to handle "Story 1.1:" and "29-1:" formats found in different files
        story_match = re.match(r'^###\s+(?:Story\s+)?(\d+)[-.](\d+):\s+(.+)$', line)
        
        # Also try "### 29-1: Title" format
        if not story_match:
             story_match_alt = re.match(r'^###\s+(\d+)-(\d+):\s+(.+)$', line)
             if story_match_alt:
                 story_match = story_match_alt

        if story_match:
            # Save previous story
            if current_story_num:
                save_story(current_story_num, current_story_title, current_story_content)
            
            # Start new story
            # Format: '1.1' or '29-1' -> verify it belongs to current epic?
            # Ideally yes, but let's trust the file structure
            major = story_match.group(1)
            minor = story_match.group(2)
            current_story_num = f"{major}-{minor}"
            current_story_title = story_match.group(3)
            current_story_content = [line]
            
            # Add to epic content too? Usually stories are part of epic doc.
            current_epic_content.append(line)
            
            in_story = True
            continue

        # Append content
        if in_story:
            current_story_content.append(line)
        
        if in_epic:
             # If we are in a story, we are arguably also in an epic, 
             # but we might want to deduplicate checks.
             # However, current_epic_content is accumulating EVERYTHING for the epic file
             current_epic_content.append(line)

    # Save final items
    if current_story_num:
        save_story(current_story_num, current_story_title, current_story_content)
    if current_epic_num:
        save_epic(current_epic_num, current_epic_title, current_epic_content)

def save_epic(num, title, lines):
    filename = f"epic-{num}.md"
    path = os.path.join(EPICS_DIR, filename)
    # Optional: Don't overwrite if exists? User verified repair step overwrote some.
    # We will overwrite to ensure consistency with backup source of truth.
    with open(path, 'w') as f:
        f.write('\n'.join(lines))
    print(f"  ✅ Restored Epic {num}: {filename}")

def save_story(num, title, lines):
    # num looks like "1-1" or "29-1"
    # title needs slug
    slug = slugify(title)
    filename = f"{num}-{slug}.md"
    path = os.path.join(STORIES_DIR, filename)
    
    with open(path, 'w') as f:
        f.write('\n'.join(lines))
    # print(f"  ✅ Restored Story {num}: {filename}")

if __name__ == "__main__":
    print("🔧 Starting Artifact Restoration...")
    for f in BACKUP_FILES:
        try:
             parse_and_restore(f)
        except Exception as e:
            print(f"Error processing {f}: {e}")
    print("🏁 Restoration Complete.")
