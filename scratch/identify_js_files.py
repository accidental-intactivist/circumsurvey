import os

folder = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\unpacked_mockup"
targets = [
    "7e222bd3-44cc-4943-a9a6-7211a057cc96",
    "9f849856-df2e-471c-a9e9-830d40d010d7",
    "eb937ae2-6fed-4866-91b9-fa5270ef7191",
    "ebc3d6ae-7511-4310-8776-f6bdfd489a13"
]

output_report = []

for filename in targets:
    filepath = os.path.join(folder, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        lines = [f.readline().strip() for _ in range(30)]
    output_report.append(f"File: {filename}")
    for i, line in enumerate(lines):
        output_report.append(f"  {i+1}: {line}")
    output_report.append("="*60)

with open(r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\identify_report.txt", "w", encoding="utf-8") as out:
    out.write("\n".join(output_report))

print("Wrote identify_report.txt!")
