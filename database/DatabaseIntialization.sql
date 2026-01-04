use happytails;
-- Reset or clear existing types if necessary
-- SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE PetTypes; SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `PetTypes` (`name`) VALUES ('Dog'), ('Cat');

INSERT INTO `PetBreeds` (`name`, `type_id`) VALUES 
('Golden Retriever', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Indie / Indian Pariah', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Beagle', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Persian', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Siamese', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Labrador Retriever', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('German Shepherd', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Pug', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Rottweiler', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Cocker Spaniel', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Shih Tzu', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Doberman', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Rajapalayam', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Mudhol Hound', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Chippiparai', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Kanni', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Combai', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Gaddi Kutta (Himalayan Sheepdog)', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Rampur Greyhound', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Bakharwal Dog', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Jonangi', (SELECT id FROM PetTypes WHERE name = 'Dog')),
('Pandikona', (SELECT id FROM PetTypes WHERE name = 'Dog'));

INSERT INTO `PetBreeds` (`name`, `type_id`) VALUES 
('Maine Coon', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Bengal', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Himalayan', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Bombay Cat', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('British Shorthair', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Indian Community Cat (Indie)', (SELECT id FROM PetTypes WHERE name = 'Cat')),
('Spotted Cat', (SELECT id FROM PetTypes WHERE name = 'Cat'));

USE happytails;

INSERT INTO CompatibilityTags (name) VALUES 
-- Social
('Good with Kids'),
('Good with Dogs'),
('Good with Cats'),
('Solo Pet Only'),
('Adults Only'),
('Bonded Pair'),

-- Living Environment
('Apartment Friendly'),
('Needs Fenced Yard'),
('Indoor Only'),
('Farm/Rural Suited'),
('Quiet Home Required'),

-- Energy Level
('High Energy'),
('Moderate Energy'),
('Couch Potato'),
('Working Breed'),

-- Experience & Training
('Good for Beginners'),
('Experienced Owner Required'),
('Leash Trained'),
('Crate Trained'),
('House Trained'),

-- Health & Traits
('Hypoallergenic'),
('Special Needs'),
('Deaf / Blind'),
('Sheds Heavily'),
('Vocal / Barker');