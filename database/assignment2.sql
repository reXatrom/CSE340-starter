-- 1. Insert a new record into the account table
INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');



-- 2. Update Tony Stark's account_type to Admin
UPDATE account
SET account_type = 'Admin'
WHERE email = 'tony@starkent.com';



-- 3. Delete Tony Stark's account
DELETE FROM account
WHERE email = 'tony@starkent.com';




-- 4. Update GM Hummer description using REPLACE()
UPDATE vehicle
SET inv_description = REPLACE(inv_description, 'small interiors', 'Hummer', 'H1')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';



-- 5. Select make, model, and classification for sport vehicles
SELECT 
    inv_make, 
    inv_model, 
    classification_name
FROM vehicle
INNER JOIN classification
    ON vehicle.classification_id = classification.classification_id
WHERE classification_name = 'Sport';



-- 6. Add '/vehicles' into image and thumbnail paths
UPDATE images
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles');
