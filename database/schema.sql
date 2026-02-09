-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.0.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for clientbase
CREATE DATABASE IF NOT EXISTS `clientbase` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `clientbase`;

-- Dumping structure for table clientbase.appointment_attempts
CREATE TABLE IF NOT EXISTS `appointment_attempts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned DEFAULT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `status` enum('active','resolved','stale','abandoned') DEFAULT 'active',
  `outcome` enum('booked','declined','waiting','followup','no_answer','none') DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `first_reminder_sent_at` datetime DEFAULT NULL,
  `outcome_set_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `total_reminders_sent` smallint(6) NOT NULL DEFAULT 0,
  `is_legacy` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `fk-attempts-user` (`user_id`),
  KEY `fk-attempts-client` (`client_id`),
  CONSTRAINT `fk-attempts-client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `fk-attempts-user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table clientbase.clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `public_id` uuid NOT NULL DEFAULT uuid(),
  `user_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `addressLine1` varchar(150) DEFAULT NULL,
  `addressLine2` varchar(150) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `postcode` varchar(10) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `createdAt` date NOT NULL DEFAULT current_timestamp(),
  `lastContact` date DEFAULT NULL,
  `nextFollowup` date DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `source` enum('website','referral','social media','advertisement','walk-in','cold outreach','networking event','other') DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `status` enum('pending','active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `public_id` (`public_id`),
  KEY `FK-clients-user` (`user_id`),
  CONSTRAINT `FK-clients-user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='This table will contain client details';

-- Data exporting was unselected.

-- Dumping structure for table clientbase.reminders
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned DEFAULT NULL,
  `appointment_attempt_id` int(11) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `rDate` date NOT NULL,
  `respondedAt` date DEFAULT NULL,
  `completedAt` date DEFAULT NULL,
  `status` enum('pending','complete') DEFAULT NULL,
  `important` bit(1) DEFAULT NULL,
  `method` enum('call','text','email','ignored') DEFAULT NULL,
  `outcome` enum('booked','followup','no_answer','declined','waiting','none') DEFAULT NULL,
  `reminderCount` smallint(5) unsigned NOT NULL DEFAULT 0,
  `note` varchar(150) DEFAULT NULL,
  `is_legacy` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  KEY `fk-reminders-attempt` (`appointment_attempt_id`),
  KEY `fk-reminders-client` (`client_id`),
  KEY `fk-reminders-user` (`user_id`),
  CONSTRAINT `fk-reminders-attempt` FOREIGN KEY (`appointment_attempt_id`) REFERENCES `appointment_attempts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk-reminders-client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `fk-reminders-user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='This table will contain the dates to remind user to contact or meet with clients';

-- Data exporting was unselected.

-- Dumping structure for table clientbase.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `email_verified` bit(1) NOT NULL DEFAULT b'0',
  `isDev` bit(1) DEFAULT b'0',
  `password_hash` varchar(250) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `subscription_status` varchar(50) DEFAULT NULL,
  `subscription_tier` varchar(50) DEFAULT NULL,
  `subscription_start` timestamp NULL DEFAULT NULL,
  `subscription_end` timestamp NULL DEFAULT NULL,
  `subscription_canceled_at` timestamp NULL DEFAULT NULL,
  `trial_start` timestamp NULL DEFAULT NULL,
  `trial_end` timestamp NULL DEFAULT NULL,
  `last_payment_at` timestamp NULL DEFAULT NULL,
  `last_payment_failed_at` timestamp NULL DEFAULT NULL,
  `next_billing_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `stripe_customer_id` (`stripe_customer_id`),
  UNIQUE KEY `stripe_subscription_id` (`stripe_subscription_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
