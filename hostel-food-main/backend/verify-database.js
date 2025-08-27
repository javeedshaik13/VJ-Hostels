const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database
const dbPath = path.join(__dirname, 'hostel_food.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.\n');
});

// Function to show database statistics
function showDatabaseStats() {
    return new Promise((resolve, reject) => {
        console.log('=== DATABASE STATISTICS ===\n');
        
        // Show table structure
        db.all("PRAGMA table_info(students)", (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log('Students Table Structure:');
            console.table(rows.map(row => ({
                Column: row.name,
                Type: row.type,
                NotNull: row.notnull ? 'YES' : 'NO',
                Default: row.dflt_value || 'NULL',
                PrimaryKey: row.pk ? 'YES' : 'NO'
            })));
            
            // Count total students
            db.get("SELECT COUNT(*) as total FROM students", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(`\nTotal Students: ${row.total}`);
                
                // Count by year
                db.all(`
                    SELECT year, COUNT(*) as count 
                    FROM students 
                    WHERE year IS NOT NULL 
                    GROUP BY year 
                    ORDER BY year DESC
                `, (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    console.log('\nStudents by Year:');
                    console.table(rows);
                    
                    // Count by degree
                    db.all(`
                        SELECT degree, COUNT(*) as count 
                        FROM students 
                        WHERE degree IS NOT NULL 
                        GROUP BY degree 
                        ORDER BY count DESC
                    `, (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        console.log('\nStudents by Degree:');
                        console.table(rows);
                        
                        // Show sample of new students (with year and degree)
                        db.all(`
                            SELECT name, roll_number, year, degree, email 
                            FROM students 
                            WHERE year IS NOT NULL 
                            LIMIT 10
                        `, (err, rows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            
                            console.log('\nSample of Imported Students:');
                            console.table(rows);
                            
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

// Main execution
async function main() {
    try {
        await showDatabaseStats();
        console.log('\n✅ Database verification completed!');
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('\nDatabase connection closed.');
            }
        });
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
