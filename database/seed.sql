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

-- Clear existing data (in correct order to respect foreign keys)
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `interactions`;
TRUNCATE TABLE `reminders`;
TRUNCATE TABLE `clients`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `settings`;
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
-- Demo Reminders (all for demo user)
-- --------------------------------------------------------

INSERT INTO `reminders` (`id`, `client_id`, `user_id`, `rDate`, `status`, `important`, `outcome`, `reminderCount`, `note`) VALUES
-- Active reminders (pending status)
(1, 1, 1, '2025-01-27', 'pending', b'1', NULL, 1, 'Follow up on proposal discussion'),
(2, 2, 1, '2025-01-28', 'pending', b'0', NULL, 2, 'Send contract details'),
(3, 3, 1, '2025-01-30', 'pending', b'1', NULL, 1, 'Schedule demo call'),
(4, 5, 1, '2025-01-29', 'pending', b'0', NULL, 1, 'Initial outreach - introduce services'),
(5, 7, 1, '2025-02-05', 'pending', b'1', NULL, 1, 'Warm referral follow-up'),
(6, 8, 1, '2025-02-01', 'pending', b'0', NULL, 2, 'Check interest level'),
(7, 9, 1, '2025-01-26', 'pending', b'1', NULL, 2, 'Ready to close - send contract'),
(8, 10, 1, '2025-01-31', 'pending', b'0', NULL, 1, 'Send pricing information'),
(9, 11, 1, '2025-02-07', 'pending', b'0', NULL, 1, 'Follow up on web inquiry'),
(10, 12, 1, '2025-01-28', 'pending', b'1', NULL, 1, 'High priority - make first contact'),

-- Completed reminders with outcomes
(11, 1, 1, '2025-01-15', 'complete', b'0', 'followup', 1, 'Initial contact - very positive'),
(12, 2, 1, '2025-01-10', 'complete', b'0', 'followup', 1, 'Left voicemail, awaiting callback'),
(13, 3, 1, '2025-01-05', 'complete', b'0', 'followup', 1, 'Sent introductory email'),
(14, 6, 1, '2024-12-15', 'complete', b'0', 'end_attempt', 3, 'No response after multiple attempts'),
(15, 7, 1, '2025-01-20', 'complete', b'0', 'followup', 1, 'Great conversation, wants proposal'),
(16, 9, 1, '2025-01-12', 'complete', b'0', 'followup', 1, 'Initial meeting went great'),
(17, 11, 1, '2025-01-20', 'complete', b'0', 'followup', 1, 'Initial email sent');

-- --------------------------------------------------------
-- Demo Interactions (all for demo user)
-- --------------------------------------------------------

INSERT INTO `interactions` (`id`, `client_id`, `reminder_id`, `user_id`, `method`, `outcome`, `createdAt`, `respondedAt`) VALUES
-- Alice Johnson (client_id=1) - Active engagement
(1, 1, 11, 1, 'call', 'followup', '2025-01-15', '2025-01-15'),
(2, 1, 11, 1, 'email', 'followup', '2025-01-16', '2025-01-17'),
(3, 1, 1, 1, 'call', 'followup', '2025-01-20', '2025-01-20'),
(4, 1, 11, 1, 'text', 'followup', '2025-01-14', '2025-01-14'),

-- Bob Martinez (client_id=2) - Mixed engagement
(5, 2, 12, 1, 'call', 'no_answer', '2025-01-10', NULL),
(6, 2, 12, 1, 'text', 'followup', '2025-01-12', '2025-01-13'),
(7, 2, 2, 1, 'call', 'followup', '2025-01-18', '2025-01-18'),
(8, 2, 12, 1, 'email', 'followup', '2025-01-11', '2025-01-12'),

-- Carol Chen (client_id=3) - Email-focused
(9, 3, 13, 1, 'email', 'followup', '2025-01-05', '2025-01-06'),
(10, 3, 3, 1, 'email', 'followup', '2025-01-15', '2025-01-16'),
(11, 3, 13, 1, 'call', 'no_answer', '2025-01-04', NULL),

-- Frank Rodriguez (client_id=6) - Failed attempts
(12, 6, 14, 1, 'call', 'no_answer', '2024-12-01', NULL),
(13, 6, 14, 1, 'email', 'no_answer', '2024-12-05', NULL),
(14, 6, 14, 1, 'call', 'no_answer', '2024-12-10', NULL),
(15, 6, 14, 1, 'call', 'end_attempt', '2024-12-15', NULL),

-- Grace Taylor (client_id=7) - Recent positive engagement
(16, 7, 15, 1, 'call', 'followup', '2025-01-20', '2025-01-20'),
(17, 7, 5, 1, 'email', 'followup', '2025-01-22', '2025-01-23'),

-- Henry Lee (client_id=8) - Walk-in client
(18, 8, 6, 1, 'call', 'followup', '2025-01-25', '2025-01-25'),

-- Isabella Brown (client_id=9) - Hot lead
(19, 9, 16, 1, 'call', 'followup', '2025-01-12', '2025-01-12'),
(20, 9, 7, 1, 'email', 'booked', '2025-01-19', '2025-01-19'),

-- Jack Anderson (client_id=10) - Building interest
(21, 10, 8, 1, 'email', 'followup', '2025-01-17', '2025-01-18'),

-- Kevin White (client_id=11) - New inquiry
(22, 11, 17, 1, 'email', 'followup', '2025-01-20', '2025-01-21');

-- Laura Garcia (client_id=12) - High priority, not yet contacted
-- No interactions yet for this reminder

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