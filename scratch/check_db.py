import sqlite3
import json

def main():
    conn = sqlite3.connect('local_db.sqlite')
    c = conn.cursor()
    c.execute("""
        SELECT r.pathway, resp.value_text, COUNT(*)
        FROM responses resp
        JOIN respondents r ON r.id = resp.respondent_id
        WHERE resp.question_id IN ('exp_lubrication_need', 'final_aesthetic_preference')
        GROUP BY resp.question_id, r.pathway, resp.value_text
    """)
    for row in c.fetchall():
        print(f"{row}")

if __name__ == '__main__':
    main()
