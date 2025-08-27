const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

// Help function
function showHelp() {
    console.log(`
Usage: node import-students.js <csvFile> <hostelId> [mode]

Parameters:
  csvFile   - Path to the CSV file (required)
  hostelId  - Hostel ID number (required)
  mode      - Operation mode: 'clean', 'upsert', or 'insert' (optional, default: 'insert')

Modes:
  clean   - Delete existing students for this hostel AND any matching roll numbers, then insert new ones
  upsert  - Update existing students (move to new hostel if needed), insert new ones
  insert  - Insert only (skip duplicates) - DEFAULT

Examples:
  node import-students.js hostel_2_students_list.csv 1
  node import-students.js hostel_2_students_list.csv 2 clean
  node import-students.js students_hostel_3.csv 3 upsert
  node import-students.js ./data/students.csv 1 insert

CSV Format Expected:
  Name,Rollno,Year,Degree
  Student Name,RollNumber,2024,B.Tech
`);
}

// Validate and parse arguments
if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}

const csvFileName = args[0];
const hostelId = parseInt(args[1]);
const mode = args[2] || 'insert';

// Validate parameters
if (!csvFileName) {
    console.error('❌ Error: CSV file name is required');
    showHelp();
    process.exit(1);
}

if (isNaN(hostelId) || hostelId < 1) {
    console.error('❌ Error: Valid hostel ID is required (must be a positive integer)');
    showHelp();
    process.exit(1);
}

if (!['clean', 'upsert', 'insert'].includes(mode)) {
    console.error('❌ Error: Mode must be "clean", "upsert", or "insert"');
    showHelp();
    process.exit(1);
}

// Path to the database and CSV file
const dbPath = path.join(__dirname, 'hostel_food.db');
const csvPath = path.isAbsolute(csvFileName) ? csvFileName : path.join(__dirname, csvFileName);

console.log(`
=== Import Configuration ===
CSV File: ${csvPath}
Hostel ID: ${hostelId}
Mode: ${mode}
========================
`);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

// Function to clean existing students for a hostel
function cleanExistingStudents(hostelId) {
    return new Promise((resolve, reject) => {
        console.log(`🗑️  Cleaning existing students for hostel ${hostelId}...`);
        
        // First, get count of students to be deleted from this specific hostel
        db.get("SELECT COUNT(*) as count FROM students WHERE hostel_id = ?", [hostelId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            const studentsToDelete = row.count;
            console.log(`Found ${studentsToDelete} existing students in hostel ${hostelId} to delete`);
            
            if (studentsToDelete === 0) {
                console.log(`No existing students in hostel ${hostelId} to delete`);
                resolve();
                return;
            }
            
            // Delete existing students for this hostel only
            db.run("DELETE FROM students WHERE hostel_id = ?", [hostelId], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`✅ Deleted ${this.changes} students from hostel ${hostelId}`);
                resolve();
            });
        });
    });
}

// Function to add columns if they don't exist
function addColumnsIfNotExist() {
    return new Promise((resolve, reject) => {
        // Check if year column exists
        db.get("PRAGMA table_info(students)", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Get all column info
            db.all("PRAGMA table_info(students)", (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const columnNames = rows.map(row => row.name);
                const hasYear = columnNames.includes('year');
                const hasDegree = columnNames.includes('degree');
                
                let promises = [];
                
                if (!hasYear) {
                    promises.push(new Promise((resolve, reject) => {
                        db.run("ALTER TABLE students ADD COLUMN year TEXT", (err) => {
                            if (err) {
                                console.error('Error adding year column:', err.message);
                                reject(err);
                            } else {
                                console.log('Added year column to students table');
                                resolve();
                            }
                        });
                    }));
                }
                
                if (!hasDegree) {
                    promises.push(new Promise((resolve, reject) => {
                        db.run("ALTER TABLE students ADD COLUMN degree TEXT", (err) => {
                            if (err) {
                                console.error('Error adding degree column:', err.message);
                                reject(err);
                            } else {
                                console.log('Added degree column to students table');
                                resolve();
                            }
                        });
                    }));
                }
                
                Promise.all(promises).then(() => resolve()).catch(reject);
            });
        });
    });
}

// Function to generate email from roll number
function generateEmail(rollNumber) {
    // Convert roll number to lowercase and add domain
    return `${rollNumber.toLowerCase()}@vnrvjiet.in`;
}

// Function to import students from CSV
function importStudentsFromCSV() {
    return new Promise((resolve, reject) => {
        const students = [];
        
        console.log('Reading CSV file:', csvPath);
        
        if (!fs.existsSync(csvPath)) {
            reject(new Error('CSV file not found: ' + csvPath));
            return;
        }
        
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                // Clean up the data
                const student = {
                    name: row.Name?.trim() || '',
                    roll_number: row.Rollno?.trim() || '',
                    year: row.Year?.trim() || '',
                    degree: row.Degree?.trim() || '',
                    email: generateEmail(row.Rollno?.trim() || ''),
                    hostel_id: hostelId // Use the passed hostel ID
                };
                
                // Validate required fields
                if (student.name && student.roll_number) {
                    students.push(student);
                } else {
                    console.warn('Skipping invalid row:', row);
                }
            })
            .on('end', () => {
                console.log(`Parsed ${students.length} students from CSV`);
                insertStudents(students, mode).then(resolve).catch(reject);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to insert students into database
function insertStudents(students, mode) {
    return new Promise((resolve, reject) => {
        let processedCount = 0;
        let skippedCount = 0;
        let operationName;
        
        if (mode === 'upsert') {
            operationName = 'upserted';
        } else {
            operationName = 'inserted';
        }
        
        const insertPromises = students.map(student => {
            return new Promise((resolve, reject) => {
                if (mode === 'upsert') {
                    // For upsert: first check if student exists, then update or insert
                    db.get(
                        "SELECT id FROM students WHERE roll_number = ?", 
                        [student.roll_number], 
                        (err, row) => {
                            if (err) {
                                console.error('Error checking student:', student.name, err.message);
                                skippedCount++;
                                resolve();
                                return;
                            }
                            
                            if (row) {
                                // Student exists, update it
                                db.run(
                                    `UPDATE students 
                                     SET name = ?, email = ?, hostel_id = ?, year = ?, degree = ? 
                                     WHERE roll_number = ?`,
                                    [student.name, student.email, student.hostel_id, student.year, student.degree, student.roll_number],
                                    function(err) {
                                        if (err) {
                                            console.error('Error updating student:', student.name, err.message);
                                            skippedCount++;
                                        } else {
                                            processedCount++;
                                            console.log(`✓ Updated: ${student.name} (${student.roll_number}) -> Hostel ${student.hostel_id}`);
                                        }
                                        resolve();
                                    }
                                );
                            } else {
                                // Student doesn't exist, insert it
                                db.run(
                                    `INSERT INTO students (name, roll_number, email, hostel_id, year, degree)
                                     VALUES (?, ?, ?, ?, ?, ?)`,
                                    [student.name, student.roll_number, student.email, student.hostel_id, student.year, student.degree],
                                    function(err) {
                                        if (err) {
                                            console.error('Error inserting student:', student.name, err.message);
                                            skippedCount++;
                                        } else {
                                            processedCount++;
                                            console.log(`✓ Inserted: ${student.name} (${student.roll_number}) -> Hostel ${student.hostel_id}`);
                                        }
                                        resolve();
                                    }
                                );
                            }
                        }
                    );
                } else if (mode === 'clean') {
                    // For clean mode: delete existing student if exists, then insert with new hostel_id
                    db.run(
                        "DELETE FROM students WHERE roll_number = ?",
                        [student.roll_number],
                        function(err) {
                            if (err) {
                                console.error('Error deleting existing student:', student.name, err.message);
                                skippedCount++;
                                resolve();
                                return;
                            }
                            
                            // Now insert the student with new hostel_id
                            db.run(
                                `INSERT INTO students (name, roll_number, email, hostel_id, year, degree)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [student.name, student.roll_number, student.email, student.hostel_id, student.year, student.degree],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting student:', student.name, err.message);
                                        skippedCount++;
                                    } else {
                                        processedCount++;
                                        console.log(`✓ Moved: ${student.name} (${student.roll_number}) -> Hostel ${student.hostel_id}`);
                                    }
                                    resolve();
                                }
                            );
                        }
                    );
                } else {
                    // For insert mode: only insert if roll_number doesn't exist
                    db.run(
                        `INSERT INTO students (name, roll_number, email, hostel_id, year, degree)
                         SELECT ?, ?, ?, ?, ?, ?
                         WHERE NOT EXISTS (SELECT 1 FROM students WHERE roll_number = ?)`,
                        [student.name, student.roll_number, student.email, student.hostel_id, student.year, student.degree, student.roll_number],
                        function(err) {
                            if (err) {
                                console.error('Error inserting student:', student.name, err.message);
                                skippedCount++;
                            } else if (this.changes > 0) {
                                processedCount++;
                                console.log(`✓ Inserted: ${student.name} (${student.roll_number}) -> Hostel ${student.hostel_id}`);
                            } else {
                                skippedCount++;
                                console.log(`⚠ Skipped (already exists): ${student.name} (${student.roll_number})`);
                            }
                            resolve();
                        }
                    );
                }
            });
        });
        
        Promise.all(insertPromises)
            .then(() => {
                console.log(`\n=== Import Summary ===`);
                console.log(`Total students processed: ${students.length}`);
                console.log(`Successfully ${operationName}: ${processedCount}`);
                console.log(`Skipped (duplicates/errors): ${skippedCount}`);
                console.log(`Hostel ID: ${hostelId}`);
                console.log(`Mode: ${mode}`);
                resolve({ processedCount, skippedCount, total: students.length });
            })
            .catch(reject);
    });
}

// Function to verify the import
function verifyImport(hostelId) {
    return new Promise((resolve, reject) => {
        // Count total students
        db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`\nTotal students in database: ${row.count}`);
            
            // Count students for this specific hostel
            db.get("SELECT COUNT(*) as count FROM students WHERE hostel_id = ?", [hostelId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`Students in hostel ${hostelId}: ${row.count}`);
                
                // Show sample of imported data for this hostel
                db.all("SELECT * FROM students WHERE hostel_id = ? LIMIT 5", [hostelId], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    console.log(`\nSample of students in hostel ${hostelId}:`);
                    console.table(rows);
                    resolve();
                });
            });
        });
    });
}

// Main execution
async function main() {
    try {
        console.log('Starting student import process...\n');
        
        // Step 1: Add columns if they don't exist
        console.log('1. Checking and adding required columns...');
        await addColumnsIfNotExist();
        
        // Step 2: Clean existing data if mode is 'clean'
        if (mode === 'clean') {
            console.log('\n2. Cleaning existing students...');
            await cleanExistingStudents(hostelId);
        }
        
        // Step 3: Import students from CSV
        console.log(`\n${mode === 'clean' ? '3' : '2'}. Importing students from CSV...`);
        const result = await importStudentsFromCSV();
        
        // Step 4: Verify the import
        console.log(`\n${mode === 'clean' ? '4' : '3'}. Verifying import...`);
        await verifyImport(hostelId);
        
        console.log('\n✅ Student import completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during import:', error.message);
        process.exit(1);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, importStudentsFromCSV, addColumnsIfNotExist, cleanExistingStudents };
