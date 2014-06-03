-- phpMyAdmin SQL Dump
-- version 4.2.1deb1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Июн 04 2014 г., 00:46
-- Версия сервера: 5.5.37-1
-- Версия PHP: 5.5.12-2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `listslider_test`
--

-- --------------------------------------------------------

--
-- Структура таблицы `test`
--

CREATE TABLE IF NOT EXISTS `test` (
`id` int(11) unsigned NOT NULL,
  `some_text` text NOT NULL,
  `some_string` varchar(255) NOT NULL,
  `some_bool` tinyint(1) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=54 ;

--
-- Дамп данных таблицы `test`
--

INSERT INTO `test` (`id`, `some_text`, `some_string`, `some_bool`) VALUES
(11, '123', '123123', 1),
(12, 'sadf asdf as', '123123', 1),
(13, 'sadf asdf as', '123123', 1),
(14, 'sadf asdf as', '123123', 1),
(15, 'sadf asdf as', '123123', 1),
(16, 'sadf asdf as', '123123', 1),
(17, 'sadf asdf as', '123123', 1),
(18, 'sadf asdf as', '123123', 1),
(19, 'sadf asdf as', '123123', 1),
(20, 'sadf asdf as', '123123', 1),
(21, 'sadf asdf as', '123123', 1),
(22, 'sadf asdf as', '123123', 1),
(23, 'sadf asdf as', '123123', 1),
(24, 'sadf asdf as', '123123', 1),
(25, 'sadf asdf as', '123123', 1),
(26, 'sadf asdf as', '123123', 1),
(27, 'sadf asdf as', '123123', 1),
(28, 'sadf asdf as', '123123', 1),
(29, 'sadf asdf as', '123123', 1),
(30, 'sadf asdf as', '123123', 1),
(31, 'sadf asdf as', '123123', 1),
(32, 'sadf asdf as', '123123', 1),
(33, 'sadf asdf as', '123123', 1),
(34, 'sadf asdf as', '123123', 1),
(35, 'sadf asdf as', '123123', 1),
(36, 'sadf asdf as', '123123', 1),
(37, 'sadf asdf as', '123123', 1),
(38, 'sadf asdf as', '123123', 1),
(39, 'sadf asdf as', '123123', 1),
(40, 'sadf asdf as', '123123', 1),
(41, 'sadf asdf as', '123123', 1),
(42, 'sadf asdf as', '123123', 1),
(43, 'sadf asdf as', '123123', 1),
(44, 'sadf asdf as', '123123', 1),
(45, 'sadf asdf as', '123123', 1),
(46, 'sadf asdf as', '123123', 1),
(47, 'sadf asdf as', '123123', 1),
(48, 'sadf asdf as', '123123', 1),
(49, 'sadf asdf as', '123123', 1),
(50, 'sadf asdf as', '123123', 1),
(51, 'sadf asdf as', '123123', 1),
(52, 'sadf asdf as', '123123', 1),
(53, 'sadf asdf as', '123123', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `test`
--
ALTER TABLE `test`
 ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `test`
--
ALTER TABLE `test`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=54;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
