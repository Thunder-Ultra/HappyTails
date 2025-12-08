CREATE DATABASE IF NOT EXISTS `happytails`;

USE `happytails`;

CREATE TABLE `happytails`.`Addresses` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`house_no` VARCHAR(50),
	`street` VARCHAR(100),
	`landmark` VARCHAR(100),
	`pincode` VARCHAR(20),
	`town_city` VARCHAR(100),
	`state` VARCHAR(100)
);

CREATE TABLE `happytails`.`Users` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50),
	`email` VARCHAR(100) NOT NULL,
	`is_admin` ENUM('Yes', 'No') DEFAULT "No",
	`password_hash` VARCHAR(100),
	`address_id` INT UNSIGNED,
	`profile_pic_name` VARCHAR(255),
	`joined_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `stays_at` FOREIGN KEY (`address_id`) REFERENCES `happytails`.`Addresses`(`id`)
);

CREATE TABLE `happytails`.`PetTypes` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50)
);

CREATE TABLE `happytails`.`PetBreeds` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50),
	`type_id` INT UNSIGNED,
	CONSTRAINT `is_f_brd` FOREIGN KEY (`type_id`) REFERENCES `happytails`.`PetTypes`(`id`)
);

CREATE TABLE `happytails`.`Pets` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50),
	`gender` ENUM('Male', 'Female'),
	`breed_id` INT UNSIGNED,
	`type_id` INT UNSIGNED,
	`dob` TIMESTAMP,
	`de_wormed` ENUM('Yes', 'No', 'Unknown'),
	`vaccinated` ENUM('Yes', 'No', 'Partially', 'Unknown'),
	`last_vaccine_date` TIMESTAMP,
	`sterilized` ENUM('Yes', 'No'),
	`parent_id` INT UNSIGNED,
	`pet_pic_name` VARCHAR(255),
	`address_id` INT UNSIGNED,
	CONSTRAINT `Owns` FOREIGN KEY (`parent_id`) REFERENCES `happytails`.`Users`(`id`),
	CONSTRAINT `pt_brd` FOREIGN KEY (`breed_id`) REFERENCES `happytails`.`PetBreeds`(`id`),
	CONSTRAINT `pt_typ` FOREIGN KEY (`type_id`) REFERENCES `happytails`.`PetTypes`(`id`),
	CONSTRAINT `pet_stays_at` FOREIGN KEY (`address_id`) REFERENCES `happytails`.`Addresses`(`id`)
);

CREATE TABLE `happytails`.`Adoptables` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50),
	`caretaker_id` INT UNSIGNED,
	`address_id` INT UNSIGNED,
	`breed_id` INT UNSIGNED,
	`type_id` INT UNSIGNED,
	`gender` ENUM('Male', 'Female'),
	`dob` TIMESTAMP,
	`weight_kg` DECIMAL(5,2),
	`description` TEXT,
	`sterilized` ENUM('Yes', 'No', 'Unknown'),
	`vaccinated` ENUM('Yes', 'No', 'Partially', 'Unknown'),
	`last_vaccine_date` TIMESTAMP,
	`de_wormed` ENUM('Yes', 'No', 'Unknown'),
	`house_trained` ENUM('Yes', 'No', 'In-Training'),
	`status` ENUM('Available', 'Adopted', 'Hold'),
	`added_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `psts` FOREIGN KEY (`caretaker_id`) REFERENCES `happytails`.`Users`(`id`),
	CONSTRAINT `adptbl_brd` FOREIGN KEY (`breed_id`) REFERENCES `happytails`.`PetBreeds`(`id`),
	CONSTRAINT `catergorizes` FOREIGN KEY (`type_id`) REFERENCES `happytails`.`PetTypes`(`id`),
	CONSTRAINT `adoptable_stays_at` FOREIGN KEY (`address_id`) REFERENCES `happytails`.`Addresses`(`id`)
);

CREATE TABLE `happytails`.`AdoptionRequests` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`adoptable_id` INT UNSIGNED,
	`adopter_id` INT UNSIGNED,
	`status` ENUM('Pending', 'Interviewing', 'Approved', 'Rejected') DEFAULT "Pending",
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`message` TEXT,
	CONSTRAINT `ar_rqstd` FOREIGN KEY (`adoptable_id`) REFERENCES `happytails`.`Adoptables`(`id`),
	CONSTRAINT `makes_request` FOREIGN KEY (`adopter_id`) REFERENCES `happytails`.`Users`(`id`)
);

CREATE TABLE `happytails`.`AdoptableImages` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`adoptable_id` INT UNSIGNED,
	`filename` VARCHAR(255),
	`is_primary` TINYINT,
	`added_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `has_media` FOREIGN KEY (`adoptable_id`) REFERENCES `happytails`.`Adoptables`(`id`)
);

CREATE TABLE `happytails`.`Messages` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`adop_req_id` INT UNSIGNED,
	`sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`sender_id` INT UNSIGNED,
	`content` TEXT,
	`is_read` TINYINT,
	CONSTRAINT `sends_messages` FOREIGN KEY (`adop_req_id`) REFERENCES `happytails`.`AdoptionRequests`(`id`),
	CONSTRAINT `snds` FOREIGN KEY (`sender_id`) REFERENCES `happytails`.`Users`(`id`)
);

CREATE TABLE `happytails`.`PetMedicalRecords` (
	`id` INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`pet_id` INT UNSIGNED,
	`title` VARCHAR(100),
	`filename` VARCHAR(255) DEFAULT NULL,
	`added_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `has_medical_record` FOREIGN KEY (`pet_id`) REFERENCES `happytails`.`Pets`(`id`)
);

CREATE TABLE `happytails`.`PetHealthStats` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`pet_id` INT UNSIGNED,
	`type` ENUM('Height', 'Weight'),
	`value` DECIMAL(5,2) UNSIGNED DEFAULT 0,
	`added_on` TIMESTAMP,
	CONSTRAINT `hs_hlth_stt` FOREIGN KEY (`pet_id`) REFERENCES `happytails`.`Pets`(`id`)
);

CREATE TABLE `happytails`.`PetPreferences` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`user_id` INT UNSIGNED,
	`name` VARCHAR(100),
	`value` VARCHAR(100),
	CONSTRAINT `has` FOREIGN KEY (`user_id`) REFERENCES `happytails`.`Users`(`id`)
);

CREATE TABLE `happytails`.`CompatibilityTags` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(50)
);

CREATE TABLE `happytails`.`AdoptableCompatibility` (
	`id` INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`adoptable_id` INT UNSIGNED,
	`tag_id` INT UNSIGNED,
	UNIQUE (`adoptable_id` ASC, `tag_id` ASC),
	CONSTRAINT `has` FOREIGN KEY (`adoptable_id`) REFERENCES `happytails`.`Adoptables`(`id`),
	CONSTRAINT `compatible_with` FOREIGN KEY (`tag_id`) REFERENCES `happytails`.`CompatibilityTags`(`id`)
);
