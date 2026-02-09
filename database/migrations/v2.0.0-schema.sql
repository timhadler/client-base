-- --------------------------------------------------------
-- Host:                         34.83.194.187
-- Server version:               10.11.14-MariaDB-0+deb12u2 - Debian 12
-- Server OS:                    debian-linux-gnu
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

-- Dumping structure for table clientbase.clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `mobile` varchar(30) DEFAULT NULL,
  `home` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `suburb` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postcode` varchar(10) DEFAULT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11675 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='This table will contain client details';

-- Data exporting was unselected.

-- Dumping structure for table clientbase.interactions
CREATE TABLE IF NOT EXISTS `interactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned DEFAULT NULL,
  `reminder_id` int(11) unsigned DEFAULT NULL,
  `interaction` varchar(16) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22541 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

-- Dumping structure for table clientbase.notes
CREATE TABLE IF NOT EXISTS `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned NOT NULL,
  `note` varchar(150) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1132 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

-- Dumping structure for table clientbase.reminders
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `rDate` date NOT NULL,
  `client_id` int(11) unsigned NOT NULL,
  `status` varchar(10) DEFAULT 'call',
  `flag` tinyint(4) DEFAULT NULL,
  `outcome` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19181 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='This table will contain the dates to remind user to contact or meet with clients';

-- Data exporting was unselected.

-- Dumping structure for table clientbase.settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

-- Dumping structure for table clientbase.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `password` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
