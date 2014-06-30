-- phpMyAdmin SQL Dump
-- version 4.2.2deb2
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Июл 01 2014 г., 00:50
-- Версия сервера: 5.5.37-1
-- Версия PHP: 5.6.0beta4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `crm`
--

-- --------------------------------------------------------

--
-- Структура таблицы `leed`
--

CREATE TABLE IF NOT EXISTS `leed` (
`id` int(11) unsigned NOT NULL,
  `project_id` int(11) unsigned NOT NULL,
  `leed_status_id` int(11) unsigned NOT NULL,
  `leed_type_id` int(11) unsigned NOT NULL,
  `date_added` datetime NOT NULL,
  `date_processing` datetime NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `leed_status`
--

CREATE TABLE IF NOT EXISTS `leed_status` (
`id` int(11) unsigned NOT NULL,
  `project_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `leed_type`
--

CREATE TABLE IF NOT EXISTS `leed_type` (
`id` int(11) unsigned NOT NULL,
  `project_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `permission`
--

CREATE TABLE IF NOT EXISTS `permission` (
`id` int(11) unsigned NOT NULL,
  `permission_type_id` int(111) unsigned NOT NULL,
  `abbr` varchar(255) NOT NULL,
  `note` text NOT NULL,
  `value` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `forse` tinyint(1) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `permission_type`
--

CREATE TABLE IF NOT EXISTS `permission_type` (
`id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `project`
--

CREATE TABLE IF NOT EXISTS `project` (
`id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'project owner',
  `name` varchar(255) NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

--
-- Дамп данных таблицы `project`
--

INSERT INTO `project` (`id`, `user_id`, `name`, `note`) VALUES
(9, 56, '123', ''),
(10, 56, '123', '');

-- --------------------------------------------------------

--
-- Структура таблицы `project__user`
--

CREATE TABLE IF NOT EXISTS `project__user` (
`id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `project_id` int(10) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(10) unsigned NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `dbx_token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `user_role`
--

CREATE TABLE IF NOT EXISTS `user_role` (
`id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `user_role__permission`
--

CREATE TABLE IF NOT EXISTS `user_role__permission` (
`id` int(11) unsigned NOT NULL,
  `permission_id` int(11) NOT NULL,
  `user_role_id` int(11) NOT NULL,
  `date_added` datetime NOT NULL,
  `date_expiration` datetime NOT NULL,
  `value` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `user__permission`
--

CREATE TABLE IF NOT EXISTS `user__permission` (
`id` int(11) unsigned NOT NULL,
  `permission_id` int(11) unsigned NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_added` datetime NOT NULL,
  `date_expiration` datetime NOT NULL,
  `value` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 AUTO_INCREMENT=1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `leed`
--
ALTER TABLE `leed`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leed_status`
--
ALTER TABLE `leed_status`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leed_type`
--
ALTER TABLE `leed_type`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission_type`
--
ALTER TABLE `permission_type`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project__user`
--
ALTER TABLE `project__user`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_role__permission`
--
ALTER TABLE `user_role__permission`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user__permission`
--
ALTER TABLE `user__permission`
 ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `leed`
--
ALTER TABLE `leed`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `leed_status`
--
ALTER TABLE `leed_status`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `leed_type`
--
ALTER TABLE `leed_type`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `permission_type`
--
ALTER TABLE `permission_type`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `project__user`
--
ALTER TABLE `project__user`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_role`
--
ALTER TABLE `user_role`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user_role__permission`
--
ALTER TABLE `user_role__permission`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user__permission`
--
ALTER TABLE `user__permission`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
