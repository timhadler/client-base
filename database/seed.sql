-- --------------------------------------------------------
-- Seed Data for Client Base Demo
-- This file provides sample data for demonstration purposes
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

USE `clientbase`;

-- Clear existing data
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `reminders`;
TRUNCATE TABLE `appointment_attempts`;
TRUNCATE TABLE `clients`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS=1;

-- --------------------------------------------------------
-- Demo User
-- Email: demo@clientbase.com
-- Password: DemoPass@123
-- Hash generated with bcrypt rounds=10
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `email`, `email_verified`, `password_hash`, `subscription_status`, `subscription_tier`, `created_at`) VALUES
(1, 'demo@clientbase.com', b'1', '$2b$10$tFYFWNLIhvoh1btUENt/TOA0Q1Q5rB0CJ9d3/UXpNuBBsaLXwgdJG', 'active', 'premium', '2024-01-15 08:00:00');

-- --------------------------------------------------------
-- Demo Clients (all owned by demo user)
-- --------------------------------------------------------

INSERT INTO `clients` (`id`, `user_id`, `name`, `first_name`, `last_name`, `company`, `phone`, `email`, `addressLine1`, `city`, `state`, `postcode`, `country`, `createdAt`, `lastContact`, `nextFollowup`, `priority`, `source`, `notes`, `position`, `status`) VALUES
(1, 1, 'Alice Johnson', 'Alice', 'Johnson', 'TechStart Inc', '555-0101', 'alice.johnson@techstart.com', '123 Innovation Drive', 'San Francisco', 'CA', '94105', 'USA', '2024-11-01', '2025-01-20', '2025-01-27', 'high', 'referral', 'CEO of growing startup, very interested', 'CEO', 'active'),
(2, 1, 'Bob Martinez', 'Bob', 'Martinez', 'Martinez Consulting', '555-0102', 'bob@martinezconsult.com', '456 Business Blvd', 'Austin', 'TX', '78701', 'USA', '2024-11-15', '2025-01-18', '2025-01-28', 'medium', 'networking event', 'Met at conference, needs follow-up', 'Principal', 'active'),
(3, 1, 'Carol Chen', 'Carol', 'Chen', 'DataFlow Analytics', '555-0103', 'c.chen@dataflow.io', '789 Tech Lane', 'Seattle', 'WA', '98101', 'USA', '2024-12-01', '2025-01-15', '2025-01-30', 'high', 'cold outreach', 'Responded positively to initial email', 'VP Operations', 'active'),
(4, 1, 'David Kim', 'David', 'Kim', 'Kim & Associates', '555-0104', 'david.kim@kimassoc.com', '321 Professional Way', 'New York', 'NY', '10001', 'USA', '2024-12-10', '2025-01-10', NULL, 'low', 'website', 'Downloaded whitepaper, minimal engagement', 'Partner', 'active'),
(5, 1, 'Emma Wilson', 'Emma', 'Wilson', 'Wilson Creative Studio', '555-0105', 'emma@wilsoncreative.com', '654 Design Street', 'Portland', 'OR', '97201', 'USA', '2025-01-05', NULL, '2025-01-29', 'medium', 'social media', 'Connected on LinkedIn, sent proposal', 'Creative Director', 'pending'),
(6, 1, 'Frank Rodriguez', 'Frank', 'Rodriguez', 'Rodriguez Solutions', '555-0106', 'frank.r@rodsolutions.com', '987 Enterprise Ave', 'Miami', 'FL', '33101', 'USA', '2024-10-20', '2024-12-15', NULL, 'low', 'advertisement', 'No response to last 3 attempts', 'Founder', 'inactive'),
(7, 1, 'Grace Taylor', 'Grace', 'Taylor', 'Taylor Enterprises', '555-0107', 'grace@taylorenterprises.com', '147 Commerce Plaza', 'Chicago', 'IL', '60601', 'USA', '2024-12-20', '2025-01-22', '2025-02-05', 'high', 'referral', 'Referred by Alice Johnson, warm lead', 'Managing Director', 'active'),
(8, 1, 'Henry Lee', 'Henry', 'Lee', NULL, '555-0108', 'henry.lee@email.com', '258 Residential Road', 'Boston', 'MA', '02101', 'USA', '2025-01-12', '2025-01-25', '2025-02-01', 'medium', 'walk-in', 'Individual client, interested in services', NULL, 'active'),
(9, 1, 'Isabella Brown', 'Isabella', 'Brown', 'Brown Innovations', '555-0201', 'i.brown@browninnovations.com', '369 Startup Street', 'Denver', 'CO', '80201', 'USA', '2024-11-10', '2025-01-19', '2025-01-26', 'high', 'networking event', 'Very enthusiastic, ready to proceed', 'Founder & CEO', 'active'),
(10, 1, 'Jack Anderson', 'Jack', 'Anderson', 'Anderson Group', '555-0202', 'jack@andersongroup.com', '741 Corporate Center', 'Atlanta', 'GA', '30301', 'USA', '2024-12-05', '2025-01-17', '2025-01-31', 'medium', 'cold outreach', 'Showed interest, requested more info', 'COO', 'active'),
(11, 1, 'Kevin White', 'Kevin', 'White', 'White Tech Solutions', '555-0301', 'kevin@whitetech.com', '852 Silicon Valley', 'San Jose', 'CA', '95101', 'USA', '2025-01-15', '2025-01-24', '2025-02-07', 'medium', 'website', 'Submitted contact form yesterday', 'CTO', 'pending'),
(12, 1, 'Laura Garcia', 'Laura', 'Garcia', 'Garcia Ventures', '555-0302', 'laura.garcia@garciaventures.com', '963 Investment Blvd', 'Los Angeles', 'CA', '90001', 'USA', '2025-01-18', NULL, '2025-01-28', 'high', 'referral', 'High-value potential client', 'Managing Partner', 'pending');

-- --------------------------------------------------------
-- Demo Appointment Attempts (all for demo user)
-- --------------------------------------------------------

INSERT INTO `appointment_attempts` (`id`, `client_id`, `user_id`, `status`, `outcome`, `createdAt`, `first_reminder_sent_at`, `outcome_set_at`, `resolved_at`, `total_reminders_sent`, `is_legacy`) VALUES
-- Active appointment attempts (ongoing)
(1, 1, 1, 'active', 'followup', '2024-11-01 10:00:00', '2025-01-15 09:00:00', '2025-01-20 14:30:00', NULL, 3, b'0'),
(2, 2, 1, 'active', 'followup', '2024-11-15 11:00:00', '2025-01-10 10:00:00', '2025-01-18 16:00:00', NULL, 3, b'0'),
(3, 3, 1, 'active', 'followup', '2024-12-01 09:30:00', '2025-01-05 08:00:00', '2025-01-15 11:00:00', NULL, 2, b'0'),
(4, 4, 1, 'stale', 'waiting', '2024-12-10 14:00:00', '2025-01-10 09:00:00', NULL, NULL, 1, b'0'),
(5, 5, 1, 'active', 'waiting', '2025-01-05 10:00:00', '2025-01-29 09:00:00', NULL, NULL, 1, b'0'),
(6, 7, 1, 'active', 'followup', '2024-12-20 13:00:00', '2025-01-20 10:00:00', '2025-01-22 15:00:00', NULL, 2, b'0'),
(7, 8, 1, 'active', 'followup', '2025-01-12 12:00:00', '2025-01-25 11:00:00', '2025-01-25 14:00:00', NULL, 2, b'0'),
(8, 9, 1, 'resolved', 'booked', '2024-11-10 10:30:00', '2025-01-12 09:00:00', '2025-01-19 16:30:00', '2025-01-19 16:30:00', 2, b'0'),
(9, 10, 1, 'active', 'followup', '2024-12-05 11:00:00', '2025-01-17 10:00:00', '2025-01-17 15:00:00', NULL, 1, b'0'),
(10, 11, 1, 'active', 'followup', '2025-01-15 14:00:00', '2025-01-20 09:00:00', '2025-01-24 10:00:00', NULL, 1, b'0'),
(11, 12, 1, 'active', 'none', '2025-01-18 09:00:00', '2025-01-28 09:00:00', NULL, NULL, 1, b'0'),

-- Resolved/Abandoned attempts
(12, 6, 1, 'abandoned', 'no_answer', '2024-10-20 10:00:00', '2024-12-01 09:00:00', '2024-12-15 16:00:00', '2024-12-15 16:00:00', 4, b'0');

-- --------------------------------------------------------
-- Demo Reminders (all for demo user)
-- --------------------------------------------------------

INSERT INTO `reminders` (`id`, `client_id`, `appointment_attempt_id`, `user_id`, `createdAt`, `rDate`, `respondedAt`, `completedAt`, `status`, `important`, `method`, `outcome`, `reminderCount`, `note`, `is_legacy`) VALUES
-- Active reminders (pending status)
(1, 1, 1, 1, '2025-01-22 09:00:00', '2025-01-27', NULL, NULL, 'pending', b'1', NULL, NULL, 1, 'Follow up on proposal discussion', b'0'),
(2, 2, 2, 1, '2025-01-23 09:00:00', '2025-01-28', NULL, NULL, 'pending', b'0', NULL, NULL, 2, 'Send contract details', b'0'),
(3, 3, 3, 1, '2025-01-25 09:00:00', '2025-01-30', NULL, NULL, 'pending', b'1', NULL, NULL, 1, 'Schedule demo call', b'0'),
(4, 5, 5, 1, '2025-01-26 09:00:00', '2025-01-29', NULL, NULL, 'pending', b'0', NULL, NULL, 1, 'Initial outreach - introduce services', b'0'),
(5, 7, 6, 1, '2025-01-28 09:00:00', '2025-02-05', NULL, NULL, 'pending', b'1', NULL, NULL, 1, 'Warm referral follow-up', b'0'),
(6, 8, 7, 1, '2025-01-26 10:00:00', '2025-02-01', NULL, NULL, 'pending', b'0', NULL, NULL, 2, 'Check interest level', b'0'),
(7, 9, 8, 1, '2025-01-22 10:00:00', '2025-01-26', NULL, NULL, 'pending', b'1', NULL, NULL, 2, 'Ready to close - send contract', b'0'),
(8, 10, 9, 1, '2025-01-24 09:00:00', '2025-01-31', NULL, NULL, 'pending', b'0', NULL, NULL, 1, 'Send pricing information', b'0'),
(9, 11, 10, 1, '2025-01-30 09:00:00', '2025-02-07', NULL, NULL, 'pending', b'0', NULL, NULL, 1, 'Follow up on web inquiry', b'0'),
(10, 12, 11, 1, '2025-01-25 09:00:00', '2025-01-28', NULL, NULL, 'pending', b'1', NULL, NULL, 1, 'High priority - make first contact', b'0'),

-- Completed reminders with outcomes for Alice Johnson (attempt 1)
(11, 1, 1, 1, '2025-01-14 09:00:00', '2025-01-15', '2025-01-15', '2025-01-15', 'complete', b'0', 'call', 'followup', 1, 'Initial contact - very positive', b'0'),
(12, 1, 1, 1, '2025-01-17 09:00:00', '2025-01-17', '2025-01-17', '2025-01-20', 'complete', b'0', 'email', 'followup', 1, 'Sent proposal outline', b'0'),

-- Completed reminders for Bob Martinez (attempt 2)
(13, 2, 2, 1, '2025-01-09 09:00:00', '2025-01-10', NULL, '2025-01-10', 'complete', b'0', 'call', 'no_answer', 1, 'Left voicemail, awaiting callback', b'0'),
(14, 2, 2, 1, '2025-01-15 09:00:00', '2025-01-15', '2025-01-15', '2025-01-18', 'complete', b'0', 'text', 'followup', 1, 'Confirmed interest via text', b'0'),

-- Completed reminders for Carol Chen (attempt 3)
(15, 3, 3, 1, '2025-01-04 09:00:00', '2025-01-05', '2025-01-06', '2025-01-06', 'complete', b'0', 'email', 'followup', 1, 'Sent introductory email', b'0'),

-- Completed reminders for Frank Rodriguez (attempt 12) - abandoned
(16, 6, 12, 1, '2024-11-30 09:00:00', '2024-12-01', NULL, '2024-12-01', 'complete', b'0', 'call', 'no_answer', 1, 'No answer', b'0'),
(17, 6, 12, 1, '2024-12-04 09:00:00', '2024-12-05', NULL, '2024-12-05', 'complete', b'0', 'email', 'no_answer', 2, 'No response to email', b'0'),
(18, 6, 12, 1, '2024-12-09 09:00:00', '2024-12-10', NULL, '2024-12-10', 'complete', b'0', 'call', 'no_answer', 3, 'Still no answer', b'0'),
(19, 6, 12, 1, '2024-12-14 09:00:00', '2024-12-15', NULL, '2024-12-15', 'complete', b'0', 'call', 'no_answer', 4, 'No response after multiple attempts', b'0'),

-- Completed reminders for Grace Taylor (attempt 6)
(20, 7, 6, 1, '2025-01-19 09:00:00', '2025-01-20', '2025-01-20', '2025-01-20', 'complete', b'0', 'call', 'followup', 1, 'Great conversation, wants proposal', b'0'),

-- Completed reminders for Isabella Brown (attempt 8) - booked
(21, 9, 8, 1, '2025-01-11 09:00:00', '2025-01-12', '2025-01-12', '2025-01-12', 'complete', b'0', 'call', 'followup', 1, 'Initial meeting went great', b'0'),
(22, 9, 8, 1, '2025-01-18 09:00:00', '2025-01-19', '2025-01-19', '2025-01-19', 'complete', b'0', 'email', 'booked', 2, 'Appointment confirmed!', b'0'),

-- Completed reminder for Kevin White (attempt 10)
(23, 11, 10, 1, '2025-01-19 09:00:00', '2025-01-20', '2025-01-21', '2025-01-24', 'complete', b'0', 'email', 'followup', 1, 'Initial email sent', b'0');

-- Laura Garcia (attempt 11) - High priority, not yet contacted (only pending reminder)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- --------------------------------------------------------
-- Seed data loaded successfully
-- Demo user can log in with:
-- Email: demo@clientbase.com
-- Password: DemoPass@123
-- --------------------------------------------------------