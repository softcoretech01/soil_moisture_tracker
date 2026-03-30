-- CREATE DATABASE IF NOT EXISTS soil_moisture_db;
-- USE soil_moisture_db;

CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    Role VARCHAR(50) DEFAULT 'User'
);

CREATE TABLE IF NOT EXISTS Fields (
    FieldID INT AUTO_INCREMENT PRIMARY KEY,
    FieldName VARCHAR(100) NOT NULL,
    Description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS MoistureLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    FieldID INT NOT NULL,
    LogDate DATE NOT NULL,
    MoistureLevel DECIMAL(5,2) NOT NULL,
    UserID INT NOT NULL,
    FOREIGN KEY (FieldID) REFERENCES Fields(FieldID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    UNIQUE KEY UNQ_Field_Date (FieldID, LogDate)
);

-- Insert Default Admin
INSERT IGNORE INTO Users (Username, Password, Role) VALUES ('admin', 'admin123', 'Admin');


DELIMITER $$

DROP PROCEDURE IF EXISTS proc_ManageUsers$$
CREATE PROCEDURE proc_ManageUsers(
    IN p_Action VARCHAR(50),
    IN p_UserID INT,
    IN p_Username VARCHAR(100),
    IN p_Password VARCHAR(100),
    IN p_Role VARCHAR(50)
)
BEGIN
    IF p_Action = 'SELECT_ALL' THEN
        SELECT UserID, Username, Role FROM Users;
    ELSEIF p_Action = 'SELECT_ONE' THEN
        SELECT UserID, Username, Role FROM Users WHERE UserID = p_UserID;
    ELSEIF p_Action = 'INSERT' THEN
        INSERT INTO Users (Username, Password, Role) VALUES (p_Username, p_Password, IFNULL(p_Role, 'User'));
        SELECT LAST_INSERT_ID() AS UserID;
    ELSEIF p_Action = 'UPDATE' THEN
        UPDATE Users SET 
            Username = IFNULL(p_Username, Username),
            Password = IFNULL(p_Password, Password),
            Role = IFNULL(p_Role, Role)
        WHERE UserID = p_UserID;
    ELSEIF p_Action = 'DELETE' THEN
        DELETE FROM Users WHERE UserID = p_UserID;
    END IF;
END$$


DROP PROCEDURE IF EXISTS proc_ManageFields$$
CREATE PROCEDURE proc_ManageFields(
    IN p_Action VARCHAR(50),
    IN p_FieldID INT,
    IN p_FieldName VARCHAR(100),
    IN p_Description VARCHAR(255)
)
BEGIN
    IF p_Action = 'SELECT_ALL' THEN
        SELECT FieldID, FieldName, Description FROM Fields;
    ELSEIF p_Action = 'SELECT_ONE' THEN
        SELECT FieldID, FieldName, Description FROM Fields WHERE FieldID = p_FieldID;
    ELSEIF p_Action = 'INSERT' THEN
        INSERT INTO Fields (FieldName, Description) VALUES (p_FieldName, p_Description);
        SELECT LAST_INSERT_ID() AS FieldID;
    ELSEIF p_Action = 'UPDATE' THEN
        UPDATE Fields SET 
            FieldName = IFNULL(p_FieldName, FieldName),
            Description = IFNULL(p_Description, Description)
        WHERE FieldID = p_FieldID;
    ELSEIF p_Action = 'DELETE' THEN
        DELETE FROM Fields WHERE FieldID = p_FieldID;
    END IF;
END$$


DROP PROCEDURE IF EXISTS proc_ManageMoistureLogs$$
CREATE PROCEDURE proc_ManageMoistureLogs(
    IN p_Action VARCHAR(50),
    IN p_LogID INT,
    IN p_FieldID INT,
    IN p_LogDate DATE,
    IN p_MoistureLevel DECIMAL(5,2),
    IN p_UserID INT
)
BEGIN
    IF p_Action = 'SELECT_BY_DATE' THEN
        SELECT 
            f.FieldID, 
            f.FieldName, 
            m.LogID, 
            m.LogDate, 
            m.MoistureLevel, 
            m.UserID
        FROM Fields f
        LEFT JOIN MoistureLogs m ON f.FieldID = m.FieldID AND m.LogDate = p_LogDate;
    ELSEIF p_Action = 'UPSERT' THEN
        IF EXISTS (SELECT 1 FROM MoistureLogs WHERE FieldID = p_FieldID AND LogDate = p_LogDate) THEN
            UPDATE MoistureLogs SET 
                MoistureLevel = p_MoistureLevel,
                UserID = p_UserID
            WHERE FieldID = p_FieldID AND LogDate = p_LogDate;
            SELECT LogID FROM MoistureLogs WHERE FieldID = p_FieldID AND LogDate = p_LogDate;
        ELSE
            INSERT INTO MoistureLogs (FieldID, LogDate, MoistureLevel, UserID) 
            VALUES (p_FieldID, p_LogDate, p_MoistureLevel, p_UserID);
            SELECT LAST_INSERT_ID() AS LogID;
        END IF;
    ELSEIF p_Action = 'DELETE' THEN
        DELETE FROM MoistureLogs WHERE LogID = p_LogID;
    END IF;
END$$


DROP PROCEDURE IF EXISTS proc_GetAnalytics$$
CREATE PROCEDURE proc_GetAnalytics(
    IN p_StartDate DATE,
    IN p_EndDate DATE
)
BEGIN
    SELECT 
        f.FieldID,
        f.FieldName,
        IFNULL(AVG(m.MoistureLevel), 0) AS AverageMoisture,
        COUNT(m.LogID) AS TotalLogs
    FROM Fields f
    LEFT JOIN MoistureLogs m ON f.FieldID = m.FieldID
    WHERE (p_StartDate IS NULL OR m.LogDate >= p_StartDate)
      AND (p_EndDate IS NULL OR m.LogDate <= p_EndDate)
    GROUP BY f.FieldID, f.FieldName
    ORDER BY f.FieldName;
END$$

DELIMITER ;
