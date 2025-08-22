-- $1 first_name
drop type if exists hue cascade;

create type hue as enum ('black', 'white', 'red');
drop table if exists persona cascade;
create table
  persona (
    first_name text not null,
    last_name text not null,
    colour hue
  ) tablespace pg_default;
insert into persona values ($1, 'Colman', 'white');
select first_name, last_name, colour::TEXT from persona;