create table categories(
	id int auto_increment primary key,
	name varchar(50) not null unique
);

create table users(
	id int auto_increment primary key,
    username varchar(50) not null unique,
    email varchar(50) not null unique,
    password varchar(50) not null,
    role enum('user', 'admin') default 'user',
    created_at datetime default current_timestamp
);

create table activities(
	id int auto_increment primary key,
    title varchar(50) not null,
    description text,
    location varchar(100),
    activity_date datetime,
    max_participants int,
    cover_image varchar(255),
    created_at datetime default current_timestamp,
    category_id int,
    created_by int not null,
    
    foreign key (category_id) references categories(id) on delete set null,
    foreign key (created_by) references users(id) on delete cascade
);

create table participations(
	id int auto_increment primary key,
	user_id int not null unique,
    activity_id int not null unique,
    joined_at datetime default current_timestamp,
    
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (activity_id) references activities(id) on delete cascade
);
