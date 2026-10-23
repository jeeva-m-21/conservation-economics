import os
import re
import json

RAW_DIR = "raw"
OUT_QUESTIONS = "questions"
OUT_JSON = "json"

os.makedirs(OUT_QUESTIONS, exist_ok=True)
os.makedirs(OUT_JSON, exist_ok=True)

for week_num in range(1, 13):
    md_file = os.path.join(RAW_DIR, f"week{week_num}.md")
    
    title = f"Week {week_num} : Assignment {week_num}"
    due_date = None
    questions = []
    
    if os.path.exists(md_file):
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        if content.strip():
            blocks = re.split(r'\n(?=\d+\.\s*\n)', content)
            header_lines = [l.strip() for l in blocks[0].strip().split('\n') if l.strip()]
            if header_lines:
                title = header_lines[0]
                for hl in header_lines:
                    if "Due date on" in hl:
                        due_date = hl.replace("Due date on", "").strip()
            
            for b in blocks[1:]:
                lines = [l.strip() for l in b.strip().split('\n') if l.strip()]
                if not lines:
                    continue
                q_num_match = re.match(r'^(\d+)\.', lines[0])
                q_num = int(q_num_match.group(1)) if q_num_match else len(questions) + 1
                
                pt_idx = -1
                for idx, l in enumerate(lines):
                    if re.match(r'^\d+\s+Points?$', l, re.IGNORECASE):
                        pt_idx = idx
                        break
                
                ans_idx = -1
                for idx, l in enumerate(lines):
                    if "Accepted answer" in l:
                        ans_idx = idx
                        break
                        
                score_idx = -1
                for idx, l in enumerate(lines):
                    if "Score:" in l:
                        score_idx = idx
                        break
                
                end_opts = score_idx if score_idx != -1 else ans_idx
                q_text = " ".join(lines[1:pt_idx]) if pt_idx != -1 else lines[1]
                options = lines[pt_idx+1:end_opts] if pt_idx != -1 and end_opts != -1 else []
                
                ans_indices = []
                if ans_idx != -1:
                    raw_ans = lines[ans_idx]
                    clean_ans = re.sub(r'Accepted answers?\s*(?:is|are)?\s*:?\s*', '', raw_ans, flags=re.IGNORECASE).strip()
                    for opt_i, opt in enumerate(options):
                        if opt.strip().lower() == clean_ans.lower():
                            ans_indices.append(opt_i)
                            break
                            
                q_obj = {
                    "id": f"w{week_num:02d}-q{q_num:03d}",
                    "question": q_text,
                    "options": options,
                    "answer": ans_indices
                }
                questions.append(q_obj)

    data = {
        "week": week_num,
        "title": title,
        "due_date": due_date,
        "questions": questions
    }
    
    path_questions = os.path.join(OUT_QUESTIONS, f"week-{week_num:02d}.json")
    with open(path_questions, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    path_json = os.path.join(OUT_JSON, f"week{week_num}.json")
    with open(path_json, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print("Parsed successfully!")
