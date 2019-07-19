DROP database IF exists paint;
CREATE database paint;
USE paint;

CREATE TABLE users(
	username VARCHAR(20) not null,
	password VARCHAR(40) not null,
    sessionId VARCHAR(50),
    primary key(username)
);

CREATE TABLE paintings(
	username VARCHAR(20) not null,
	name varchar(100) not null,	
    painting json not null,
    primary key(username, name)
);