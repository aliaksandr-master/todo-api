-- phpMyAdmin SQL Dump
-- version 4.1.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 19, 2014 at 02:45 PM
-- Server version: 5.5.33-1
-- PHP Version: 5.5.8-2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `listslider`
--

-- --------------------------------------------------------

--
-- Table structure for table `access`
--

CREATE TABLE IF NOT EXISTS `access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `rel__user_group__access`
--

CREATE TABLE IF NOT EXISTS `rel__user_group__access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `access_id` int(11) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `rel__user__access`
--

CREATE TABLE IF NOT EXISTS `rel__user__access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `access_id` int(11) NOT NULL,
  `date_activation` datetime DEFAULT NULL,
  `date_expiration` datetime DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `todo`
--

CREATE TABLE IF NOT EXISTS `todo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date_create` datetime NOT NULL,
  `link` varchar(255) NOT NULL,
  `is_shared` tinyint(4) NOT NULL DEFAULT '0',
  `sort_order` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `todo_FK_1` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=22 ;

--
-- Dumping data for table `todo`
--

INSERT INTO `todo` (`id`, `user_id`, `name`, `date_create`, `link`, `is_shared`, `sort_order`) VALUES
(1, 1, 'Test todo list 1', '2014-01-05 16:39:27', '', 0, 0),
(2, 1, 'Test todo list 2', '2014-01-05 16:00:00', '', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `todo_item`
--

CREATE TABLE IF NOT EXISTS `todo_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `todo_id` int(11) NOT NULL,
  `name` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `date_create` datetime NOT NULL,
  `sort_order` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `todo_item_FI_1` (`todo_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `todo_item`
--

INSERT INTO `todo_item` (`id`, `todo_id`, `name`, `is_active`, `date_create`, `sort_order`) VALUES
(1, 1, 'first', 1, '2014-01-05 17:00:00', 0),
(2, 1, 'second', 1, '2014-01-05 17:13:00', 0),
(5, 1, 'third', 1, '2014-01-05 06:23:17', 0),
(6, 1, 'six', 1, '2014-01-05 06:23:30', 0),
(7, 1, 'six', 1, '2014-01-05 06:23:32', 0),
(8, 2, 'apple', 1, '2014-01-05 06:25:16', 0),
(9, 2, 'banana', 1, '2014-01-05 06:25:22', 0),
(10, 2, 'Orange', 1, '2014-01-05 18:26:24', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `date_register` datetime NOT NULL,
  `email` varchar(55) NOT NULL,
  `activated` tinyint(1) NOT NULL,
  `activation_code` varchar(55) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=17 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`, `date_register`, `email`, `activated`, `activation_code`) VALUES
(1, 'test', '4297f44b13955235245b2497399d7a93', '2013-12-29 06:56:48', 'test@mail.com', 1, 'c65f722aa22c12ab39101441bd4ad37f9c30aeb8'),
(2, 'Vladimir', '4297f44b13955235245b2497399d7a93', '2013-12-17 15:43:40', 'vladimir@google.com', 1, '03cbc1ffdd2487c90bfd1130756217d483b35dc3');

-- --------------------------------------------------------

--
-- Table structure for table `user_group`
--

CREATE TABLE IF NOT EXISTS `user_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `todo`
--
ALTER TABLE `todo`
  ADD CONSTRAINT `todo_FK_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `todo_item`
--
ALTER TABLE `todo_item`
  ADD CONSTRAINT `todo_item_FK_1` FOREIGN KEY (`todo_id`) REFERENCES `todo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
  
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;