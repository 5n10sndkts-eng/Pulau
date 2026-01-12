
import os
import sys

# Paths
BASE_DIR = os.getcwd()
SPRINT_STATUS_PATH = os.path.join(BASE_DIR, '_bmad-output/sprint-status.yaml')
STORIES_DIR = os.path.join(BASE_DIR, '_bmad-output/stories')
PLANNING_DIR = os.path.join(BASE_DIR, '_bmad-output/planning-artifacts')
IMPLEMENTATION_DIR = os.path.join(BASE_DIR, '_bmad-output/implementation-artifacts')

def parse_yaml_manual(filepath):
    """
    Manually parses the development_status section of sprint-status.yaml.
    Returns a dict of key -> status.
    """
    status_map = {}
    in_dev_status = False
    
    try:
        with open(filepath, 'r') as f:
            for line in f:
                line_stripped = line.strip()
                
                # Check section start
                if line_stripped.startswith('development_status:'):
                    in_dev_status = True
                    continue
                
                # Stop if we hit another top-level key (no indentation)
                if in_dev_status and line_stripped and not line.startswith('  ') and not line.startswith('\t') and not line.startswith('#'):
                     # This heuristic might be flaky if file isn't perfectly indented, 
                     # but typically dev_status is the last big section.
                     pass 

                if in_dev_status and line_stripped and not line_stripped.startswith('#'):
                    # Parse "key: value"
                    if ':' in line_stripped:
                        key_part, value_part = line_stripped.split(':', 1)
                        key = key_part.strip()
                        value = value_part.strip().split('#')[0].strip() # remove comments
                        
                        # Filter out phase headers or comments
                        if key.startswith('='): continue
                        
                        status_map[key] = value
    except FileNotFoundError:
        print(f"❌ CRITICAL: {filepath} not found!")
        sys.exit(1)
        
    return status_map

def find_file(directory, name_fragment):
    """
    Searches for a file containing name_fragment in the directory.
    Returns path if found, None otherwise.
    """
    if not os.path.exists(directory):
        return None
        
    # direct match first
    if os.path.exists(os.path.join(directory, name_fragment)):
        return os.path.join(directory, name_fragment)
    if os.path.exists(os.path.join(directory, name_fragment + '.md')):
        return os.path.join(directory, name_fragment + '.md')

    # fuzzy match
    try:
        for filename in os.listdir(directory):
            if name_fragment in filename:
                return os.path.join(directory, filename)
    except OSError:
        pass
        
    return None

def validate():
    print("🔍 Starting Integrity Validation (Python)...")
    
    status_map = parse_yaml_manual(SPRINT_STATUS_PATH)
    print(f"📋 Found {len(status_map)} entries in sprint-status.yaml")
    
    missing_count = 0
    success_count = 0
    ignored_count = 0
    
    for key, status in status_map.items():
        if status in ['backlog', 'deferred', 'optional', 'skipped']:
            ignored_count += 1
            continue
            
        expected_type = 'UNKNOWN'
        found = False
        
        # 1. Retrospectives
        if 'retrospective' in key:
            expected_type = 'RETRO'
            # key: epic-X-retrospective -> epic-X-retro or epic-X-retrospective
            retro_num = key.split('-')[1] if len(key.split('-')) > 1 else '?'
            search_key = f"epic-{retro_num}"
            
            # Check implementation artifacts
            path_found = find_file(IMPLEMENTATION_DIR, f"{search_key}-retro")
            if not path_found:
                 path_found = find_file(IMPLEMENTATION_DIR, f"{search_key}-retrospective")
                 
            if path_found: found = True
            
        # 2. Epics
        elif key.startswith('epic-') and '/' not in key:
            expected_type = 'EPIC'
            epic_num = key.replace('epic-', '')
            # Check planning artifacts/epics
            path_found = find_file(os.path.join(PLANNING_DIR, 'epics'), f"epic-{epic_num}")
            if not path_found:
                # Check root planning dir
                path_found = find_file(PLANNING_DIR, f"epic-{epic_num}")
            
            if path_found: found = True
            
        # 3. Stories
        else:
            expected_type = 'STORY'
            # key: epic-01/1-1-story-name -> 1-1-story-name.md
            # OR key: 21-1-create-table -> 21-1-create-table.md
            
            story_name = key
            if '/' in key:
                story_name = key.split('/')[1]
            
            # Search in stories dir
            path_found = find_file(STORIES_DIR, story_name)
            
            if path_found: found = True

        if found:
            success_count += 1
        else:
            print(f"❌ MISSING [{expected_type}]: {key} ({status})")
            missing_count += 1
            
    print("\n📊 Validation Summary:")
    print(f"✅ Verified: {success_count}")
    print(f"❌ Missing: {missing_count}")
    print(f"⚪ Ignored: {ignored_count}")
    
    if missing_count > 0:
        print("\n🚨 INTEGRITY CHECK FAILED: Missing artifacts detected.")
        sys.exit(1)
    else:
        print("\n✨ INTEGRITY CHECK PASSED: All tracked items exist.")

if __name__ == "__main__":
    validate()
