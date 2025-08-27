# Student Import Script

This directory contains scripts to import student data from CSV files into the hostel food management database.

## Database Changes

The `students` table has been enhanced with two new columns:
- `year` (TEXT) - Student's academic year (e.g., "2024", "2023")
- `degree` (TEXT) - Student's degree program (e.g., "B.Tech", "M.Tech")

## Scripts Available

### 1. Import Students (`import-students.js`)

Imports student data from `hostel_2_students_list.csv` into the database.

**Features:**
- ✅ Automatically adds `year` and `degree` columns if they don't exist
- ✅ Generates email addresses from roll numbers (`rollnumber@vnrvjiet.in`)
- ✅ Handles duplicate entries (skips if roll number already exists)
- ✅ Validates data before insertion
- ✅ Provides detailed progress and summary reports

**Usage:**
```bash
# Run the import script
npm run import-students

# Or directly with node
node import-students.js
```

**CSV Format Expected:**
```csv
Name,Rollno,Year,Degree
M. Lakshmi Sahithi,24071A6657,2024,B.Tech
Sudharshanam Ashitha,24071A6955,2024,B.Tech
```

### 2. Verify Database (`verify-database.js`)

Displays database statistics and verification information.

**Features:**
- ✅ Shows table structure
- ✅ Displays student counts by year and degree
- ✅ Shows sample imported data
- ✅ Provides comprehensive database overview

**Usage:**
```bash
# Run the verification script
npm run verify-db

# Or directly with node
node verify-database.js
```

## Installation

Install the required dependencies:

```bash
npm install csv-parser
```

## Current Database Statistics

After running the import script with `hostel_2_students_list.csv`:

- **Total Students:** 804
- **Students by Year:**
  - 2024: 298 students
  - 2023: 309 students  
  - 2022: 194 students
- **Students by Degree:**
  - B.Tech: 796 students
  - M.Tech: 5 students

## File Structure

```
backend/
├── import-students.js          # Main import script
├── verify-database.js          # Database verification script
├── hostel_2_students_list.csv  # Student data CSV file
├── hostel_food.db             # SQLite database
├── schema.sql                 # Updated database schema
└── package.json               # Node.js dependencies and scripts
```

## Error Handling

The import script handles various scenarios:

1. **Missing CSV file** - Script will exit with error message
2. **Invalid data rows** - Skipped with warning (e.g., missing name or roll number)
3. **Duplicate roll numbers** - Skipped with informative message
4. **Database errors** - Detailed error logging
5. **Missing columns** - Automatically adds required columns to existing tables

## Schema Migration

If you have an existing database without `year` and `degree` columns, the import script will automatically add them:

```sql
ALTER TABLE students ADD COLUMN year TEXT;
ALTER TABLE students ADD COLUMN degree TEXT;
```

## Sample Output

```
Starting student import process...

1. Checking and adding required columns...
Added year column to students table
Added degree column to students table

2. Importing students from CSV...
Parsed 804 students from CSV
✓ Inserted: M. Lakshmi Sahithi (24071A6657)
✓ Inserted: Sudharshanam Ashitha (24071A6955)
...

=== Import Summary ===
Total students processed: 804
Successfully inserted: 801
Skipped (duplicates/errors): 3

✅ Student import completed successfully!
```

## Customization

You can modify the import script for different CSV formats or database configurations:

1. **Change CSV file path** - Update `csvPath` variable
2. **Modify email generation** - Update `generateEmail()` function
3. **Change hostel assignment** - Update `hostel_id` logic
4. **Add more columns** - Extend the schema and import logic

## Troubleshooting

**Common Issues:**

1. **CSV parsing errors** - Ensure CSV has proper headers and encoding
2. **Database locked** - Make sure no other processes are using the database
3. **Permission errors** - Ensure write permissions for database file
4. **Memory issues** - For very large CSV files, consider processing in batches

**Debug Mode:**
The scripts include detailed logging. Check console output for specific error messages and resolution steps.
