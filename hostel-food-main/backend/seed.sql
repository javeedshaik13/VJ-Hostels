-- seed.sql: Example data for hostel food management

-- Insert wardens
INSERT INTO wardens (name, username, password_hash) VALUES ('Mr Venkat Rao', 'warden_a', 'wardena');
INSERT INTO wardens (name, username, password_hash) VALUES ('Ms Vijaya', 'warden_b', 'wardenb');

-- Insert hostels
INSERT INTO hostels (name, warden_id) VALUES ('Boys Hostel - Main', 1);
INSERT INTO hostels (name, warden_id) VALUES ('Girls Hostel - Main', 2);

-- Insert students

-- Insert admins
INSERT INTO admins (username, password_hash) VALUES ('admin', 'admin');

-- Example food_pauses
-- INSERT INTO food_pauses (student_id, pause_from, pause_meals) VALUES (1, '2025-07-20', 'breakfast,lunch');
-- INSERT INTO food_pauses (student_id, pause_from, pause_meals, resume_from, resume_meals) VALUES (3, '2025-07-21', 'breakfast,lunch', '2025-07-25', 'lunch,snacks,dinner');

-- Example food_counts
-- INSERT INTO food_counts (hostel_id, date, breakfast_count, lunch_count, snacks_count, dinner_count) VALUES (1, '2025-07-20', 100, 120, 110, 115);
-- INSERT INTO food_counts (hostel_id, date, breakfast_count, lunch_count, snacks_count, dinner_count) VALUES (2, '2025-07-20', 80, 90, 85, 88);
